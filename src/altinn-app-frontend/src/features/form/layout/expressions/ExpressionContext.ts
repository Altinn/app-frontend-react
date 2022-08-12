import type { IFormData } from 'src/features/form/data';
import type { ILayoutExpressionRunnerLookups } from 'src/features/form/layout/expressions/types';
import type { LayoutNode } from 'src/utils/layout/hierarchy';

import type {
  IApplicationSettings,
  IInstanceContext,
} from 'altinn-shared/types';

export interface ContextDataSources {
  instanceContext: IInstanceContext;
  applicationSettings: IApplicationSettings;
  formData: IFormData;
}

export class ExpressionContext {
  public lookup: ILayoutExpressionRunnerLookups;

  public constructor(
    public node: LayoutNode,
    private dataSources: ContextDataSources,
  ) {
    this.lookup = this.getLookups();
  }

  /**
   * A common implementation for the functions used by evalExpr() to look up data
   */
  private getLookups(): ILayoutExpressionRunnerLookups {
    return {
      instanceContext: (key) => {
        return this.dataSources.instanceContext[key];
      },
      applicationSettings: (key) => {
        return this.dataSources.applicationSettings[key];
      },
      component: (id) => {
        const component = this.node.closest(
          (c) => c.id === id || c.baseComponentId === id,
        );
        if (
          component &&
          component.item.dataModelBindings &&
          component.item.dataModelBindings.simpleBinding
        ) {
          return this.dataSources.formData[
            component.item.dataModelBindings.simpleBinding
          ];
        }
        console.error(
          `Component with id`,
          id,
          `not found, or it does not have a simpleBinding`,
        );
        return undefined;
      },
      dataModel: (path) => {
        const newPath = this.node.transposeDataModel(path);
        return this.dataSources.formData[newPath] || null;
      },
    };
  }
}
