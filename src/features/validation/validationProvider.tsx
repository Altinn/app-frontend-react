import React, { useEffect, useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { buildFrontendValidation, validationsOfSeverity } from '.';

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
import { useValidationContextGenerator } from 'src/utils/validation/validationHelpers';
import type {
  FormValidations,
  NodeValidation,
  ValidationContext,
  ValidationState,
} from 'src/features/validation/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';
import type { BackendValidationIssue, ValidationContextGenerator } from 'src/utils/validation/types';
import type { IValidationOptions } from 'src/utils/validation/validation';

const [Provider, useContext] = createStrictContext<ValidationContext>({
  options: { name: 'ValidationContext' },
});

async function fetchValidations(
  validationUrl: string,
  resolvedNodes: LayoutPages,
  validationContextGenerator: ValidationContextGenerator,
): Promise<[FormValidations, BackendValidationIssue[]]> {
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

  const [validations, setValidations] = useState<ValidationState>({ fields: {}, components: {}, task: [] });

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
    updateValidationState(newState, frontendValidations);
    setValidations(newState);

    /* Workaround, ideally, the logic that fetches validations should resolve text resources */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationData]);

  function validateNode(node: LayoutNode, options?: IValidationOptions) {
    const newState = node.runValidations(validationContextGenerator, options);
    setValidations((prevState) => {
      updateValidationState(prevState, newState);
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
export function useNodeValidations(node: LayoutNode): NodeValidation[] {
  const validations = useContext().state;

  return useMemo(() => {
    const validationMessages: NodeValidation[] = [];
    if (node.item.dataModelBindings) {
      for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
        if (!validations.fields[field]) {
          continue;
        }
        for (const group of Object.values(validations.fields[field])) {
          for (const validation of group) {
            validationMessages.push(buildFrontendValidation(node, bindingKey, validation));
          }
        }
      }
    }
    // TODO(Validation): Hack to get validations for attachment component, consider adding an additional property for component validations without data model binding
    const field = node.item.id;
    if (validations.fields[field]) {
      for (const group of Object.values(validations.fields[field])) {
        for (const validation of group) {
          validationMessages.push(buildFrontendValidation(node, field, validation));
        }
      }
    }
    return validationMessages;
  }, [node, validations]);
}

/**
 * Returns all validation errors (not warnings, info, etc.) for a given page.
 */
export function usePageErrors(page: LayoutPage): NodeValidation<'errors'>[] {
  const validations = useContext().state;

  return useMemo(() => {
    const validationMessages: NodeValidation<'errors'>[] = [];

    for (const node of page.flat(true)) {
      if (!node.item.dataModelBindings) {
        continue;
      }
      for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
        if (!validations.fields[field]) {
          continue;
        }
        for (const group of Object.values(validations.fields[field])) {
          for (const validation of validationsOfSeverity(group, 'errors')) {
            validationMessages.push(buildFrontendValidation(node, bindingKey, validation));
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
export function useTaskErrors(pages: LayoutPages): NodeValidation<'errors'>[] {
  const validations = useContext().state;

  return useMemo(() => {
    const validationMessages: NodeValidation<'errors'>[] = [];

    for (const node of pages.allNodes()) {
      if (!node.item.dataModelBindings) {
        continue;
      }
      for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
        if (!validations.fields[field]) {
          continue;
        }
        for (const group of Object.values(validations.fields[field])) {
          for (const validation of validationsOfSeverity(group, 'errors')) {
            validationMessages.push(buildFrontendValidation(node, bindingKey, validation));
          }
        }
      }
    }
    // TODO(Validation): Deal with unmapped errors
    // for (const group of Object.values(validations.unmapped)) {
    //   for (const validation of validationsOfSeverity(group, 'errors')) {
    //     validationMessages.push(buildFrontendValidation(undefined, 'unmapped', validation));
    //   }
    // }
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
  const validationOutputs: ValidationState = { fields: {}, components: {}, task: [] };

  for (const issue of issues) {
    if (filterSources && shouldExcludeValidationIssue(issue)) {
      continue;
    }

    const { field, severity: backendSeverity, source: group } = issue;
    const severity = severityMap[backendSeverity];
    const message = getValidationMessage(issue, langTools);

    if (!field) {
      // Unmapped error
      if (!validationOutputs.task.find((v) => v.message === message && v.severity === severity)) {
        validationOutputs.task.push({ severity, message });
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
export function updateValidationState(state: ValidationState, validations: FormValidations): void {
  if (validations.components) {
    for (const [componentId, groups] of Object.entries(validations.components)) {
      if (!state.components[componentId]) {
        state.components[componentId] = {};
      }
      for (const [group, validations] of Object.entries(groups)) {
        state.components[componentId][group] = validations;
      }
    }
  }

  if (validations.fields) {
    for (const [field, groups] of Object.entries(validations.fields)) {
      if (!state.fields[field]) {
        state.fields[field] = {};
      }
      for (const [group, validations] of Object.entries(groups)) {
        state.fields[field][group] = validations;
      }
    }
  }

  if (validations.task) {
    state.task = validations.task;
  }
}
