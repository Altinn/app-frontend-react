import React, { useEffect, useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useCurrentDataElementId } from 'src/features/datamodel/useBindingSchema';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { type IUseLanguage, useLanguage } from 'src/hooks/useLanguage';
import { createStrictContext } from 'src/utils/createStrictContext';
import { useExprContext } from 'src/utils/layout/ExprContext';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { getDataValidationUrl } from 'src/utils/urls/appUrlHelper';
import {
  getValidationMessage,
  severityMap,
  shouldExcludeValidationIssue,
} from 'src/utils/validation/backendValidation';
import {
  buildValidationObject,
  unmappedError,
  useValidationContextGenerator,
} from 'src/utils/validation/validationHelpers';
import type { FieldValidations, ValidationContext, ValidationState } from 'src/features/validation/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';
import type {
  BackendValidationIssue,
  IValidationMessage,
  ValidationContextGenerator,
  ValidationSeverity,
} from 'src/utils/validation/types';
import type { IValidationOptions } from 'src/utils/validation/validation';

const [Provider, useContext] = createStrictContext<ValidationContext>({
  options: { name: 'ValidationContext' },
});

async function fetchValidations(
  validationUrl: string,
  resolvedNodes: LayoutPages,
  validationContextGenerator: ValidationContextGenerator,
): Promise<[FieldValidations, BackendValidationIssue[]]> {
  const backendValidations = httpGet(validationUrl);
  const frontendValidations = resolvedNodes.runValidations(validationContextGenerator);
  return [frontendValidations, await backendValidations];
}

export function ValidationProvider({ children }) {
  const resolvedNodes = useExprContext();
  const validationContextGenerator = useValidationContextGenerator();
  // const lastSavedFormData = useAppSelector((state) => state.formData.lastSavedFormData);
  const langTools = useLanguage();
  const instanceId = useAppSelector((state) => state.instanceData.instance?.id);
  const currentDataElementId = useCurrentDataElementId();
  const validationUrl =
    instanceId?.length && currentDataElementId?.length
      ? getDataValidationUrl(instanceId, currentDataElementId)
      : undefined;

  const [validations, setValidations] = useState<ValidationState>({ fields: {}, unmapped: {} });

  const { data: validationData } = useQuery({
    enabled: Boolean(validationUrl) && Boolean(resolvedNodes),
    queryKey: ['validation', instanceId, currentDataElementId],
    queryFn: () => fetchValidations(validationUrl!, resolvedNodes!, validationContextGenerator),
  });

  useEffect(() => {
    if (!validationData) {
      return;
    }
    const [frontendValidations, backendValidations] = validationData;
    const newState = mapValidationsToState(backendValidations, langTools);
    addFieldValidations(newState.fields, frontendValidations);
    setValidations(newState);

    /* Workaround, ideally, the logic that fetches validations should resolve text resources */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationData]);

  function validateNode(node: LayoutNode, options: IValidationOptions) {
    const newState = node.runValidations(validationContextGenerator, options);
    setValidations((prevState) => {
      addFieldValidations(prevState.fields, newState);
      return prevState;
    });
  }

  const out = {
    state: validations,
    methods: {
      validateNode,
    },
  };

  return <Provider value={out}>{children}</Provider>;
}

/**
 * Gives access to validation methods.
 */
export function useValidationMethods() {
  return useContext().methods;
}

/**
 * Returns all validation messages for a given node.
 */
export function useNodeValidations(node: LayoutNode) {
  const validations = useContext().state;

  return useMemo(() => {
    const validationMessages: IValidationMessage<ValidationSeverity>[] = [];
    if (!node.item.dataModelBindings) {
      return validationMessages;
    }
    for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
      if (!validations.fields[field]) {
        continue;
      }
      for (const group of Object.values(validations.fields[field])) {
        for (const validation of group.filter((v) => v.severity !== 'fixed')) {
          validationMessages.push(
            buildValidationObject(node, validation.severity, validation.message, bindingKey, validation.group),
          );
        }
      }
    }
  }, [node, validations]);
}

/**
 * Returns all validation errors (not warnings, info, etc.) for a given page.
 */
export function usePageErrors(page: LayoutPage) {
  const validations = useContext().state;

  return useMemo(() => {
    const validationMessages: IValidationMessage<'errors'>[] = [];

    for (const node of page.flat(true)) {
      if (!node.item.dataModelBindings) {
        continue;
      }
      for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
        if (!validations.fields[field]) {
          continue;
        }
        for (const group of Object.values(validations.fields[field])) {
          for (const validation of group.filter((v) => v.severity === 'errors')) {
            validationMessages.push(
              buildValidationObject(node, 'errors', validation.message, bindingKey, validation.group),
            );
          }
        }
      }
    }
    return validationMessages;
  }, [page, validations]);
}

/**
 * Returns all validation errors (not warnings, info, etc.) for a layout set.
 * This includes unmapped errors as well
 */
export function useTaskErrors(pages: LayoutPages) {
  const validations = useContext().state;

  return useMemo(() => {
    const validationMessages: IValidationMessage<'errors'>[] = [];

    for (const node of pages.allNodes()) {
      if (!node.item.dataModelBindings) {
        continue;
      }
      for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
        if (!validations.fields[field]) {
          continue;
        }
        for (const group of Object.values(validations.fields[field])) {
          for (const validation of group.filter((v) => v.severity === 'errors')) {
            validationMessages.push(
              buildValidationObject(node, 'errors', validation.message, bindingKey, validation.group),
            );
          }
        }
      }
    }
    for (const group of Object.values(validations.unmapped)) {
      for (const validation of group.filter((v) => v.severity === 'errors')) {
        validationMessages.push(unmappedError('errors', validation.message, validation.group));
      }
    }
    return validationMessages;
  }, [pages, validations]);
}

/**
 * Maps validation issues from backend, and validation objects from frontend to validation state
 */
function mapValidationsToState(
  issues: BackendValidationIssue[],
  langTools: IUseLanguage,
  filterSources: boolean = true,
): ValidationState {
  const validationOutputs: ValidationState = { fields: {}, unmapped: {} };

  for (const issue of issues) {
    if (filterSources && shouldExcludeValidationIssue(issue)) {
      continue;
    }

    const { field, severity: backendSeverity, source: group } = issue;
    const severity = severityMap[backendSeverity];
    const message = getValidationMessage(issue, langTools);

    if (!field) {
      // Unmapped error
      if (!validationOutputs.unmapped[group]) {
        validationOutputs.unmapped[group] = [];
      }
      if (!validationOutputs.unmapped[group].find((v) => v.message === message && v.severity === severity)) {
        validationOutputs.unmapped[group].push({ field: 'unmapped', severity, message, group });
      }
      continue;
    }

    if (!validationOutputs.fields[field]) {
      validationOutputs.fields[field] = {};
    }
    if (!validationOutputs.fields[field][group]) {
      validationOutputs.fields[field][group] = [];
    }

    if (!validationOutputs.fields[field][group].find((v) => v.message === message && v.severity === severity)) {
      validationOutputs.fields[field][group].push({ field, severity, message, group });
    }
  }
  return validationOutputs;
}

/**
 * Add FieldValidations to another FieldValidations object
 * Note: This does not merge any groups, it will override any existing groups
 * Not creating new objects constantly helps avoid GC?
 */
export function addFieldValidations(dest: FieldValidations, src: FieldValidations): void {
  for (const [field, groups] of Object.entries(src)) {
    if (!dest[field]) {
      dest[field] = {};
    }
    for (const group of Object.keys(groups)) {
      dest[field][group] = src[field][group];
    }
  }
}
