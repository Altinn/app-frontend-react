import type { CompDef, NodeRef } from '..';

import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NodeDefPlugin } from 'src/utils/layout/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { GridRows } from 'src/layout/common.generated';
import type { GridRowsInternal } from 'src/layout/Grid/types';
import type { CompTypes } from 'src/layout/layout';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { ItemStore } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  NodeDefChildrenPlugin,
  PluginChildClaimerProps,
  PluginExprResolver,
  PluginState,
  PluginStateFactoryProps,
} from 'src/utils/layout/NodeDefPlugin';

interface Config<Type extends CompTypes> {
  componentType: Type;
  expectedFromExternal: {
    rows: GridRows;
  };
  extraState: {
    rowItems: any[];
  };
  extraInItem: {
    rows: GridRowsInternal;
  };
}

export class GridRowsPlugin<Type extends CompTypes>
  extends NodeDefPlugin<Config<Type>>
  implements NodeDefChildrenPlugin<Config<Type>>
{
  makeImport() {
    return new CG.import({
      import: 'GridRowsPlugin',
      from: 'src/layout/Grid/GridRowsPlugin',
    });
  }

  addToComponent(component: ComponentConfig): void {
    if (component.config.category !== CompCategory.Container) {
      throw new Error('GridRowsPlugin can only be used with container components');
    }
  }

  claimChildren(_props: PluginChildClaimerProps<Config<Type>>): void {
    throw new Error('Method not implemented: claimChildren');
  }

  stateFactory(_props: PluginStateFactoryProps<Config<Type>>): Config<Type>['extraState'] {
    return {
      rowItems: [],
    };
  }

  evalDefaultExpressions(props: PluginExprResolver<Config<Type>>): Config<Type>['extraInItem'] {
    return {
      rows: (props.item as any).rows as GridRowsInternal,
    };
  }

  pickDirectChildren(_state: PluginState<Config<Type>>, _restriction?: ChildLookupRestriction | undefined): NodeRef[] {
    throw new Error('Method not implemented: pickDirectChildren');
  }

  pickChild<C extends CompTypes>(
    _state: PluginState<Config<Type>>,
    _childId: string,
    _parentPath: string[],
  ): ReturnType<CompDef<C>['stateFactory']> {
    throw new Error('Method not implemented: pickChild');
  }

  addChild(_state: PluginState<Config<Type>>, _childNode: LayoutNode, _childStore: ItemStore): void {
    throw new Error('Method not implemented: addChild');
  }

  removeChild(_state: PluginState<Config<Type>>, _childNode: LayoutNode): void {
    throw new Error('Method not implemented: removeChild');
  }
}
