import { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { CompTabGroupExternal, CompTabGroupInternal } from 'src/layout/TabGroup/config.generated';
import type { ChildFactory, HierarchyContext, HierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';

export class TabGroupHierarchyGenerator extends ComponentHierarchyGenerator<'TabGroup'> {
  override stage1(generator: HierarchyGenerator, item: CompTabGroupExternal): void {
    item.children.forEach((childId) => {
      if (this.canRenderInTabGroup(generator, childId)) {
        generator.claimChild({ childId, parentId: item.id });
      }
    });
  }
  override stage2(ctx: HierarchyContext): ChildFactory<'TabGroup'> {
    return this.processTabContent(ctx);
  }

  override childrenFromNode(node: BaseLayoutNode<CompTabGroupInternal, 'TabGroup'>): LayoutNode[] {
    return node.item.childComponents;
  }

  private processTabContent(ctx: HierarchyContext): ChildFactory<'TabGroup'> {
    return (props) => {
      const prototype = ctx.generator.prototype<'TabGroup'>(ctx.id);
      delete props.item['children'];
      const parentNode = ctx.generator.makeNode(props);

      const childNodes: LayoutNode[] = [];
      prototype?.children.forEach((childId) => {
        if (this.canRenderInTabGroup(ctx.generator, childId, false)) {
          const child = ctx.generator.newChild({
            ctx,
            parent: parentNode,
            childId,
          });
          child && childNodes.push(child);
        }
      });

      parentNode.item.childComponents = childNodes;
      return parentNode;
    };
  }

  /**
   * Check if a component can be rendered in an TabGroup.
   */
  private canRenderInTabGroup(generator: HierarchyGenerator, childId: string, outputWarning = true): boolean {
    const prototype = generator.prototype(childId);
    const child = prototype && generator.getLayoutComponentObject(prototype.type);

    const canRenderInTabGroup = !!child?.canRenderInTabGroup();

    if (outputWarning && prototype && !canRenderInTabGroup) {
      window.logWarn(`Component of type "${prototype.type}" cannot be rendered in a TabGroup`);
    }

    return canRenderInTabGroup;
  }
}
