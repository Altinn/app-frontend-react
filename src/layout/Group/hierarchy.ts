import { getRepeatingGroupStartStopIndex } from 'src/utils/formLayout';
import { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { HRepGroup, HRepGroupChild, HRepGroupRow } from 'src/utils/layout/hierarchy.types';
import type {
  ChildFactoryProps,
  ChildMutator,
  HierarchyContext,
  ProcessorResult,
  UnprocessedItem,
} from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class GroupHierarchyGenerator extends ComponentHierarchyGenerator<'Group'> {
  stage1(item): void {
    for (const id of item.children) {
      const [, childId] = item.edit?.multiPage ? id.split(':', 2) : [undefined, id];
      this.generator.claimChild({ childId, parentId: item.id });
    }

    if (item.panel?.groupReference) {
      // PRIORITY: Indicate to later repeating groups that we'd like to have our children inside them
    }
  }

  stage2(ctx): ProcessorResult<'Group'> {
    const item = ctx.generator.prototype(ctx.id) as UnprocessedItem<'Group'>;
    if (item.panel?.groupReference) {
      // PRIORITY: Implement
      // return this.processPanelReference();
    }

    const isRepeating = item.maxCount && item.maxCount >= 1;
    if (isRepeating) {
      return this.processRepeating(ctx);
    }
    return this.processNonRepeating(ctx);
  }

  /**
   * Process non-repeating group. These are fairly simple, and just copy create regular LayoutNode objects for its
   * children.
   */
  private processNonRepeating(ctx: HierarchyContext): ProcessorResult<'Group'> {
    return (props) => {
      const prototype = this.generator.prototype(ctx.id) as UnprocessedItem<'Group'>;

      delete (props.item as any)['children'];
      const me = this.generator.makeNode(props);

      const childNodes: LayoutNode[] = [];
      for (const id of prototype.children) {
        const [, childId] = me.item.edit?.multiPage ? id.split(':', 2) : [undefined, id];
        childNodes.push(
          this.generator.newChild({
            ctx,
            parent: me,
            childId,
          }),
        );
      }

      if (me.isNonRepGroup()) {
        me.item.childComponents = childNodes;
      }

      return me;
    };
  }

  /**
   * Repeating groups are more complex, as they need to rewrite data model bindings, mapping, etc in their children.
   * Also, child components are repeated for each row (row = each group in the repeating structure).
   */
  private processRepeating(ctx: HierarchyContext): ProcessorResult<'Group'> {
    return (props) => {
      const prototype = this.generator.prototype(ctx.id) as UnprocessedItem<'Group'>;

      delete (props.item as any)['children'];
      const me = this.generator.makeNode(props);

      const rows: HRepGroupRow[] = [];
      const { startIndex, stopIndex } = getRepeatingGroupStartStopIndex(
        (this.generator.repeatingGroups || {})[props.item.id]?.index,
        props.item.edit,
      );

      for (let rowIndex = startIndex; rowIndex <= stopIndex; rowIndex++) {
        const rowChildren: LayoutNode<HRepGroupChild>[] = [];

        for (const id of prototype.children) {
          const [multiPageIndex, childId] = props.item.edit?.multiPage ? id.split(':', 2) : [undefined, id];
          rowChildren.push(
            this.generator.newChild({
              ctx,
              childId,
              parent: me,
              rowIndex,
              directMutators: [addMultiPageIndex(multiPageIndex)],
              recursiveMutators: [
                mutateComponentId(rowIndex),
                mutateDataModelBindings(props, rowIndex),
                mutateMapping(ctx, rowIndex),
              ],
            }),
          );
        }

        rows.push({
          index: rowIndex,
          items: rowChildren,
        });
      }

      const repItem = props.item as unknown as HRepGroup;
      repItem.rows = rows;

      return me;
    };
  }
}

const addMultiPageIndex: (multiPageIndex: string | undefined) => ChildMutator = (multiPageIndex) => (item) => {
  if (multiPageIndex !== undefined) {
    item['multiPageIndex'] = parseInt(multiPageIndex);
  }
};

const mutateComponentId: (rowIndex: number) => ChildMutator = (rowIndex) => (item) => {
  item.baseComponentId = item.baseComponentId || item.id;
  item.id += `-${rowIndex}`;
};

const mutateDataModelBindings: (props: ChildFactoryProps<'Group'>, rowIndex: number) => ChildMutator =
  (props, rowIndex) => (item) => {
    const groupBinding = props.item.dataModelBindings?.group;
    const bindings = item.dataModelBindings || {};
    for (const key of Object.keys(bindings)) {
      if (groupBinding && bindings[key]) {
        bindings[key] = bindings[key].replace(groupBinding, `${groupBinding}[${rowIndex}]`);
      }
    }
  };

const mutateMapping: (ctx: HierarchyContext, rowIndex: number) => ChildMutator = (ctx, rowIndex) => (item) => {
  if ('mapping' in item && item.mapping) {
    for (const key of Object.keys(item.mapping)) {
      const value = item.mapping[key];
      const newKey = key.replace(`[{${ctx.depth}}]`, `[${rowIndex}]`);
      delete item.mapping[key];
      item.mapping[newKey] = value;
    }
  }
};
