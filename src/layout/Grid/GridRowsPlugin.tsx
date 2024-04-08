import type { CompDef, NodeRef } from '..';

import { CG } from 'src/codegen/CG';
import { NodeStatePlugin } from 'src/utils/layout/NodeStatePlugin';
import type { GridRowsInternal } from 'src/layout/Grid/types';
import type { CompTypes } from 'src/layout/layout';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { ItemStore } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  NodeStateChildrenPlugin,
  PluginExprResolver,
  PluginState,
  PluginStateFactoryProps,
} from 'src/utils/layout/NodeStatePlugin';

interface Config<Type extends CompTypes> {
  componentType: Type;
  extraState: {
    rowItems: any[];
  };
  extraInItem: {
    rows: GridRowsInternal;
  };
}

export class GridRowsPlugin<Type extends CompTypes>
  extends NodeStatePlugin<Config<Type>>
  implements NodeStateChildrenPlugin<Config<Type>>
{
  makeImport() {
    return new CG.import({
      import: 'GridRowsPlugin',
      from: 'src/layout/Grid/GridRowsPlugin',
    });
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
    throw new Error('Method not implemented.');
  }

  pickChild<C extends CompTypes>(
    _state: PluginState<Config<Type>>,
    _childId: string,
    _parentPath: string[],
  ): ReturnType<CompDef<C>['stateFactory']> {
    throw new Error('Method not implemented.');
  }

  addChild(_state: PluginState<Config<Type>>, _childNode: LayoutNode, _childStore: ItemStore): void {
    throw new Error('Method not implemented.');
  }

  removeChild(_state: PluginState<Config<Type>>, _childNode: LayoutNode): void {
    throw new Error('Method not implemented.');
  }
}
