import type { ILayouts, ILayoutComponent } from "src/features/form/layout";
import type { IFormData } from "src/features/form/data/formDataReducer";
import type { IRepeatingGroups } from "src/types";
import type {
  ILayoutDynamicsExpr,
  ILayoutDynamicsArg,
  ILayoutDynamicsDataModelArg,
  ILayoutDynamicsInstanceContextArg,
  ILayoutDynamicsApplicationSettingsArg,
  ILayoutDynamicsComponentArg,
} from "src/features/form/dynamics/layoutDynamics/types";
import { layoutDynamicsFunctions } from "src/features/form/dynamics/layoutDynamics/functions";
import type {
  IApplicationSettings,
  IInstanceContext,
} from "altinn-shared/types";
import type {
  IRepeatingGroupHierarchy,
  ILayoutGroupHierarchy,
  IRepeatingGroupLayoutComponent,
  LayoutNode,
  AnyLayoutNode,
} from "src/utils/validation";
import { iterateFieldsInLayout } from "src/utils/validation";

export function runLayoutDynamics(
  findExpr: (
    component:
      | ILayoutComponent
      | IRepeatingGroupLayoutComponent
      | ILayoutGroupHierarchy
      | IRepeatingGroupHierarchy
  ) => undefined | boolean | ILayoutDynamicsExpr,
  layouts: ILayouts,
  formData: IFormData,
  instanceContext: IInstanceContext,
  applicationSettings: IApplicationSettings,
  repeatingGroups: IRepeatingGroups
): string[] {
  const out: string[] = [];

  for (const layout of Object.values(layouts)) {
    for (const component of iterateFieldsInLayout(
      layout.data.layout,
      repeatingGroups,
      true
    )) {
      const maybeExpr = findExpr(component.item);
      if (typeof maybeExpr === "undefined") {
        continue;
      }

      if (typeof maybeExpr === "boolean" && maybeExpr) {
        out.push(component.item.id);
      } else if (typeof maybeExpr === "object") {
        const result = runLayoutExpression(
          maybeExpr as ILayoutDynamicsExpr,
          formData,
          instanceContext,
          applicationSettings,
          component
        );
        if (result) {
          out.push(component.item.id);
        }
      }
    }
  }

  return out;
}

export function runDynamicsForLayouts(
  layouts: ILayouts,
  formData: IFormData,
  instanceContext: IInstanceContext,
  applicationSettings: IApplicationSettings
): string[] {
  const out: string[] = [];

  Object.keys(layouts).forEach((layout) => {
    const hidden = layouts[layout].hidden2; // TODO: rename to hidden
    if (hidden) {
      const result = runLayoutExpression(
        hidden,
        formData,
        instanceContext,
        applicationSettings
      );
      if (result) {
        out.push(layout);
      }
    }
  });
  return out;
}

function runLayoutExpression(
  expr: ILayoutDynamicsExpr,
  formData: IFormData,
  instanceContext: IInstanceContext,
  applicationSettings: IApplicationSettings,
  component?: LayoutNode<AnyLayoutNode>
): boolean {
  const computedArgs = (expr.args || []).map((arg) =>
    resolveArgument(
      arg,
      formData,
      instanceContext,
      applicationSettings,
      component
    )
  );
  return layoutDynamicsFunctions[expr.function].apply(null, computedArgs);
}

function resolveArgument(
  arg: ILayoutDynamicsArg,
  formData: IFormData,
  instanceContext: IInstanceContext,
  applicationSettings,
  component?: LayoutNode<AnyLayoutNode>
): string | undefined {
  if (typeof arg === "string") {
    return arg;
  }

  if (isDataModelArg(arg)) {
    return formData[arg.dataModel];
  }

  if (isInstanceContextArg(arg)) {
    return instanceContext[arg.instanceContext];
  }

  if (isApplicationSettingsArg(arg)) {
    return applicationSettings[arg.applicationSettings];
  }

  if (isComponentArg(arg) && component) {
    const foundComponent = component.closest(
      (c) =>
        c.id === arg.component || (c as any).baseComponentId === arg.component
    );
    if (foundComponent) {
      return formData[foundComponent.item.dataModelBindings.simpleBinding];
    }

    throw new Error("No such component found: " + arg.component);
  }

  throw new Error("Not implemented");
}

function isDataModelArg(
  arg: ILayoutDynamicsArg
): arg is ILayoutDynamicsDataModelArg {
  return typeof arg === "object" && "dataModel" in arg;
}

function isInstanceContextArg(
  arg: ILayoutDynamicsArg
): arg is ILayoutDynamicsInstanceContextArg {
  return typeof arg === "object" && "instanceContext" in arg;
}

function isApplicationSettingsArg(
  arg: ILayoutDynamicsArg
): arg is ILayoutDynamicsApplicationSettingsArg {
  return typeof arg === "object" && "applicationSettings" in arg;
}

function isComponentArg(
  arg: ILayoutDynamicsArg
): arg is ILayoutDynamicsComponentArg {
  return typeof arg === "object" && "component" in arg;
}
