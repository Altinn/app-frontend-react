import { useMemo } from 'react';

import type { FormComponentProps } from 'src/layout/common.generated';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

/**
 * 1) A type guard for checking if our `component` is a FormComponent
 *    by looking for known properties from FormComponentProps.
 */
function isFormComponentProps(component: ResolvedCompExternal): component is ResolvedCompExternal & FormComponentProps {
  return component != null && ('readOnly' in component || 'required' in component || 'showValidations' in component);
}

/**
 * 2) A validation hook, which returns a list of errors
 *    or an empty array if everything is fine.
 */
export function useValidateComponent(component: ResolvedCompExternal, currentValue?: any) {
  return useMemo(() => {
    // If the layout doesn't implement FormComponentProps, no need to validate
    if (!isFormComponentProps(component)) {
      return [];
    }

    const errors: string[] = [];

    if (
      component.required &&
      // @ts-ignore
      (!component.dataModelBindings || !component.dataModelBindings.simpleBinding)
    ) {
      errors.push(`${component.id}: "required" is set, but no dataModelBindings found.`);
    }

    if (component.required && !currentValue) {
      errors.push('This value is required');
    }

    // More checks as needed...

    return errors;
  }, [component, currentValue]);
}
