import { CG } from 'src/codegen/CG';
import { NodeStatePlugin } from 'src/utils/layout/NodeStatePlugin';
import type { NodeRef } from 'src/layout';
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
    state: ChildrenStateExtension & BaseItemState<Type>,
    _restriction?: ChildLookupRestriction,
  ): ItemStore[] {
    return Object.values(state.childItems);
  }

  pickChild<C extends CompTypes>(
    state: ChildrenStateExtension & BaseItemState<Type>,
    childId: string,
    parentPath: string[],
  ): ItemStore<C> {
    const child = state.childItems[childId];
    if (!child) {
      throw new Error(`Child with id ${childId} not found in /${parentPath.join('/')}`);
    }
    return child as ItemStore<C>;
  }

  addChild(state: ChildrenStateExtension & BaseItemState<Type>, childNode: LayoutNode, childStore: ItemStore): void {
    state.childItems[childNode.getId()] = childStore;
  }

  removeChild(state: ChildrenStateExtension & BaseItemState<Type>, childNode: LayoutNode): void {
    delete state.childItems[childNode.getId()];
  }
}
