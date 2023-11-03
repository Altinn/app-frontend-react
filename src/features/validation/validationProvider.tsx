import React, { useEffect, useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useCurrentDataElementId } from 'src/features/datamodel/useBindingSchema';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { type IUseLanguage, useLanguage } from 'src/hooks/useLanguage';
import { createStrictContext } from 'src/utils/createStrictContext';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { getDataValidationUrl } from 'src/utils/urls/appUrlHelper';
import {
  getValidationMessage,
  severityMap,
  shouldExcludeValidationIssue,
} from 'src/utils/validation/backendValidation';
import { buildValidationObject, unmappedError } from 'src/utils/validation/validationHelpers';
import type { ValidationState } from 'src/features/validation/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';
import type { BackendValidationIssue, IValidationMessage, ValidationSeverity } from 'src/utils/validation/types';

const [Provider, useContext] = createStrictContext<ValidationState>({ options: { name: 'ValidationContext' } });

function fetchValidations(validationUrl: string): Promise<BackendValidationIssue[]> {
  return httpGet(validationUrl);
}

export function ValidationProvider({ children }) {
  const lastSavedFormData = useAppSelector((state) => state.formData.lastSavedFormData);
  const langTools = useLanguage();
  const instanceId = useAppSelector((state) => state.instanceData.instance?.id);
  const currentDataElementId = useCurrentDataElementId();
  const validationUrl =
    instanceId?.length && currentDataElementId?.length
      ? getDataValidationUrl(instanceId, currentDataElementId)
      : undefined;

  const [validations, setValidations] = useState<ValidationState>({ fields: {}, unmapped: [] });

  const { data: validationData } = useQuery({
    enabled: Boolean(validationUrl),
    queryKey: ['validation', instanceId, currentDataElementId, lastSavedFormData],
    queryFn: () => fetchValidations(validationUrl!),
  });

  useEffect(() => {
    if (!validationData) {
      return;
    }

    const newValidations = mapServerValidations(validationData, langTools);
    setValidations(newValidations);
  }, [langTools, validationData]);

  return <Provider value={validations}>{children}</Provider>;
}

/**
 * Returns all validation messages for a given node.
 */
export function useNodeValidations(node: LayoutNode) {
  const validations = useContext();

  return useMemo(() => {
    const validationMessages: IValidationMessage<ValidationSeverity>[] = [];
    if (!node.item.dataModelBindings) {
      return validationMessages;
    }
    for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
      if (!validations.fields[field]) {
        continue;
      }
      for (const validation of validations.fields[field].filter((v) => v.severity !== 'fixed')) {
        validationMessages.push(buildValidationObject(node, validation.severity, validation.message, bindingKey));
      }
    }
  }, [node, validations]);
}

/**
 * Returns all validation errors (not warnings, info, etc.) for a given page.
 */
export function usePageErrors(page: LayoutPage) {
  const validations = useContext();

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
        for (const validation of validations.fields[field].filter((v) => v.severity === 'errors')) {
          validationMessages.push(buildValidationObject(node, 'errors', validation.message, bindingKey));
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
  const validations = useContext();

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
        for (const validation of validations.fields[field].filter((v) => v.severity === 'errors')) {
          validationMessages.push(buildValidationObject(node, 'errors', validation.message, bindingKey));
        }
      }
    }
    for (const validation of validations.unmapped.filter((v) => v.severity === 'errors')) {
      validationMessages.push(unmappedError('errors', validation.message));
    }
    return validationMessages;
  }, [pages, validations]);
}

/**
 * Maps validation issues from backend to validation state
 */
function mapServerValidations(
  issues: BackendValidationIssue[],
  langTools: IUseLanguage,
  filterSources: boolean = true,
): ValidationState {
  const validationOutputs: ValidationState = { fields: {}, unmapped: [] };
  for (const issue of issues) {
    if (filterSources && shouldExcludeValidationIssue(issue)) {
      continue;
    }

    const { field, severity: backendSeverity } = issue;
    const severity = severityMap[backendSeverity];
    const message = getValidationMessage(issue, langTools);

    if (!field) {
      // Unmapped error
      validationOutputs.unmapped.push({ field: 'unmapped', severity, message });
    }

    if (!validationOutputs.fields[field]) {
      validationOutputs.fields[field] = [];
    }

    validationOutputs.fields[field].push({ field, severity, message });
  }
  return validationOutputs;
}
