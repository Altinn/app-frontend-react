import { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { CompTabExternal, CompTabInternal } from 'src/layout/Tab/config.generated';
import type { ChildFactory, HierarchyContext, HierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';

export class TabHierarchyGenerator extends ComponentHierarchyGenerator<'Tab'> {
  stage1(generator: HierarchyGenerator, item: CompTabExternal): void {
    item.children.forEach((childId) => {
      if (this.canRenderInTab(generator, childId)) {
        generator.claimChild({ childId, parentId: item.id });
      }
    });
  }

  stage2(ctx: HierarchyContext): ChildFactory<'Tab'> {
    return this.processTabContent(ctx);
  }

  childrenFromNode(node: BaseLayoutNode<CompTabInternal, 'Tab'>): LayoutNode[] {
    return node.item.childComponents;
  }

  private processTabContent(ctx: HierarchyContext): ChildFactory<'Tab'> {
    return (props) => {
      const prototype = ctx.generator.prototype<'Tab'>(ctx.id);
      delete props.item['children'];
      const parentNode = ctx.generator.makeNode(props);

      const childNodes: LayoutNode[] = [];
      prototype?.children.forEach((childId) => {
        if (this.canRenderInTab(ctx.generator, childId, false)) {
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

  private canRenderInTab(generator: HierarchyGenerator, childId: string, outputWarning = true): boolean {
    const prototype = generator.prototype(childId);
    const child = prototype && generator.getLayoutComponentObject(prototype.type);

    const canRenderInTab = !!child?.canRenderInTab();

    if (outputWarning && prototype && !canRenderInTab) {
      window.logWarn(`Component of type "${prototype.type}" cannot be rendered in a Tab`);
    }

    return canRenderInTab;
  }
}
