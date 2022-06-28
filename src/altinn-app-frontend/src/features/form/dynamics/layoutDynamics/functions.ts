import type {
  ILayoutDynamicsFunctions,
  ILayoutDynamicsAliases,
} from "src/features/form/dynamics/layoutDynamics/types";

export const layoutDynamicsFunctions: ILayoutDynamicsFunctions = {
  equals: (arg1, arg2) => arg1 == arg2,
  notEquals: (arg1, arg2) => arg1 != arg2,
  greaterThan: (arg1, arg2) => arg1 > arg2,
  greaterThanEq: (arg1, arg2) => arg1 >= arg2,
  lessThan: (arg1, arg2) => arg1 < arg2,
  lessThanEq: (arg1, arg2) => arg1 <= arg2,
};

export const layoutDynamicsAliases: ILayoutDynamicsAliases = {
  equals: ["=="],
  notEquals: ["!="],
  greaterThan: [">"],
  greaterThanEq: [">="],
  lessThan: ["<"],
  lessThanEq: ["<="],
};
