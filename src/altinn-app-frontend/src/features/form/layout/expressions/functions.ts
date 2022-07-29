import type { ILayoutExpressionAliases } from 'src/features/form/layout/expressions/types';

export const layoutExpressionFunctions = {
  equals: (arg1, arg2) => arg1 == arg2,
  notEquals: (arg1, arg2) => arg1 != arg2,
  greaterThan: (arg1, arg2) => arg1 > arg2,
  greaterThanEq: (arg1, arg2) => arg1 >= arg2,
  lessThan: (arg1, arg2) => arg1 < arg2,
  lessThanEq: (arg1, arg2) => arg1 <= arg2,
};

export const layoutExpressionAliases: ILayoutExpressionAliases = {
  equals: [{ '==': /==/ }],
  notEquals: [{ '!=': /!=/ }],
  greaterThan: [{ '>': />/ }],
  greaterThanEq: [{ '>=': />=/ }],
  lessThan: [{ '<': /</ }],
  lessThanEq: [{ '<=': /<=/ }],
};
