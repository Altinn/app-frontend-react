import { getRepeatingGroupStartStopIndex } from 'src/utils/formLayout';
import type { HRepGroup, HRepGroupChild, HRepGroupRow } from 'src/utils/layout/hierarchy.types';
import type {
  ChildFactoryProps,
  ChildMutator,
  HierarchyContext,
  ProcessorResult,
  UnprocessedItem,
} from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Process non-repeating group. These are fairly simple, and just copy create regular LayoutNode objects for its
 * children.
 */
export const processNonRepeating =
  (ctx: HierarchyContext): ProcessorResult<'Group'> =>
  (props) => {
    const prototype = ctx.generator.prototype(ctx.id) as UnprocessedItem<'Group'>;

    delete (props.item as any)['children'];
    const me = ctx.generator.makeNode(props);

    const childNodes: LayoutNode[] = [];
    for (const id of prototype.children) {
      const [, childId] = me.item.edit?.multiPage ? id.split(':', 2) : [undefined, id];
      childNodes.push(
        ctx.generator.newChild({
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

/**
 * Repeating groups are more complex, as they need to rewrite data model bindings, mapping, etc in their children.
 * Also, child components are repeated for each row (row = each group in the repeating structure).
 */
export const processRepeating =
  (ctx: HierarchyContext): ProcessorResult<'Group'> =>
  (props) => {
    const prototype = ctx.generator.prototype(ctx.id) as UnprocessedItem<'Group'>;

    delete (props.item as any)['children'];
    const me = ctx.generator.makeNode(props);

    const rows: HRepGroupRow[] = [];
    const { startIndex, stopIndex } = getRepeatingGroupStartStopIndex(
      (ctx.generator.repeatingGroups || {})[props.item.id]?.index,
      props.item.edit,
    );

    for (let rowIndex = startIndex; rowIndex <= stopIndex; rowIndex++) {
      const rowChildren: LayoutNode<HRepGroupChild>[] = [];

      for (const id of prototype.children) {
        const [multiPageIndex, childId] = props.item.edit?.multiPage ? id.split(':', 2) : [undefined, id];
        rowChildren.push(
          ctx.generator.newChild({
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
