import { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type {
  ChildFactory,
  HierarchyContext,
  HierarchyGenerator,
  UnprocessedItem,
} from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class CardGroupHierarchyGenerator extends ComponentHierarchyGenerator<'CardGroup'> {
  private canRenderInCardGroup(generator: HierarchyGenerator, childId: string, outputWarning = true): boolean {
    const prototype = generator.prototype(childId);
    const def = prototype && generator.getLayoutComponentObject(prototype.type);

    if (outputWarning && prototype && !def?.canRenderInCardGroup()) {
      window.logWarnOnce(
        `CardGroup component included a component '${childId}', which ` +
          `is a '${prototype.type}' and cannot be rendered in a Card group.`,
      );
    }

    return def?.canRenderInCardGroup() === true;
  }

  stage1(generator: HierarchyGenerator, item: UnprocessedItem<'CardGroup'>): void {
    for (const childId of item.children) {
      if (childId) {
        if (!this.canRenderInCardGroup(generator, childId)) {
          continue;
        }

        generator.claimChild({
          childId,
          parentId: item.id,
        });
      }
    }
  }

  stage2(ctx: HierarchyContext): ChildFactory<'CardGroup'> {
    return (props) => {
      const prototype = ctx.generator.prototype(ctx.id) as UnprocessedItem<'CardGroup'>;
      delete props.item['children'];
      const me = ctx.generator.makeNode(props);

      const childNodes: LayoutNode[] = [];
      for (const childId of prototype.children) {
        if (!this.canRenderInCardGroup(ctx.generator, childId, false)) {
          continue;
        }

        const child = ctx.generator.newChild({
          ctx,
          parent: me,
          childId,
        });
        child && childNodes.push(child);
      }

      me.item.childComponents = childNodes;

      return me;
    };
  }

  childrenFromNode(node: LayoutNode<'CardGroup'>): LayoutNode[] {
    return node.item.childComponents;
  }
}
