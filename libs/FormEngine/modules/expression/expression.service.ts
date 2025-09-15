import type { Expression } from '../../types';

export class ExpressionService {
  /**
   * Evaluate an expression
   * This is a stub implementation that will be expanded later
   */
  evaluateExpression(expression: Expression, context?: any): any {
    // If expression is already a boolean, return it
    if (typeof expression === 'boolean') {
      return expression;
    }

    // If expression is an array (Altinn expression format), evaluate it
    if (Array.isArray(expression)) {
      // For now, return true for all expressions
      // TODO: Implement proper expression evaluation
      console.log('Expression evaluation (stub):', expression, 'with context:', context);
      return true;
    }

    // Default to the expression value
    return expression;
  }

  /**
   * Register a custom function for expression evaluation
   */
  registerFunction(name: string, _fn: Function): void {
    // TODO: Implement custom function registration
    console.log(`Registering custom function: ${name}`);
  }

  /**
   * Check if a value is an expression
   */
  isExpression(value: any): boolean {
    return Array.isArray(value) && value.length > 0;
  }

  /**
   * Evaluate boolean expression (for hidden, required, etc.)
   */
  evaluateBooleanExpression(expression: boolean | Expression, context?: any): boolean {
    if (typeof expression === 'boolean') {
      return expression;
    }

    const result = this.evaluateExpression(expression, context);
    return Boolean(result);
  }

  /**
   * Evaluate string expression (for text resources, etc.)
   */
  evaluateStringExpression(expression: string | Expression, context?: any): string {
    if (typeof expression === 'string') {
      return expression;
    }

    const result = this.evaluateExpression(expression, context);
    return String(result || '');
  }

  /**
   * Create expression context from data
   */
  createContext(data: any, componentId?: string, itemIndex?: number): any {
    return {
      dataModel: data,
      component: componentId,
      index: itemIndex,
      // Add more context properties as needed
    };
  }
}

// Export singleton instance
export const expressionService = new ExpressionService();