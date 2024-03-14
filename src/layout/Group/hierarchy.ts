import { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type {
  ChildFactory,
  HierarchyContext,
  HierarchyGenerator,
  UnprocessedItem,
} from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class GroupHierarchyGenerator extends ComponentHierarchyGenerator<'Group'> {
  stage1(generator: HierarchyGenerator, item: UnprocessedItem<'Group'>): void {
    for (const id of item.children) {
      const [, childId] = [undefined, id];
      generator.claimChild({ childId, parentId: item.id });
    }
  }

  stage2(ctx: HierarchyContext): ChildFactory<'Group'> {
    return this.processGroup(ctx);
  }

  childrenFromNode(node: LayoutNode<'Group'>): LayoutNode[] {
    return node.item.childComponents;
  }

  /**
   * Process non-repeating group. These are fairly simple, and just copy create regular LayoutNode objects for its
   * children.
   */
  private processGroup(ctx: HierarchyContext): ChildFactory<'Group'> {
    return (props) => {
      const prototype = ctx.generator.prototype(ctx.id) as UnprocessedItem<'Group'>;

      delete (props.item as any)['children'];
      const me = ctx.generator.makeNode(props);

      const childNodes: LayoutNode[] = [];
      for (const id of prototype.children) {
        const [, childId] = [undefined, id];
        const child = ctx.generator.newChild({
          ctx,
          parent: me,
          childId,
        });
        child && childNodes.push(child as LayoutNode);
      }

      me.item.childComponents = childNodes;

      return me;
    };
  }
}
