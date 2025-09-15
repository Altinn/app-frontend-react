/**
 * altinnDsl.ts
 * Altinn Expression Domain Specific Language (DSL) evaluator
 * Supports array-based expression format: ["operator", ...params]
 */
import dot from 'dot-object';

export interface ExpressionContext {
  data: Record<string, any>;
  componentMap?: Record<string, any>;
  parentBinding?: string;
  itemIndex?: number;
}

export type Expression = any[] | any;

/**
 * Evaluates an Altinn DSL expression with the given context
 */
export function evaluateExpression(
  expr: Expression,
  context: ExpressionContext,
): any {
  // If not an array, treat as literal and return directly
  if (!Array.isArray(expr)) {
    return expr;
  }

  const { data, componentMap, parentBinding, itemIndex } = context;
  const [operator, ...params] = expr;

  // Helper to evaluate sub-expressions with same context
  const evalParam = (param: any) => evaluateExpression(param, context);

  // Convert a param to number if possible
  const toNumber = (value: any): number => {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    throw new Error(`Cannot convert value to number: ${value}`);
  };

  switch (operator) {
    case 'dataModel': {
      // Usage: ["dataModel", "person.firstName"]
      const fieldName = params[0];
      if (!data) {
        throw new Error('Cannot use dataModel expression without data');
      }
      return dot.pick(fieldName, data);
    }

    case 'component': {
      // Usage: ["component", "componentId"]
      const componentId = params[0];
      if (!componentMap) {
        throw new Error('No componentMap provided to evaluate "component"');
      }
      
      const comp = componentMap[componentId];
      if (!comp) {
        throw new Error(`Component with ID '${componentId}' not found in componentMap`);
      }

      const binding = comp.dataModelBindings?.simpleBinding;
      if (!binding) {
        throw new Error(`Component '${componentId}' has no simpleBinding`);
      }

      // Handle repeating group context
      if (!parentBinding) {
        return dot.pick(binding, data);
      }

      const fieldParts = binding.split('.');
      if (fieldParts.length === 0) {
        throw new Error('Field not found in binding');
      }

      const field = fieldParts[fieldParts.length - 1];
      const contextualPath = `${parentBinding}[${itemIndex}].${field}`;
      
      return dot.pick(contextualPath, data);
    }

    // Comparison operators
    case 'equals': {
      // Usage: ["equals", left, right]
      const left = evalParam(params[0]);
      const right = evalParam(params[1]);
      return left === right;
    }

    case 'notEquals': {
      // Usage: ["notEquals", left, right]
      const left = evalParam(params[0]);
      const right = evalParam(params[1]);
      return left !== right;
    }

    case 'lessThan': {
      // Usage: ["lessThan", left, right]
      const left = toNumber(evalParam(params[0]));
      const right = toNumber(evalParam(params[1]));
      return left < right;
    }

    case 'greaterThan': {
      // Usage: ["greaterThan", left, right]
      const left = toNumber(evalParam(params[0]));
      const right = toNumber(evalParam(params[1]));
      return left > right;
    }

    case 'lessThanEq': {
      // Usage: ["lessThanEq", left, right]
      const left = toNumber(evalParam(params[0]));
      const right = toNumber(evalParam(params[1]));
      return left <= right;
    }

    case 'greaterThanEq': {
      // Usage: ["greaterThanEq", left, right]
      const left = toNumber(evalParam(params[0]));
      const right = toNumber(evalParam(params[1]));
      return left >= right;
    }

    // Logical operators
    case 'not': {
      // Usage: ["not", expression]
      const value = evalParam(params[0]);
      return !value;
    }

    case 'and': {
      // Usage: ["and", expr1, expr2, ...]
      return params.every((p) => Boolean(evalParam(p)));
    }

    case 'or': {
      // Usage: ["or", expr1, expr2, ...]
      return params.some((p) => Boolean(evalParam(p)));
    }

    case 'if': {
      // Usage: ["if", condition, thenValue, elseValue]
      const [conditionExpr, thenExpr, elseExpr] = params;
      return evalParam(conditionExpr) ? evalParam(thenExpr) : evalParam(elseExpr);
    }

    // Arithmetic operators
    case 'add': {
      // Usage: ["add", num1, num2, ...]
      return params.reduce((acc, p) => acc + toNumber(evalParam(p)), 0);
    }

    case 'subtract': {
      // Usage: ["subtract", left, right]
      const left = toNumber(evalParam(params[0]));
      const right = toNumber(evalParam(params[1]));
      return left - right;
    }

    case 'multiply': {
      // Usage: ["multiply", left, right]
      const left = toNumber(evalParam(params[0]));
      const right = toNumber(evalParam(params[1]));
      return left * right;
    }

    case 'divide': {
      // Usage: ["divide", left, right]
      const left = toNumber(evalParam(params[0]));
      const right = toNumber(evalParam(params[1]));
      if (right === 0) {
        throw new Error('Division by zero');
      }
      return left / right;
    }

    // String operators
    case 'concat': {
      // Usage: ["concat", str1, str2, ...]
      const values = params.map(evalParam);
      return values.join('');
    }

    case 'lowerCase': {
      // Usage: ["lowerCase", string]
      const value = evalParam(params[0]);
      return String(value).toLowerCase();
    }

    case 'upperCase': {
      // Usage: ["upperCase", string]
      const value = evalParam(params[0]);
      return String(value).toUpperCase();
    }

    case 'length': {
      // Usage: ["length", string|array]
      const value = evalParam(params[0]);
      if (value == null) return 0;
      return String(value).length;
    }

    case 'contains': {
      // Usage: ["contains", haystack, needle]
      const haystack = String(evalParam(params[0]));
      const needle = String(evalParam(params[1]));
      return haystack.includes(needle);
    }

    // Array/object operators
    case 'count': {
      // Usage: ["count", arrayPath] - counts items in an array
      const arrayValue = evalParam(params[0]);
      if (Array.isArray(arrayValue)) {
        return arrayValue.length;
      }
      return 0;
    }

    case 'isEmpty': {
      // Usage: ["isEmpty", value]
      const value = evalParam(params[0]);
      if (value == null) return true;
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === 'string') return value.trim() === '';
      return false;
    }

    // Type checking
    case 'isNumber': {
      // Usage: ["isNumber", value]
      const value = evalParam(params[0]);
      return typeof value === 'number' && !isNaN(value);
    }

    case 'isString': {
      // Usage: ["isString", value]
      const value = evalParam(params[0]);
      return typeof value === 'string';
    }

    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

/**
 * Helper function to create expression context
 */
export function createExpressionContext(
  data: Record<string, any>,
  options: {
    componentMap?: Record<string, any>;
    parentBinding?: string;
    itemIndex?: number;
  } = {}
): ExpressionContext {
  return {
    data,
    componentMap: options.componentMap,
    parentBinding: options.parentBinding,
    itemIndex: options.itemIndex,
  };
}

/**
 * Helper function to test if a value is an Altinn DSL expression
 */
export function isExpression(value: any): value is Expression {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === 'string';
}