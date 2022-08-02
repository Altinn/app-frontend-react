import {
  layoutAsHierarchy,
  layoutAsHierarchyWithRows,
  LayoutNode,
  LayoutRootNode,
  nodesInLayout,
} from 'src/utils/layout/hierarchy';
import type {
  ILayout,
  ILayoutCompHeader,
  ILayoutCompInput,
  ILayoutGroup,
} from 'src/features/form/layout';
import type { IRepeatingGroups } from 'src/types';

describe('Hierarchical layout tools', () => {
  const header: Omit<ILayoutCompHeader, 'id'> = { type: 'Header', size: 'L' };
  const input: Omit<ILayoutCompInput, 'id'> = { type: 'Input' };
  const group: Omit<ILayoutGroup, 'id' | 'children'> = { type: 'Group' };
  const repGroup: Omit<ILayoutGroup, 'id' | 'children'> = {
    type: 'Group',
    maxCount: 3,
  };
  const components = {
    top1: { id: 'top1', ...header },
    top2: { id: 'top2', ...input },
    group1: { id: 'group1', ...group },
    group1h: { id: 'group1_header', ...header },
    group1i: { id: 'group1_input', ...input },
    group2: {
      id: 'group2',
      dataModelBindings: {
        group: 'MyModel.Group2',
      },
      ...repGroup,
    },
    group2h: { id: 'group2_header', ...header },
    group2i: {
      id: 'group2_input',
      ...input,
      dataModelBindings: {
        simpleBinding: 'MyModel.Group2.Input',
      },
    },
    group2n: {
      id: 'group2nested',
      ...repGroup,
      dataModelBindings: {
        group: 'MyModel.Group2.Nested',
      },
    },
    group2nh: { id: 'group2nested_header', ...header },
    group2ni: {
      id: 'group2nested_input',
      ...input,
      dataModelBindings: {
        simpleBinding: 'MyModel.Group2.Nested.Input',
      },
    },
    group3: { id: 'group3', ...repGroup, edit: { multiPage: true } },
    group3h: { id: 'group3_header', ...header },
    group3i: { id: 'group3_input', ...input },
    group3n: { id: 'group3nested', ...repGroup },
    group3nh: { id: 'group3nested_header', ...header },
    group3ni: { id: 'group3nested_input', ...input },
  };

  const layout: ILayout = [
    components.top1,
    components.top2,
    {
      ...components.group1,
      children: [components.group1h.id, components.group1i.id],
    },
    components.group1h,
    components.group1i,
    {
      ...components.group2,
      children: [
        components.group2h.id,
        components.group2i.id,
        components.group2n.id,
      ],
    },
    components.group2h,
    components.group2i,
    {
      ...components.group2n,
      children: [components.group2nh.id, components.group2ni.id],
    },
    components.group2nh,
    components.group2ni,
    {
      ...components.group3,
      children: [
        `0:${components.group3h.id}`,
        `1:${components.group3i.id}`,
        `2:${components.group3n.id}`,
      ],
    },
    components.group3h,
    components.group3i,
    {
      ...components.group3n,
      children: [components.group3nh.id, components.group3ni.id],
    },
    components.group3nh,
    components.group3ni,
  ];

  describe('layoutAsHierarchy', () => {
    it('should turn a layout into a hierarchy', () => {
      expect(layoutAsHierarchy(layout)).toEqual([
        components.top1,
        components.top2,
        {
          ...components.group1,
          childComponents: [components.group1h, components.group1i],
        },
        {
          ...components.group2,
          childComponents: [
            components.group2h,
            components.group2i,
            {
              ...components.group2n,
              childComponents: [components.group2nh, components.group2ni],
            },
          ],
        },
        {
          ...components.group3,
          childComponents: [
            components.group3h,
            components.group3i,
            {
              ...components.group3n,
              childComponents: [components.group3nh, components.group3ni],
            },
          ],
        },
      ]);
    });
  });

  const repeatingGroups: IRepeatingGroups = {
    [components.group2.id]: {
      index: 1,
      baseGroupId: components.group2.id,
    },
    [`${components.group2n.id}-0`]: {
      index: 1,
      baseGroupId: components.group2n.id,
    },
    [`${components.group2n.id}-1`]: {
      index: 0,
      baseGroupId: components.group2n.id,
    },
  };

  describe('layoutAsHierarchyWithRows', () => {
    it('should generate a hierarchy for a simple layout', () => {
      const commonComponents = (row: number) => [
        {
          ...components.group2h,
          id: `${components.group2h.id}-${row}`,
          baseComponentId: components.group2h.id,
        },
        {
          ...components.group2i,
          id: `${components.group2i.id}-${row}`,
          baseComponentId: components.group2i.id,
          dataModelBindings: {
            simpleBinding: `MyModel.Group2[${row}].Input`,
          },
          baseDataModelBindings: components.group2i.dataModelBindings,
        },
      ];

      const nestedComponents = (row: number, nestedRow: number) => [
        {
          ...components.group2nh,
          id: `${components.group2nh.id}-${row}-${nestedRow}`,
          baseComponentId: components.group2nh.id,
        },
        {
          ...components.group2ni,
          id: `${components.group2ni.id}-${row}-${nestedRow}`,
          baseComponentId: components.group2ni.id,
          dataModelBindings: {
            simpleBinding: `MyModel.Group2[${row}].Nested[${nestedRow}].Input`,
          },
          baseDataModelBindings: components.group2ni.dataModelBindings,
        },
      ];

      expect(layoutAsHierarchyWithRows(layout, repeatingGroups)).toEqual([
        components.top1,
        components.top2,
        {
          ...components.group1,
          // This group is not repeating, so it should not output any rows:
          childComponents: [components.group1h, components.group1i],
        },
        {
          ...components.group2,
          rows: [
            [
              ...commonComponents(0),
              {
                ...components.group2n,
                id: `${components.group2n.id}-0`,
                baseComponentId: components.group2n.id,
                baseDataModelBindings: components.group2n.dataModelBindings,
                dataModelBindings: { group: 'MyModel.Group2[0].Nested' },
                rows: [nestedComponents(0, 0), nestedComponents(0, 1)],
              },
            ],
            [
              ...commonComponents(1),
              {
                ...components.group2n,
                id: `${components.group2n.id}-1`,
                baseComponentId: components.group2n.id,
                baseDataModelBindings: components.group2n.dataModelBindings,
                dataModelBindings: { group: 'MyModel.Group2[1].Nested' },
                rows: [nestedComponents(1, 0)],
              },
            ],
          ],
        },
        { ...components.group3, rows: [] },
      ]);
    });
  });

  describe('nodesInLayout', () => {
    it('should resolve a very simple layout', () => {
      const root = new LayoutRootNode();
      const top1 = new LayoutNode(components.top1, root);
      const top2 = new LayoutNode(components.top2, root);
      root._addChild(top1, root);
      root._addChild(top2, root);

      expect(nodesInLayout([components.top1, components.top2], {})).toEqual(
        root,
      );
    });

    it('should resolve a complex layout without groups', () => {
      const nodes = nodesInLayout(layout, repeatingGroups);
      expect(nodes.flat(false).map((n) => n.item.id)).toEqual([
        // Top-level nodes:
        components.top1.id,
        components.top2.id,
        components.group1h.id,
        components.group1i.id,

        // First row in group2
        `${components.group2h.id}-0`,
        `${components.group2i.id}-0`,
        `${components.group2nh.id}-0-0`,
        `${components.group2ni.id}-0-0`,
        `${components.group2nh.id}-0-1`,
        `${components.group2ni.id}-0-1`,

        // Second row in group2
        `${components.group2h.id}-1`,
        `${components.group2i.id}-1`,
        `${components.group2nh.id}-1-0`,
        `${components.group2ni.id}-1-0`,

        // Note: No group components
        // Note: No rows in group 3
      ]);
    });

    it('should resolve a complex layout with groups', () => {
      const nodes = nodesInLayout(layout, repeatingGroups);
      expect(nodes.flat(true).map((n) => n.item.id)).toEqual([
        // Top-level nodes:
        components.top1.id,
        components.top2.id,
        components.group1h.id,
        components.group1i.id,
        components.group1.id,

        // First row in group2
        `${components.group2h.id}-0`,
        `${components.group2i.id}-0`,
        `${components.group2nh.id}-0-0`,
        `${components.group2ni.id}-0-0`,
        `${components.group2nh.id}-0-1`,
        `${components.group2ni.id}-0-1`,
        `${components.group2n.id}-0`,

        // Second row in group2
        `${components.group2h.id}-1`,
        `${components.group2i.id}-1`,
        `${components.group2nh.id}-1-0`,
        `${components.group2ni.id}-1-0`,
        `${components.group2n.id}-1`,

        components.group2.id,
        components.group3.id,
      ]);
    });

    const manyRepeatingGroups: IRepeatingGroups = {
      [components.group2.id]: {
        index: 3,
        baseGroupId: components.group2.id,
      },
      [`${components.group2n.id}-0`]: {
        index: 3,
        baseGroupId: components.group2n.id,
      },
      [`${components.group2n.id}-1`]: {
        index: 3,
        baseGroupId: components.group2n.id,
      },
      [`${components.group2n.id}-2`]: {
        index: 3,
        baseGroupId: components.group2n.id,
      },
      [`${components.group2n.id}-3`]: {
        index: 3,
        baseGroupId: components.group2n.id,
      },
    };
    it('should enable traversal of layout', () => {
      const nodes = nodesInLayout(layout, manyRepeatingGroups);
      const flat = nodes.flat();
      const deepComponent = flat.find(
        (node) => node.item.id === `${components.group2nh.id}-2-2`,
      );
      expect(deepComponent.item.id).toEqual(`${components.group2nh.id}-2-2`);
      expect(deepComponent.parent?.item.id).toEqual(
        `${components.group2n.id}-2`,
      );
      expect(deepComponent.parent?.item.type).toEqual(`Group`);
      expect(deepComponent.closest((c) => c.type === 'Input').item.id).toEqual(
        `${components.group2ni.id}-2-2`,
      );

      const otherDeepComponent = flat.find(
        (node) => node.item.id === `${components.group2nh.id}-3-3`,
      );
      expect(
        otherDeepComponent.closest((c) => c.type === 'Input').item.id,
      ).toEqual(`${components.group2ni.id}-3-3`);
      expect(
        otherDeepComponent.closest((c) => c.type === 'Group').item.id,
      ).toEqual(`${components.group2n.id}-3`);
      expect(
        otherDeepComponent.closest(
          (c) => c.baseComponentId === components.group2i.id,
        ).item.id,
      ).toEqual(`${components.group2i.id}-3`);
      expect(
        otherDeepComponent.closest((c) => c.id === components.top1.id).item.id,
      ).toEqual(components.top1.id);

      const insideNonRepeatingGroup = flat.find(
        (node) => node.item.id === components.group1i.id,
      );
      expect(
        insideNonRepeatingGroup.closest((n) => n.id === components.group1h.id)
          .item.id,
      ).toEqual(components.group1h.id);

      const group2 = flat.find((node) => node.item.id === components.group2.id);
      expect(group2.children((n) => n.type === 'Input').item.id).toEqual(
        `${components.group2i.id}-0`,
      );
      expect(group2.children((n) => n.type === 'Input', 1).item.id).toEqual(
        `${components.group2i.id}-1`,
      );

      expect(
        otherDeepComponent.closest((c) => c.id === 'not-found'),
      ).toBeUndefined();
    });
  });
});
