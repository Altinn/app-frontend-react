import dot from 'dot-object';

import { getRepeatingGroupStartStopIndex } from 'src/utils/formLayout';
import { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { CompLikertInternal } from 'src/layout/Likert/config.generated';
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
  UnprocessedItem,
} from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class LikertGroupHierarchyGenerator extends ComponentHierarchyGenerator<'LikertGroup'> {
  stage1(): void {}

  stage2(ctx: HierarchyContext): ChildFactory<'LikertGroup'> {
    return this.processLikertQuestions(ctx);
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
   * For each likert question we need to generate a node based on the questions in the datamodel and rewrite their data
   * model bindings, mapping, etc based on which row they belong to.
   */
  private processLikertQuestions(ctx: HierarchyContext): ChildFactory<'LikertGroup'> {
    return (props) => {
      delete (props.item as any)['children'];
      const item = props.item as CompLikertGroupExternal;
      const me = ctx.generator.makeNode(props);
      const rows: HLikertGroupRows = [];
      const formData = item.dataModelBindings?.questions
        ? dot.pick(item.dataModelBindings.questions, ctx.generator.dataSources.formData)
        : undefined;
      const lastIndex = formData && Array.isArray(formData) ? formData.length - 1 : -1;

      const { startIndex, stopIndex } = getRepeatingGroupStartStopIndex(
        lastIndex,
        'edit' in props.item ? (props.item.edit as ILikertGroupEditProperties) : {},
      );

      const prototype = ctx.generator.prototype(ctx.id) as UnprocessedItem<'Likert'>;

      for (let rowIndex = startIndex; rowIndex <= stopIndex; rowIndex++) {
        const rowChildren: LayoutNode[] = [];

        const itemProps = structuredClone(prototype);

        const childItem = {
          ...itemProps,
          type: 'Likert',
        } as unknown as CompLikertInternal;

        mutateComponentId(rowIndex)(childItem);
        mutateTextResourceBindings(props)(childItem);
        mutateDataModelBindings(props, rowIndex)(childItem);
        mutateMapping(ctx, rowIndex)(childItem);

        const child = ctx.generator.makeNode({ item: childItem, parent: me, rowIndex });

        child && rowChildren.push(child as LayoutNode);

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

const mutateComponentId: (rowIndex: number) => ChildMutator<'Likert'> = (rowIndex) => (item) => {
  item.baseComponentId = item.baseComponentId || item.id;
  item.id += `-${rowIndex}`;
};

const mutateTextResourceBindings: (props: ChildFactoryProps<'LikertGroup'>) => ChildMutator<'Likert'> =
  (props) => (item) => {
    const question =
      'textResourceBindings' in props.item ? (props.item.textResourceBindings?.questions as string) : undefined;
    const textResourceBindings = item.textResourceBindings || {};
    delete textResourceBindings.description;
    if (question && textResourceBindings) {
      textResourceBindings.title = question;
    }
  };

const mutateDataModelBindings: (props: ChildFactoryProps<'LikertGroup'>, rowIndex: number) => ChildMutator<'Likert'> =
  (props, rowIndex) => (item) => {
    const groupBinding = 'dataModelBindings' in props.item ? props.item.dataModelBindings?.questions : undefined;
    const bindings = item.dataModelBindings || {};
    for (const key of Object.keys(bindings)) {
      if (groupBinding && bindings[key]) {
        bindings[key] = bindings[key].replace(groupBinding, `${groupBinding}[${rowIndex}]`);
      }
    }
  };

const mutateMapping: (ctx: HierarchyContext, rowIndex: number) => ChildMutator<'Likert'> =
  (ctx, rowIndex) => (item) => {
    if ('mapping' in item && item.mapping) {
      const depthMarker = ctx.depth - 1;
      for (const [key, value] of Object.keys(item.mapping)) {
        const newKey = key.replace(`[{${depthMarker}}]`, `[${rowIndex}]`);
        delete item.mapping[key];
        item.mapping[newKey] = value;
      }
    }
  };
