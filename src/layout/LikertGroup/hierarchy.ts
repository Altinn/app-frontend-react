import { getRepeatingGroupStartStopIndex } from 'src/utils/formLayout';
import { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type {
  CompLikertGroupExternal,
  HLikertGroupRows,
  ILikertGroupEditProperties,
} from 'src/layout/LikertGroup/config.generated';
import type {
  ChildFactory,
  ChildFactoryProps,
  ChildMutator,
  HierarchyContext,
  HierarchyGenerator,
  UnprocessedItem,
} from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class LikertGroupHierarchyGenerator extends ComponentHierarchyGenerator<'LikertGroup'> {
  stage1(generator: HierarchyGenerator, item: UnprocessedItem<'LikertGroup'>): void {
    for (const id of item.children) {
      const [, childId] = [undefined, id];
      generator.claimChild({ childId, parentId: item.id });
    }
  }

  stage2(ctx: HierarchyContext): ChildFactory<'LikertGroup'> {
    return this.processRepeating(ctx);
  }

  childrenFromNode(node: LayoutNode<'LikertGroup'>, onlyInRowIndex?: number): LayoutNode[] {
    const list: LayoutNode[] = [];

    const maybeNodes =
      typeof onlyInRowIndex === 'number'
        ? node.item.rows.find((r) => r && r.index === onlyInRowIndex)?.items || []
        : // Beware: In most cases this will just match the first row.
          Object.values(node.item.rows)
            .map((r) => r?.items)
            .flat();

    for (const node of maybeNodes) {
      if (node) {
        list.push(node);
      }
    }
    return list;
  }

  /**
   * Repeating groups are more complex, as they need to rewrite data model bindings, mapping, etc in their children.
   * Also, child components are repeated for each row (row = each group in the repeating structure).
   */
  private processRepeating(ctx: HierarchyContext): ChildFactory<'LikertGroup'> {
    return (props) => {
      const prototype = ctx.generator.prototype(ctx.id) as UnprocessedItem<'LikertGroup'>;
      delete (props.item as any)['children'];
      const item = props.item as CompLikertGroupExternal;
      const me = ctx.generator.makeNode(props);
      const rows: HLikertGroupRows = [];
      const formData = item.dataModelBindings?.group
        ? dot.pick(item.dataModelBindings.group, ctx.generator.dataSources.formData)
        : undefined;
      const lastIndex = formData && Array.isArray(formData) ? formData.length - 1 : -1;

      const { startIndex, stopIndex } = getRepeatingGroupStartStopIndex(
        lastIndex,
        'edit' in props.item ? (props.item.edit as ILikertGroupEditProperties) : {},
      );

      for (let rowIndex = startIndex; rowIndex <= stopIndex; rowIndex++) {
        const rowChildren: LayoutNode[] = [];

        for (const id of prototype.children) {
          const [multiPageIndex, childId] = [undefined, id];
          const child = ctx.generator.newChild({
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
          });
          child && rowChildren.push(child as LayoutNode);
        }

        rows.push({
          index: rowIndex,
          items: rowChildren,
        });
      }

      me.item.rows = rows;
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

const mutateDataModelBindings: (
  props: ChildFactoryProps<'LikertGroup'>,
  rowIndex: number,
) => ChildMutator<'LikertGroup'> = (props, rowIndex) => (item) => {
  const groupBinding = 'dataModelBindings' in props.item ? props.item.dataModelBindings?.group : undefined;
  const bindings = item.dataModelBindings || {};
  for (const key of Object.keys(bindings)) {
    if (groupBinding && bindings[key]) {
      bindings[key] = bindings[key].replace(groupBinding, `${groupBinding}[${rowIndex}]`);
    }
  }
};

const mutateMapping: (ctx: HierarchyContext, rowIndex: number) => ChildMutator = (ctx, rowIndex) => (item) => {
  if ('mapping' in item && item.mapping) {
    const depthMarker = ctx.depth - 1;
    for (const key of Object.keys(item.mapping)) {
      const value = item.mapping[key];
      const newKey = key.replace(`[{${depthMarker}}]`, `[${rowIndex}]`);
      delete item.mapping[key];
      item.mapping[newKey] = value;
    }
  }
};
