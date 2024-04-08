import type { CompDef } from '..';

import { CG } from 'src/codegen/CG';
import { NodeStatePlugin } from 'src/utils/layout/NodeStatePlugin';
import type { GridRowsInternal } from 'src/layout/Grid/types';
import type { CompTypes } from 'src/layout/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { BaseItemState, ItemStore, StateFactoryProps } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeStateChildrenPlugin } from 'src/utils/layout/NodeStatePlugin';

interface GridRowsStateExtension {
  rowItems: any[];
}

interface GridRowsEvalOutput {
  rows: GridRowsInternal;
}

export class GridRowsPlugin<Type extends CompTypes>
  extends NodeStatePlugin<Type, GridRowsStateExtension, GridRowsEvalOutput>
  implements NodeStateChildrenPlugin<Type, GridRowsStateExtension>
{
  makeImport() {
    return new CG.import({
      import: 'GridRowsPlugin',
      from: 'src/layout/Grid/GridRowsPlugin',
    });
  }

  stateFactory(_props: StateFactoryProps<Type>): GridRowsStateExtension {
    return {
      rowItems: [],
    };
  }

  evalDefaultExpressions(props: ExprResolver<Type>): GridRowsEvalOutput {
    return {
      rows: (props.item as any).rows as GridRowsInternal,
    };
  }

  pickDirectChildren(
    _state: GridRowsStateExtension & BaseItemState<Type>,
    _restriction?: ChildLookupRestriction | undefined,
  ): ItemStore[] {
    throw new Error('Method not implemented.');
  }

  pickChild<C extends CompTypes>(
    _state: GridRowsStateExtension & BaseItemState<Type>,
    _path: string[],
    _parentPath: string[],
  ): ReturnType<CompDef<C>['stateFactory']> {
    throw new Error('Method not implemented.');
  }

  addChild(_state: GridRowsStateExtension & BaseItemState<Type>, _childNode: LayoutNode, _childStore: ItemStore): void {
    throw new Error('Method not implemented.');
  }

  removeChild(_state: GridRowsStateExtension & BaseItemState<Type>, _childNode: LayoutNode): void {
    throw new Error('Method not implemented.');
  }
}
