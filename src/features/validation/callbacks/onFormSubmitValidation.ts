import { useCallback } from 'react';

import { ValidationMask } from '..';

import { ContextNotProvided } from 'src/core/contexts/context';
import { getVisibilityMask, selectValidations } from 'src/features/validation/utils';
import { Validation } from 'src/features/validation/validationContext';
import { useEffectEvent } from 'src/hooks/useEffectEvent';
import { NodesInternal } from 'src/utils/layout/NodesContext';

/**
 * Checks for any validation errors before submitting the form.
 * returns true if there are any errors, in that case submitting should be prevented.
 * It first shows any frontend errors.
 * If there are no frontend errors, it shows any backend errors.
 * If there are no backend errors, it shows any backend errors that cannot be mapped to a visible node. Including task errors.
 */
export function useOnFormSubmitValidation() {
  const validation = Validation.useLaxRef();
  const setNodeVisibility = NodesInternal.useLaxSetNodeVisibility();
  const getNodesWithErrors = NodesInternal.useGetNodesWithErrors();

  const callback = useEffectEvent((): boolean => {
    if (validation.current === ContextNotProvided || setNodeVisibility === ContextNotProvided) {
      // If the validation context or nodes context is not provided, we cannot validate
      return false;
    }

    /*
     * First: check and show any frontend errors
     */
    const nodesWithFrontendErrors = getNodesWithErrors(ValidationMask.All, 'error');
    if (nodesWithFrontendErrors === ContextNotProvided) {
      // If the nodes are not provided, we cannot validate them
      return false;
    }

    if (nodesWithFrontendErrors.length > 0) {
      setNodeVisibility(nodesWithFrontendErrors, ValidationMask.All);
      return true;
    }

    /*
     * Normally, backend errors should be in sync with frontend errors.
     * But if not, show them now.
     */
    const nodesWithAnyErrors = getNodesWithErrors(ValidationMask.AllIncludingBackend, 'error');
    if (nodesWithAnyErrors !== ContextNotProvided && nodesWithAnyErrors.length > 0) {
      setNodeVisibility(nodesWithAnyErrors, ValidationMask.AllIncludingBackend);
      return true;
    }

    /**
     * As a last resort, to prevent unknown error, show any backend errors
     * that cannot be mapped to any visible node.
     */
    const backendMask = getVisibilityMask(['Backend', 'CustomBackend']);
    const fieldErrors = Object.values(validation.current.state.dataModels)
      .flatMap((fields) => Object.values(fields))
      .flatMap((field) => selectValidations(field, backendMask, 'error'));

    if (fieldErrors.length > 0) {
      validation.current.setShowAllErrors(true);
      return true;
    }

    return false;
  });

  return useCallback(async () => {
    const validating = validation.current === ContextNotProvided ? undefined : validation.current?.validating;
    if (!validating) {
      // If the validation context is not provided, we cannot validate
      return false;
    }

    await validating();
    return callback();
  }, [callback, validation]);
}
