import React, { useEffect, useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { buildNodeValidation, getValidationsForNode, mergeFormValidations } from '.';

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
import type { IFormData } from 'src/features/formData';
import type {
  FormValidations,
  NodeValidation,
  ValidationContext,
  ValidationState,
} from 'src/features/validation/types';
import type { CompTypes, IDataModelBindings } from 'src/layout/layout';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';
import type { BackendValidationIssue, ValidationContextGenerator } from 'src/utils/validation/types';

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
    mergeFormValidations(newState, frontendValidations);
    setValidations(newState);

    /* Workaround, ideally, the logic that fetches validations should resolve text resources */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationData]);

  function validateNode(node: LayoutNode, overrideFormData?: IFormData) {
    const newState = node.runValidations(validationContextGenerator, overrideFormData);
    setValidations((prevState) => {
      mergeFormValidations(prevState, newState);
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
export function useAllValidationsForNode(node: LayoutNode): NodeValidation[] {
  const state = useContext().state;

  return useMemo(() => getValidationsForNode(node, state), [node, state]);
}

export function useBindingValidationsForNode<
  N extends LayoutNode,
  T extends CompTypes = N extends BaseLayoutNode<any, infer T> ? T : never,
>(node: N): { [binding in keyof NonNullable<IDataModelBindings<T>>]: NodeValidation[] } | undefined {
  const state = useContext().state;
  const fields = state.fields;
  const component = state.components[node.item.id];

  return useMemo(() => {
    if (!node.item.dataModelBindings) {
      return undefined;
    }
    const bindingValidations = {};
    for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
      bindingValidations[bindingKey] = [];

      if (fields[field]) {
        for (const validations of Object.values(fields[field])) {
          bindingValidations[bindingKey].push(
            ...validations.map((validation) => buildNodeValidation(node, validation, bindingKey)),
          );
        }
      }
      if (component?.bindingKeys?.[bindingKey]) {
        for (const validations of Object.values(component.bindingKeys![bindingKey])) {
          bindingValidations[bindingKey].push(
            ...validations.map((validation) => buildNodeValidation(node, validation, bindingKey)),
          );
        }
      }
    }
    return bindingValidations as { [binding in keyof NonNullable<IDataModelBindings<T>>]: NodeValidation[] };
  }, [node, fields, component]);
}

export function useComponentValidationsForNode(node: LayoutNode): NodeValidation[] {
  const component = useContext().state.components[node.item.id];
  return useMemo(() => {
    if (!component?.component) {
      return [];
    }
    const componentValidations: NodeValidation[] = [];
    for (const validations of Object.values(component.component!)) {
      componentValidations.push(...validations.map((validation) => buildNodeValidation(node, validation)));
    }

    return componentValidations;
  }, [node, component]);
}

/**
 * Returns all validation errors (not warnings, info, etc.) for a given page.
 */
export function usePageErrors(page: LayoutPage): NodeValidation<'errors'>[] {
  const state = useContext().state;

  return useMemo(() => {
    const validationMessages: NodeValidation<'errors'>[] = [];

    for (const node of page.flat(true).filter((node) => !node.isHidden({ respectTracks: true }))) {
      validationMessages.push(...getValidationsForNode(node, state, 'errors'));
    }

    return validationMessages;
  }, [page, state]);
}

/**
 * Returns all validation errors (not warnings, info, etc.) for a layout set.
 * This includes unmapped/task errors as well
 */
export function useTaskErrors(pages: LayoutPages): NodeValidation<'errors'>[] {
  const state = useContext().state;

  return useMemo(() => {
    const validationMessages: NodeValidation<'errors'>[] = [];

    for (const node of pages.allNodes().filter((node) => !node.isHidden({ respectTracks: true }))) {
      validationMessages.push(...getValidationsForNode(node, state, 'errors'));
    }
    // TODO(Validation): Deal with unmapped errors
    // for (const group of Object.values(validations.unmapped)) {
    //   for (const validation of validationsOfSeverity(group, 'errors')) {
    //     validationMessages.push(buildFrontendValidation(undefined, 'unmapped', validation));
    //   }
    // }
    return validationMessages;
  }, [pages, state]);
}

/**
 * Maps validation issues from backend, and validation objects from frontend to validation state
 */
function mapValidationsToState(
  issues: BackendValidationIssue[],
  langTools: IUseLanguage,
  filterSources: boolean = true,
): ValidationState {
  const state: ValidationState = { fields: {}, components: {}, task: [] };

  for (const issue of issues) {
    if (filterSources && shouldExcludeValidationIssue(issue)) {
      continue;
    }

    const { field, severity: backendSeverity, source: group } = issue;
    const severity = severityMap[backendSeverity];
    const message = getValidationMessage(issue, langTools);

    if (!field) {
      // Unmapped error
      if (!state.task.find((v) => v.message === message && v.severity === severity)) {
        state.task.push({ severity, message });
      }
      continue;
    }

    if (!state.fields[field]) {
      state.fields[field] = {};
    }
    if (!state.fields[field][group]) {
      state.fields[field][group] = [];
    }

    if (!state.fields[field][group].find((v) => v.message === message && v.severity === severity)) {
      state.fields[field][group].push({ field, severity, message, group });
    }
  }
  return state;
}

export function updateValidationState(prevState: ValidationState, newState: ValidationState): void {
  mergeFormValidations(prevState, newState);

  if (newState.task) {
    prevState.task = newState.task;
  }
}
