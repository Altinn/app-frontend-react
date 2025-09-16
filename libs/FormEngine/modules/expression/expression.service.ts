import { dataService } from 'libs/FormEngine/modules/data/data.service';
import {
  createExpressionContext,
  evaluateExpression as evaluateAltinnDsl,
  isExpression,
} from 'libs/FormEngine/modules/expression/altinnDsl';
import { layoutService } from 'libs/FormEngine/modules/layout/layout.service';
import type { Expression } from 'libs/FormEngine/types';

export class ExpressionService {
  /**
   * Evaluate an expression using the Altinn DSL
   */
  evaluateExpression(
    expression: Expression,
    options: {
      componentMap?: Record<string, any>;
      parentBinding?: string;
      itemIndex?: number;
      data?: Record<string, any>;
    } = {},
  ): any {
    // If expression is already a boolean, return it
    if (typeof expression === 'boolean') {
      return expression;
    }

    // If not an Altinn DSL expression, return as-is
    if (!isExpression(expression)) {
      return expression;
    }

    // Get current form data if not provided
    const data = options.data || dataService.getData();

    // Get component map from layout service if not provided
    const componentMap = options.componentMap || layoutService.getComponentMap();

    // Create expression context
    const context = createExpressionContext(data || {}, {
      componentMap: componentMap || {},
      parentBinding: options.parentBinding,
      itemIndex: options.itemIndex,
    });

    try {
      return evaluateAltinnDsl(expression, context);
    } catch (error) {
      console.error('Expression evaluation error:', error, 'Expression:', expression);
      // Return false for failed boolean expressions, null for others
      return false;
    }
  }

  /**
   * Register a custom function for expression evaluation
   * TODO: Extend altinnDsl.ts to support custom functions
   */
  registerFunction(name: string, _fn: Function): void {
    console.log(`Registering custom function: ${name}`);
    // Store function for later integration with DSL
    // This could be extended to add custom operators to the DSL
  }

  /**
   * Check if a value is an Altinn DSL expression
   */
  isExpression(value: any): boolean {
    return isExpression(value);
  }

  /**
   * Evaluate boolean expression (for hidden, required, etc.)
   */
  evaluateBooleanExpression(
    expression: boolean | Expression,
    options: {
      componentMap?: Record<string, any>;
      parentBinding?: string;
      itemIndex?: number;
      data?: Record<string, any>;
    } = {},
  ): boolean {
    if (typeof expression === 'boolean') {
      return expression;
    }

    const result = this.evaluateExpression(expression, options);
    return Boolean(result);
  }

  /**
   * Evaluate string expression (for text resources, etc.)
   */
  evaluateStringExpression(
    expression: string | Expression,
    options: {
      componentMap?: Record<string, any>;
      parentBinding?: string;
      itemIndex?: number;
      data?: Record<string, any>;
    } = {},
  ): string {
    if (typeof expression === 'string') {
      return expression;
    }

    const result = this.evaluateExpression(expression, options);
    return String(result || '');
  }

  /**
   * Create expression context from current state
   */
  createContext(
    options: {
      data?: Record<string, any>;
      componentMap?: Record<string, any>;
      parentBinding?: string;
      itemIndex?: number;
    } = {},
  ) {
    return createExpressionContext(options.data || dataService.getData() || {}, {
      componentMap: options.componentMap || layoutService.getComponentMap() || {},
      parentBinding: options.parentBinding,
      itemIndex: options.itemIndex,
    });
  }

  /**
   * Evaluate visibility expression for a component
   */
  evaluateVisibility(
    hiddenExpression: boolean | Expression | undefined,
    options: {
      componentMap?: Record<string, any>;
      parentBinding?: string;
      itemIndex?: number;
      data?: Record<string, any>;
    } = {},
  ): boolean {
    if (hiddenExpression === undefined) {
      return true; // Visible by default
    }

    const isHidden = this.evaluateBooleanExpression(hiddenExpression, options);
    return !isHidden; // Return visibility (opposite of hidden)
  }

  /**
   * Evaluate required expression for a component
   */
  evaluateRequired(
    requiredExpression: boolean | Expression | undefined,
    options: {
      componentMap?: Record<string, any>;
      parentBinding?: string;
      itemIndex?: number;
      data?: Record<string, any>;
    } = {},
  ): boolean {
    if (requiredExpression === undefined) {
      return false; // Not required by default
    }

    return this.evaluateBooleanExpression(requiredExpression, options);
  }
}

// Export singleton instance
export const expressionService = new ExpressionService();
