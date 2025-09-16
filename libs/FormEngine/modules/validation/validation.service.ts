import type { ValidationError, ValidationResult } from 'libs/FormEngine/types';

export class ValidationService {
  /**
   * Validate a value against a schema
   * This is a stub implementation that will be expanded later
   */

  validateValue(value: any, schema: any, path: string = ''): ValidationResult {
    const errors: ValidationError[] = [];

    // Basic required validation
    if (schema.required && (value === null || value === undefined || value === '')) {
      errors.push({
        path,
        message: 'This field is required',
        code: 'required',
      });
    }

    // Basic type validation
    if (value !== null && value !== undefined && value !== '') {
      if (schema.type === 'string' && typeof value !== 'string') {
        errors.push({
          path,
          message: 'Value must be a string',
          code: 'type',
        });
      }

      if (schema.type === 'number' && typeof value !== 'number') {
        errors.push({
          path,
          message: 'Value must be a number',
          code: 'type',
        });
      }

      if (schema.type === 'boolean' && typeof value !== 'boolean') {
        errors.push({
          path,
          message: 'Value must be a boolean',
          code: 'type',
        });
      }
    }

    // String validations
    if (schema.type === 'string' && typeof value === 'string') {
      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push({
          path,
          message: `Value cannot be longer than ${schema.maxLength} characters`,
          code: 'maxLength',
        });
      }

      if (schema.minLength && value.length < schema.minLength) {
        errors.push({
          path,
          message: `Value must be at least ${schema.minLength} characters`,
          code: 'minLength',
        });
      }

      if (schema.pattern) {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(value)) {
          errors.push({
            path,
            message: 'Value does not match the required pattern',
            code: 'pattern',
          });
        }
      }
    }

    // Number validations
    if (schema.type === 'number' && typeof value === 'number') {
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push({
          path,
          message: `Value cannot be greater than ${schema.maximum}`,
          code: 'maximum',
        });
      }

      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push({
          path,
          message: `Value cannot be less than ${schema.minimum}`,
          code: 'minimum',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate an object against a schema
   */
  validateObject(data: any, schema: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!schema || !schema.properties) {
      return { isValid: true, errors: [] };
    }

    // Check required fields
    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredField of schema.required) {
        if (!data || data[requiredField] === undefined || data[requiredField] === null || data[requiredField] === '') {
          errors.push({
            path: requiredField,
            message: `Field ${requiredField} is required`,
            code: 'required',
          });
        }
      }
    }

    // Validate each property
    if (data && typeof data === 'object') {
      for (const [propertyName, propertySchema] of Object.entries(schema.properties)) {
        const value = data[propertyName];
        if (value !== undefined) {
          const propertyResult = this.validateValue(value, propertySchema, propertyName);
          errors.push(...propertyResult.errors);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate component with support for dynamic expressions and repeating groups
   */
  validateComponentAdvanced(
    component: any,
    dataService: any,
    expressionService: any,
    parentBinding?: string,
    itemIndex?: number,
    childField?: string,
  ): string[] {
    // Check if component is a form component with validation properties
    if (!this.isFormComponent(component)) {
      return [];
    }
    
    const errors: string[] = [];
    const currentValue = dataService.getBoundValue(component, parentBinding, itemIndex, childField);

    let isRequired: boolean;

    if (!Array.isArray(component.required)) {
      isRequired = !!component.required;
    } else {
      // Evaluate expression for required field
      isRequired = expressionService.evaluateExpression(component.required, {
        data: dataService.getData(),
        componentMap: expressionService.layoutService?.getComponentMap?.(),
        parentBinding,
        itemIndex,
      });
    }

    if (isRequired) {
      if (!currentValue) {
        errors.push('This value is required');
      }
    }
    
    return errors;
  }

  /**
   * Check if component is a form component that supports validation
   */
  private isFormComponent(component: any): boolean {
    return component != null && 
           ('readOnly' in component || 'required' in component || 'showValidations' in component);
  }

  /**
   * Validate component value (legacy compatibility)
   */
  validateComponent(componentId: string, value: any, config: any): ValidationResult {
    // TODO: Implement component-specific validation
    console.log(`Validating component ${componentId}:`, value, config);

    // For now, just return valid
    return {
      isValid: true,
      errors: [],
    };
  }

  /**
   * Clear validation errors for a specific path
   */
  clearValidation(path?: string): void {
    // TODO: Implement validation error clearing
    console.log(`Clearing validation for path: ${path || 'all'}`);
  }

  /**
   * Get validation errors for a specific path
   */
  getValidationErrors(path: string): ValidationError[] {
    // TODO: Implement validation error retrieval
    console.log(`Getting validation errors for path: ${path}`);
    return [];
  }

  /**
   * Check if a path has validation errors
   */
  hasValidationErrors(path: string): boolean {
    const errors = this.getValidationErrors(path);
    return errors.length > 0;
  }

  /**
   * Subscribe to validation changes
   */
  subscribe(_listener: (errors: ValidationError[]) => void): () => void {
    // TODO: Implement validation subscription
    console.log('Subscribing to validation changes');
    return () => {}; // Return unsubscribe function
  }
}

// Export singleton instance
export const validationService = new ValidationService();
