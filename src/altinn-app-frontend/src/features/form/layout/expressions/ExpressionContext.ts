import { LookupNotFound } from 'src/features/form/layout/expressions/index';
import type { IFormData } from 'src/features/form/data';
import type { ILayoutExpressionLookupFunctions } from 'src/features/form/layout/expressions/types';
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
  public lookup: ILayoutExpressionLookupFunctions;

  public constructor(
    public node: LayoutNode,
    private dataSources: ContextDataSources,
  ) {
    this.lookup = this.getLookups();
  }

  /**
   * A common implementation for the functions used by evalExpr() to look up data
   */
  private getLookups(): ILayoutExpressionLookupFunctions {
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

        throw new LookupNotFound(
          'component',
          id,
          'or it does not have a simpleBinding',
        );
      },
      dataModel: (path) => {
        const newPath = this.node.transposeDataModel(path);
        return this.dataSources.formData[newPath] || null;
      },
    };
  }
}
