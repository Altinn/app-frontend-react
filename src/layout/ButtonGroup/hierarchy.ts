import { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { ButtonGroupChildType } from 'src/layout/ButtonGroup/types';
import type { ChildFactory, HierarchyContext, UnprocessedItem } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type IButtonComponentTypes = { [key in ButtonGroupChildType]: true };

const ButtonComponentTypes: IButtonComponentTypes = {
  Button: true,
  NavigationButtons: true,
  InstantiationButton: true,
  PrintButton: true,
};

export class ButtonGroupHierarchyGenerator extends ComponentHierarchyGenerator<'ButtonGroup'> {
  private isButton(childId: string, outputWarning = true): boolean {
    const prototype = this.generator.prototype(childId);

    if (outputWarning && prototype && !ButtonComponentTypes[prototype.type]) {
      console.warn(
        `ButtonGroup component included a component '${childId}', which ` +
          `is a '${prototype.type}' and cannot be rendered in a button group.`,
      );
    }

    return typeof prototype !== 'undefined' && ButtonComponentTypes[prototype.type];
  }

  stage1(item: UnprocessedItem<'ButtonGroup'>): void {
    for (const childId of item.children) {
      if (childId) {
        if (!this.isButton(childId)) {
          continue;
        }

        this.generator.claimChild({
          childId,
          parentId: item.id,
        });
      }
    }
  }

  stage2(ctx: HierarchyContext): ChildFactory<'ButtonGroup'> {
    return (props) => {
      const prototype = this.generator.prototype(ctx.id) as UnprocessedItem<'ButtonGroup'>;
      delete (props.item as any)['children'];
      const me = this.generator.makeNode(props);

      const childNodes: LayoutNode[] = [];
      for (const childId of prototype.children) {
        const child = this.generator.newChild({
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
}
