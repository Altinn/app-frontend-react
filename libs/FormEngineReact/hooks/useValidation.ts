import { useState, useEffect, useCallback } from 'react';
import { useEngine } from '../FormEngineProvider';

/**
 * Hook for component validation
 */
export function useComponentValidation(
  component: any, 
  parentBinding?: string, 
  itemIndex?: number
) {
  const engine = useEngine();
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  const validateComponent = useCallback(() => {
    try {
      // Note: validateComponent method was commented out in FormEngine
      // For now, we'll do basic validation
      const componentErrors: string[] = [];
      
      // Check if component is required
      let isRequired = false;
      if (typeof component.required === 'boolean') {
        isRequired = component.required;
      } else if (Array.isArray(component.required)) {
        // Evaluate expression
        isRequired = engine.expression.evaluateExpression(component.required, {
          data: engine.data.getData(),
          componentMap: engine.layout.getComponentMap(),
          parentBinding,
          itemIndex,
        });
      }

      if (isRequired) {
        const value = engine.getBoundValue(component, parentBinding, itemIndex);
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          componentErrors.push('This field is required');
        }
      }

      setErrors(componentErrors);
      setIsValid(componentErrors.length === 0);
      
      return componentErrors;
    } catch (error) {
      console.error('Validation error:', error);
      const errorMsg = 'Validation failed';
      setErrors([errorMsg]);
      setIsValid(false);
      return [errorMsg];
    }
  }, [engine, component, parentBinding, itemIndex]);

  // Re-validate when data changes
  useEffect(() => {
    const binding = component.dataModelBindings?.simpleBinding;
    if (!binding) return;

    const effectivePath = parentBinding 
      ? `${parentBinding}[${itemIndex}].${binding.split('.').pop()}`
      : binding;

    const unsubscribe = engine.data.subscribeToPath(effectivePath, () => {
      validateComponent();
    });

    // Initial validation
    validateComponent();

    return unsubscribe;
  }, [validateComponent]);

  return {
    errors,
    isValid,
    validate: validateComponent,
  };
}

/**
 * Hook for form-wide validation
 */
export function useFormValidation() {
  const engine = useEngine();
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const validateForm = useCallback(() => {
    try {
      const result = engine.validate();
      setIsValid(result);
      
      // TODO: Collect component-specific errors
      // This would require implementing comprehensive validation in FormEngine
      setErrors({});
      
      return result;
    } catch (error) {
      console.error('Form validation error:', error);
      setIsValid(false);
      return false;
    }
  }, [engine]);

  // Subscribe to data changes for re-validation
  useEffect(() => {
    const unsubscribe = engine.subscribeToDataChanges(() => {
      validateForm();
    });

    // Initial validation
    validateForm();

    return unsubscribe;
  }, [validateForm]);

  return {
    isValid,
    errors,
    validate: validateForm,
  };
}

/**
 * Hook for evaluating expressions
 */
export function useExpression(expression: any, dependencies: any[] = []) {
  const engine = useEngine();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!Array.isArray(expression)) {
      setResult(expression);
      return;
    }

    try {
      const evaluated = engine.expression.evaluateExpression(expression, {
        data: engine.data.getData(),
        componentMap: engine.layout.getComponentMap(),
      });
      setResult(evaluated);
    } catch (error) {
      console.error('Expression evaluation error:', error);
      setResult(null);
    }
  }, [engine, expression, ...dependencies]);

  // Subscribe to data changes that might affect the expression
  useEffect(() => {
    if (!Array.isArray(expression)) return;

    const unsubscribe = engine.subscribeToDataChanges(() => {
      try {
        const evaluated = engine.expression.evaluateExpression(expression, {
          data: engine.data.getData(),
          componentMap: engine.layout.getComponentMap(),
        });
        setResult(evaluated);
      } catch (error) {
        console.error('Expression evaluation error:', error);
        setResult(null);
      }
    });

    return unsubscribe;
  }, [engine, expression]);

  return result;
}