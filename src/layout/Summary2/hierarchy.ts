import { GridHierarchyGenerator } from 'src/layout/Grid/hierarchy';
import { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type {
  ChildFactory,
  HierarchyContext,
  HierarchyGenerator,
  UnprocessedItem,
} from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class SummaryHierarchyGenerator extends ComponentHierarchyGenerator<'Summary2'> {
  private innerGrid: GridHierarchyGenerator;

  constructor() {
    super();
    this.innerGrid = new GridHierarchyGenerator();
  }

  stage1(generator: HierarchyGenerator, item: UnprocessedItem<'Summary2'>): void {
    if (item.children) {
      for (const id of item.children) {
        const [, childId] = [undefined, id];
        generator.claimChild({ childId, parentId: item.id });
      }
    }
  }

  stage2(ctx: HierarchyContext): ChildFactory<'Summary2'> {
    return this.processGroup(ctx);
  }

  childrenFromNode(node: LayoutNode<'Summary2'>): LayoutNode[] {
    const list: LayoutNode[] = node.item.childComponents;
    return list;
  }

  /**
   * Process non-repeating group. These are fairly simple, and just copy create regular LayoutNode objects for its
   * children.
   */
  private processGroup(ctx: HierarchyContext): ChildFactory<'Summary2'> {
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
