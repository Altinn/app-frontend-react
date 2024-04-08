import { CG } from 'src/codegen/CG';
import { NodeStatePlugin } from 'src/utils/layout/NodeStatePlugin';
import type { CompDef, NodeRef } from 'src/layout';
import type { CompTypes } from 'src/layout/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { BaseItemState, ItemStore, StateFactoryProps } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeStateChildrenPlugin } from 'src/utils/layout/NodeStatePlugin';

interface ChildrenStateExtension {
  childItems: { [key: string]: ItemStore };
}

interface ChildrenEvalOutput {
  children: undefined;
  childComponents: NodeRef[];
}

export class SimpleChildrenPlugin<Type extends CompTypes>
  extends NodeStatePlugin<Type, ChildrenStateExtension, ChildrenEvalOutput>
  implements NodeStateChildrenPlugin<Type, ChildrenStateExtension>
{
  makeImport() {
    return new CG.import({
      import: 'SimpleChildrenPlugin',
      from: 'src/utils/layout/plugins/SimpleChildrenPlugin',
    });
  }

  stateFactory(_props: StateFactoryProps<Type>): ChildrenStateExtension {
    return {
      childItems: {},
    };
  }

  evalDefaultExpressions(_props: ExprResolver<Type>): ChildrenEvalOutput {
    return {
      children: undefined,
      childComponents: [],
    };
  }

  pickDirectChildren(
    _state: ChildrenStateExtension & BaseItemState<Type>,
    _restriction?: ChildLookupRestriction | undefined,
  ): ItemStore[] {
    throw new Error('Method not implemented.');
  }

  pickChild<C extends CompTypes>(
    _state: ChildrenStateExtension & BaseItemState<Type>,
    _path: string[],
    _parentPath: string[],
  ): ReturnType<CompDef<C>['stateFactory']> {
    throw new Error('Method not implemented.');
  }

  addChild(_state: ChildrenStateExtension & BaseItemState<Type>, _childNode: LayoutNode, _childStore: ItemStore): void {
    throw new Error('Method not implemented.');
  }

  removeChild(_state: ChildrenStateExtension & BaseItemState<Type>, _childNode: LayoutNode): void {
    throw new Error('Method not implemented.');
  }
}
