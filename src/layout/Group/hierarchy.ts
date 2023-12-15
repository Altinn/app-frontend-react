import { GridHierarchyGenerator } from 'src/layout/Grid/hierarchy';
import { groupIsNonRepeatingPanelExt } from 'src/layout/Group/tools';
import { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { CompGroupExternal } from 'src/layout/Group/config.generated';
import type {
  ChildFactory,
  HierarchyContext,
  HierarchyGenerator,
  UnprocessedItem,
} from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface GroupPanelRef {
  childPage: string;
  multiPage: boolean | undefined;
  children: string[];
  parentPage: string;
  parentId: string;
  nextChildren?: LayoutNode[];
}

export class GroupHierarchyGenerator extends ComponentHierarchyGenerator<'Group'> {
  private groupPanelRefs: { [key: string]: GroupPanelRef } = {};
  private innerGrid: GridHierarchyGenerator;

  constructor() {
    super();
    this.innerGrid = new GridHierarchyGenerator();
  }

  stage1(generator: HierarchyGenerator, item: UnprocessedItem<'Group'>): void {
    for (const id of item.children) {
      const [, childId] = [undefined, id];
      generator.claimChild({ childId, parentId: item.id });
    }

    if (groupIsNonRepeatingPanelExt(item) && item.panel?.groupReference?.group) {
      const groupId = item.panel.groupReference.group;
      const groupPrototype = generator.prototype(groupId);
      if (!groupPrototype) {
        window.logWarnOnce(`Group ${groupId} referenced by panel ${item.id} does not exist`);
        return;
      }

      this.groupPanelRefs[groupId] = {
        childPage: generator.topKey,
        multiPage: undefined,
        children: item.children,
        parentPage: generator.topKey,
        parentId: item.id,
      };
    }
  }

  stage2(ctx: HierarchyContext): ChildFactory<'Group'> {
    const item = ctx.generator.prototype(ctx.id) as UnprocessedItem<'Group'>;
    if (groupIsNonRepeatingPanelExt(item) && item.panel?.groupReference) {
      return this.processPanelReference(ctx);
    }

    return this.processNonRepeating(ctx);
  }

  childrenFromNode(node: LayoutNode<'Group'>): LayoutNode[] {
    let list: LayoutNode[] = [];

    if (node.isNonRepGroup()) {
      list = node.item.childComponents;
    }

    return list;
  }

  /**
   * Process a group that references another (repeating) group. It should have its own children, but those children
   * will be resolved as references inside a simulated next-row of the referenced repeating group.
   */
  private processPanelReference(ctx: HierarchyContext): ChildFactory<'Group'> {
    return (props) => {
      delete (props.item as any)['children'];
      const me = ctx.generator.makeNode(props);
      const item = props.item as CompGroupExternal;
      const groupId = groupIsNonRepeatingPanelExt(item) && item.panel?.groupReference?.group;
      if (!groupId) {
        throw new Error(`Group ${props.item.id} is a panel reference but does not reference a group`);
      }

      ctx.generator.addStage3Callback(() => {
        const ref = this.groupPanelRefs[groupId];
        if (!ref) {
          throw new Error(
            `Group panel ${props.item.id} references group ${groupId} which does not have a reference entry`,
          );
        }

        if (!ref.nextChildren) {
          throw new Error(
            `Group panel ${props.item.id} references group ${groupId} which did not generate nextChildren`,
          );
        }

        if (me.isNonRepGroup()) {
          me.item.childComponents = ref.nextChildren;
        }
      });

      return me;
    };
  }

  /**
   * Process non-repeating group. These are fairly simple, and just copy create regular LayoutNode objects for its
   * children.
   */
  private processNonRepeating(ctx: HierarchyContext): ChildFactory<'Group'> {
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

      if (me.isNonRepGroup()) {
        me.item.childComponents = childNodes;
      }

      return me;
    };
  }
}
