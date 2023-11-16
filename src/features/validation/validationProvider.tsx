import React, { useMemo } from 'react';

import { useImmer } from 'use-immer';
import type { AxiosRequestConfig } from 'axios';

import {
  buildNodeValidation,
  getValidationsForNode,
  mergeFormValidations,
  useOnHierarchyChange,
  useOnNodeDataChange,
  validationsOfSeverity,
} from '.';
import type { NodeDataChange } from '.';

import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { useStrictInstance } from 'src/features/instance/InstanceContext';
import { type IUseLanguage, useLanguage } from 'src/hooks/useLanguage';
import { createStrictContext } from 'src/utils/createContext';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { duplicateStringFilter } from 'src/utils/stringHelper';
import { getDataValidationUrl } from 'src/utils/urls/appUrlHelper';
import {
  getValidationMessage,
  severityMap,
  shouldExcludeValidationIssue,
} from 'src/utils/validation/backendValidation';
import { runValidationOnNodes } from 'src/utils/validation/validation';
import { useValidationContextGenerator } from 'src/utils/validation/validationHelpers';
import type { BaseValidation, NodeValidation, ValidationContext, ValidationState } from 'src/features/validation/types';
import type { CompTypes, IDataModelBindings } from 'src/layout/layout';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';
import type { BackendValidationIssue } from 'src/utils/validation/types';

const { Provider, useCtx } = createStrictContext<ValidationContext>({ name: 'ValidationContext' });

export function ValidationProvider({ children }) {
  const validationContextGenerator = useValidationContextGenerator();
  const langTools = useLanguage();
  const instanceId = useStrictInstance().instanceId;
  const currentDataElementId = useCurrentDataModelGuid();
  const validationUrl =
    instanceId?.length && currentDataElementId?.length
      ? getDataValidationUrl(instanceId, currentDataElementId)
      : undefined;

  const [validations, setValidations] = useImmer<ValidationState>({ fields: {}, components: {}, task: [] });

  useOnNodeDataChange(async (nodeChanges) => {
    const changedNodes = nodeChanges.map((nC) => nC.node);
    const serverValidations = await runServerValidations(nodeChanges, validationUrl, langTools);
    const newValidations = runValidationOnNodes(changedNodes, validationContextGenerator);
    setValidations((state) => {
      mergeFormValidations(state, newValidations);
      updateValidationState(state, serverValidations);
    });
  });

  useOnHierarchyChange(async (addedNodeChanges, removedNodes, currentNodes) => {
    const addedNodes = addedNodeChanges.map((nC) => nC.node);
    const serverValidations = await runServerValidations(addedNodeChanges, validationUrl, langTools);
    const newValidations = runValidationOnNodes(addedNodes, validationContextGenerator);
    setValidations((state) => {
      purgeValidationsForNodes(state, removedNodes, currentNodes);
      mergeFormValidations(state, newValidations);
      updateValidationState(state, serverValidations);
    });
  });

  const out = {
    state: validations,
  };

  return <Provider value={out}>{children}</Provider>;
}

/**
 * Returns all validation messages for a given node.
 */
export function useAllValidationsForNode(node: LayoutNode): NodeValidation[] {
  const state = useCtx().state;

  return useMemo(() => getValidationsForNode(node, state), [node, state]);
}

export function useBindingValidationsForNode<
  N extends LayoutNode,
  T extends CompTypes = N extends BaseLayoutNode<any, infer T> ? T : never,
>(node: N): { [binding in keyof NonNullable<IDataModelBindings<T>>]: NodeValidation[] } | undefined {
  const state = useCtx().state;
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
  const component = useCtx().state.components[node.item.id];
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
  const state = useCtx().state;

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
export function useTaskErrors(pages: LayoutPages): {
  formValidations: NodeValidation<'errors'>[];
  taskValidations: BaseValidation<'errors'>[];
} {
  const state = useCtx().state;

  return useMemo(() => {
    const formValidations: NodeValidation<'errors'>[] = [];
    const taskValidations: BaseValidation<'errors'>[] = [];

    for (const node of pages.allNodes().filter((node) => !node.isHidden({ respectTracks: true }))) {
      formValidations.push(...getValidationsForNode(node, state, 'errors'));
    }
    for (const validation of validationsOfSeverity(state.task, 'errors')) {
      taskValidations.push(validation);
    }
    return { formValidations, taskValidations };
  }, [pages, state]);
}

async function runServerValidations(
  nodeChanges: NodeDataChange[],
  url: string | undefined,
  langTools: IUseLanguage,
): Promise<ValidationState> {
  const state: ValidationState = {
    fields: {},
    components: {},
    task: [],
  };

  if (!nodeChanges.length || !url) {
    return Promise.resolve(state);
  }

  const fieldChanges = nodeChanges.flatMap((nc) => nc.fields).filter(duplicateStringFilter);

  if (!fieldChanges.length) {
    return Promise.resolve(state);
  }

  const options: AxiosRequestConfig =
    fieldChanges.length === 1
      ? {
          headers: {
            ValidationTriggerField: fieldChanges[0],
          },
        }
      : {};

  const serverValidations: BackendValidationIssue[] = await httpGet(url, options);

  // pass fieldChanges here
  return mapValidationsToState(serverValidations, langTools);
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
    /**
     * TODO(Validation): Do not filter here, leave them in the state.
     * Filter in the hooks fetching them instead.
     */
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

    /**
     * Allow fixed validation to clear the group, but there is no need to add it.
     * This is a temporary way to almost support *FIXED* validations,
     * the only caveat is that it will clear ALL custom validations for the field,
     * instead of just the one.
     */
    if (severity != 'fixed') {
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

function purgeValidationsForNodes(
  state: ValidationState,
  removedNodes: LayoutNode[],
  currentNodes: LayoutNode[],
): void {
  if (removedNodes.length === 0) {
    return;
  }

  const fieldsToKeep = new Set<string>();
  for (const node of currentNodes) {
    if (node.item.dataModelBindings) {
      for (const field of Object.values(node.item.dataModelBindings)) {
        fieldsToKeep.add(field);
      }
    }
  }

  for (const node of removedNodes) {
    delete state.components[node.item.id];
    if (node.item.dataModelBindings) {
      for (const field of Object.values(node.item.dataModelBindings)) {
        if (!fieldsToKeep.has(field)) {
          delete state.fields[field];
        }
      }
    }
  }
}
