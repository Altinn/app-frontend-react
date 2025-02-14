// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

type Expression = any; // Simplify for brevity, but you can refine this

// A basic helper to get deep values from an object based on a path array
function getValue(obj: any, path: string[]): any {
  let result = obj;
  for (const key of path) {
    if (result === undefined || result === null) {
      return undefined;
    }
    result = result[key];
  }
  return result;
}

/**
 * Evaluate an expression (array or literal) given the dataModel.
 * Expression can look like ["equals", ["dataModel", "shortAnswerInput"], "hide"] etc.
 */
export function evaluateExpression(expression: Expression, dataModel: any): boolean | string | number {
  // If it's not an array, return the literal directly
  if (!Array.isArray(expression)) {
    return expression;
  }

  const [operator, ...args] = expression;

  switch (operator) {
    case 'equals': {
      // example: ["equals", ["dataModel", "shortAnswerInput"], "hide"]
      // Evaluate left and right
      const left = evaluateExpression(args[0], dataModel);
      const right = evaluateExpression(args[1], dataModel);
      // For 'hidden' to be true, we expect boolean. The expression returns a boolean:
      return left === right;
    }
    case 'dataModel': {
      // example: ["dataModel", "shortAnswerInput"]
      // The rest of the array represents a path in dataModel
      return getValue(dataModel, args);
    }
    // Add your own operators as needed (e.g. "notEquals", "greaterThan", "and", "or", etc).
    default:
      return false; // By default, return false or some fallback
  }
}
