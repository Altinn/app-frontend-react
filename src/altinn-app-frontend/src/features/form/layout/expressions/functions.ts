// TODO: Integrate this behaviour into the tests
function toString(arg: boolean | string): string {
  if (typeof arg === 'boolean' || typeof arg === 'number') {
    return JSON.stringify(arg);
  }
  if (arg === null || typeof arg === 'undefined') {
    return 'null';
  }

  return arg;
}

function toNumber(arg: any): number {
  if (typeof arg === 'string') {
    if (arg.match(/^\d+$/)) {
      return parseInt(arg, 10);
    }
    if (arg.match(/^[\d.]+$/)) {
      return parseFloat(arg);
    }
  }

  return 0;
}

export const layoutExpressionFunctions = {
  equals: (arg1, arg2) => toString(arg1) == toString(arg2),
  notEquals: (arg1, arg2) => toString(arg1) != toString(arg2),
  greaterThan: (arg1, arg2) => toNumber(arg1) > toNumber(arg2),
  greaterThanEq: (arg1, arg2) => toNumber(arg1) >= toNumber(arg2),
  lessThan: (arg1, arg2) => toNumber(arg1) < toNumber(arg2),
  lessThanEq: (arg1, arg2) => toNumber(arg1) <= toNumber(arg2),
};
