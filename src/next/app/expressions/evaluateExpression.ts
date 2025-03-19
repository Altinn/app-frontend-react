/**
 * evaluateExpression.ts
 * A simple evaluator for the array-based expression format in Altinn.
 */
import dot from 'dot-object';

import type { DataObject, ResolvedCompExternal } from 'src/next/stores/layoutStore';

/**
 * Extended signature: pass data + optional componentMap
 */
export function evaluateExpression(
  expr: any,
  formData: DataObject,
  componentMap?: Record<string, ResolvedCompExternal>,
  parentBinding?: string,
  itemIndex?: number,
): any {
  // If not an array, treat as literal and return directly
  if (!Array.isArray(expr)) {
    return expr;
  }

  //debugger;

  const [operator, ...params] = expr;

  // Helper to evaluate sub-expressions
  const evalParam = (param: any) => evaluateExpression(param, formData, componentMap, parentBinding, itemIndex);

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
      // Usage: ["dataModel", "someField"]

      const fieldName = params[0];
      if (!formData) {
        throw new Error('cannot use dataModel expression without data');
      }

      const value = formData[fieldName];
      // debugger;

      return formData[fieldName];
    }

    case 'component': {
      //debugger;
      // Usage: ["component", "someComponentId"]
      const componentId = params[0];
      if (!componentMap) {
        throw new Error('No componentMap provided to evaluate "component"');
      }
      const comp = componentMap[componentId];
      if (!comp) {
        throw new Error(`Component with ID '${componentId}' not found in componentMap`);
      }
      // For example, assume we want the `simpleBinding` if it exists:
      // @ts-ignore
      const binding = comp.dataModelBindings?.simpleBinding;
      if (!binding) {
        throw new Error(`Component '${componentId}' has no simpleBinding`);
      }

      if (!parentBinding) {
        return dot.pick(binding, formData);
      }

      const fieldSplitted = binding.split('.');
      if (fieldSplitted.length === 0) {
        throw new Error('field not found');
      }

      const field = fieldSplitted[fieldSplitted.length - 1];

      const retValue = dot.pick(`${parentBinding}[${itemIndex}].${field}`, formData);

      return retValue;
    }

    case 'equals': {
      // Usage: ["equals", left, right]
      const left = evalParam(params[0]);
      const right = evalParam(params[1]);
      return left === right;
    }

    case 'notEquals': {
      const left = evalParam(params[0]);
      const right = evalParam(params[1]);
      return left !== right;
    }

    case 'not': {
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

    case 'lessThan': {
      const left = toNumber(evalParam(params[0]));
      const right = toNumber(evalParam(params[1]));
      return left < right;
    }

    case 'greaterThan': {
      const left = toNumber(evalParam(params[0]));
      const right = toNumber(evalParam(params[1]));
      return left > right;
    }

    case 'add': {
      // Usage: ["add", val1, val2, ...]
      return params.reduce((acc, p) => acc + toNumber(evalParam(p)), 0);
    }

    case 'subtract': {
      // Usage: ["subtract", val1, val2]
      const left = toNumber(evalParam(params[0]));
      const right = toNumber(evalParam(params[1]));
      return left - right;
    }

    case 'multiply': {
      // Usage: ["multiply", val1, val2]
      const left = toNumber(evalParam(params[0]));
      const right = toNumber(evalParam(params[1]));
      return left * right;
    }

    case 'divide': {
      // Usage: ["divide", val1, val2]
      const left = toNumber(evalParam(params[0]));
      const right = toNumber(evalParam(params[1]));
      return left / right;
    }

    case 'concat': {
      // Usage: ["concat", val1, val2, ...]
      const values = params.map(evalParam);
      return values.join('');
    }

    case 'lowerCase': {
      // Usage: ["lowerCase", someString]
      const value = evalParam(params[0]);
      return String(value).toLowerCase();
    }

    case 'upperCase': {
      // Usage: ["upperCase", someString]
      const value = evalParam(params[0]);
      return String(value).toUpperCase();
    }

    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

// /**
//  * evaluateExpression.ts
//  * A simple evaluator for the array-based expression format in Altinn.
//  */
// import type { DataObject } from 'src/next/stores/layoutStore';
//
// type Expression = any; // Adjust with a more precise type if desired
// type FormData = Record<string, string>; // Adjust if your form data differs
//
// /**
//  * Safely evaluate an expression, which may be:
//  *  - A literal (string/number/boolean)
//  *  - An array describing an operation (e.g. ["equals", left, right])
//  *  - A reference to a form component (["component", "fieldName"])
//  */
// export function evaluateExpression(expr: Expression, formData?: DataObject): any {
//   // If not an array, treat as literal and return directly
//   if (!Array.isArray(expr)) {
//     return expr;
//   }
//
//   const [operator, ...params] = expr;
//
//   // Helper to evaluate sub-expressions
//   const evalParam = (param: Expression) => evaluateExpression(param, formData);
//
//   // Convert a param to number if possible
//   const toNumber = (value: any): number => {
//     if (typeof value === 'number') {
//       return value;
//     }
//     if (typeof value === 'string') {
//       const parsed = parseFloat(value);
//       if (!isNaN(parsed)) {
//         return parsed;
//       }
//     }
//     throw new Error(`Cannot convert value to number: ${value}`);
//   };
//
//   switch (operator) {
//     case 'dataModel': {
//       // Usage: ["component", "fieldName"]
//       const fieldName = params[0];
//       if (!formData) {
//         throw new Error('cannot use dataModel expression without data');
//       }
//       return formData[fieldName];
//     }
//
//     case 'component': {
//       // Usage: ["component", "fieldName"]
//       const fieldName = params[0];
//
//       if (!formData) {
//         throw new Error('cannot use component expression without data');
//       }
//
//       return formData[fieldName];
//     }
//
//     case 'equals': {
//       // Usage: ["equals", left, right]
//       const left = evalParam(params[0]);
//       const right = evalParam(params[1]);
//       return left === right;
//     }
//
//     case 'notEquals': {
//       // Usage: ["equals", left, right]
//       const left = evalParam(params[0]);
//       const right = evalParam(params[1]);
//       return left !== right;
//     }
//
//     case 'not': {
//       // Usage: ["not", expression]
//       const value = evalParam(params[0]);
//       return !value;
//     }
//
//     case 'and': {
//       // Usage: ["and", expr1, expr2, ...]
//       // Returns true if all are truthy
//       return params.every((p) => Boolean(evalParam(p)));
//     }
//
//     case 'or': {
//       // Usage: ["or", expr1, expr2, ...]
//       // Returns true if at least one is truthy
//       return params.some((p) => Boolean(evalParam(p)));
//     }
//
//     case 'if': {
//       // Usage: ["if", condition, thenValue, elseValue]
//       const [conditionExpr, thenExpr, elseExpr] = params;
//       return evalParam(conditionExpr) ? evalParam(thenExpr) : evalParam(elseExpr);
//     }
//
//     case 'lessThan': {
//       // Usage: ["lessThan", left, right]
//       const left = toNumber(evalParam(params[0]));
//       const right = toNumber(evalParam(params[1]));
//       return left < right;
//     }
//
//     case 'greaterThan': {
//       // Usage: ["greaterThan", left, right]
//       const left = toNumber(evalParam(params[0]));
//       const right = toNumber(evalParam(params[1]));
//       return left > right;
//     }
//
//     case 'add': {
//       // Usage: ["add", val1, val2, ...]
//       return params.reduce((acc, p) => acc + toNumber(evalParam(p)), 0);
//     }
//
//     case 'subtract': {
//       // Usage: ["subtract", val1, val2]
//       const left = toNumber(evalParam(params[0]));
//       const right = toNumber(evalParam(params[1]));
//       return left - right;
//     }
//
//     case 'multiply': {
//       // Usage: ["multiply", val1, val2]
//       const left = toNumber(evalParam(params[0]));
//       const right = toNumber(evalParam(params[1]));
//       return left * right;
//     }
//
//     case 'divide': {
//       // Usage: ["divide", val1, val2]
//       const left = toNumber(evalParam(params[0]));
//       const right = toNumber(evalParam(params[1]));
//       return left / right;
//     }
//
//     case 'concat': {
//       // Usage: ["concat", val1, val2, ...]
//       const values = params.map(evalParam);
//       return values.join('');
//     }
//
//     case 'lowerCase': {
//       // Usage: ["lowerCase", someString]
//       const value = evalParam(params[0]);
//       return String(value).toLowerCase();
//     }
//
//     case 'upperCase': {
//       // Usage: ["upperCase", someString]
//       const value = evalParam(params[0]);
//       return String(value).toUpperCase();
//     }
//
//     // Add additional operators as needed...
//
//     default:
//       throw new Error(`Unknown operator: ${operator}`);
//   }
// }
