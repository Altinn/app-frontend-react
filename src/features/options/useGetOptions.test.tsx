import React from 'react';

import { screen } from '@testing-library/react';
import type { AxiosResponse } from 'axios';

import { useGetOptions } from 'src/features/options/useGetOptions';
import { renderWithNode } from 'src/test/renderWithProviders';
import type { IOption, ISelectionComponentExternal } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * This is defined because it is possible for the options to be defined as other types than strings, but
 * useGetOptions will always return options as strings. So the internal type is correct, but this represents
 * potential external types.
 */
type IRawOption = Omit<IOption, 'value'> & {
  value: string | number | boolean;
};

interface RenderProps {
  type: 'single' | 'multi';
  via: 'layout' | 'api' | 'repeatingGroups';
  options: IRawOption[];
}

function TestOptions({ node }: { node: LayoutNode<'Dropdown' | 'MultipleSelect'> }) {
  const { options } = useGetOptions({
    ...node.item,
    node,
    valueType: node.item.type === 'Dropdown' ? 'single' : 'multi',
  });
  return <div data-testid='options'>{JSON.stringify(options)}</div>;
}

async function render(props: RenderProps) {
  const layoutConfig: ISelectionComponentExternal = {
    options: props.via === 'layout' ? (props.options as unknown as IOption[]) : undefined,
    optionsId: props.via === 'api' ? 'myOptions' : undefined,
    source:
      props.via === 'repeatingGroups'
        ? {
            group: 'Group',
            value: 'Group.value',
            label: 'myLabel',
          }
        : undefined,
  };

  return renderWithNode({
    renderer: ({ node }) => <TestOptions node={node as LayoutNode<'Dropdown' | 'MultipleSelect'>} />,
    nodeId: 'myComponent',
    inInstance: true,
    queries: {
      fetchLayouts: async () => ({
        FormLayout: {
          data: {
            layout: [
              {
                type: props.type === 'single' ? 'Dropdown' : 'MultipleSelect',
                id: 'myComponent',
                dataModelBindings: {
                  simpleBinding: 'result',
                },
                textResourceBindings: {
                  title: 'mockTitle',
                },
                ...layoutConfig,
              },
            ],
          },
        },
      }),
      fetchFormData: async () => ({
        Group: props.options,
        result: '',
      }),
      fetchOptions: async () =>
        ({
          data: props.options,
          headers: {},
        }) as AxiosResponse<IOption[], any>,
      fetchTextResources: async () => ({
        resources: [
          {
            id: 'myLabel',
            value: '{0}',
            variables: [
              {
                dataSource: 'dataModel.default',
                key: 'Group[{0}].label',
              },
            ],
          },
        ],
        language: 'nb',
      }),
    },
  });
}

describe('useGetOptions', () => {
  const permutations: Omit<RenderProps, 'options'>[] = [
    { type: 'single', via: 'layout' },
    { type: 'single', via: 'api' },
    { type: 'single', via: 'repeatingGroups' },
    { type: 'multi', via: 'layout' },
    { type: 'multi', via: 'api' },
    { type: 'multi', via: 'repeatingGroups' },
  ];

  it.each(permutations)('options should be cast to strings for $type + $via', async (props) => {
    await render({
      ...props,
      options: [
        { label: 'first', value: 'hello' },
        { label: 'second', value: false },
        { label: 'third', value: 2 },
        { label: 'fourth', value: 3.14 },
      ],
    });

    const textContent = screen.getByTestId('options').textContent;
    const asArray = JSON.parse(textContent as string) as IOption[];

    expect(asArray).toEqual([
      { label: 'first', value: 'hello' },
      { label: 'second', value: 'false' },
      { label: 'third', value: '2' },
      { label: 'fourth', value: '3.14' },
    ]);
  });
});
