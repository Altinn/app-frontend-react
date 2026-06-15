import React from 'react';

import { jest } from '@jest/globals';
import { screen, within } from '@testing-library/react';

import { defaultDataTypeMock } from 'src/__mocks__/getLayoutSetsMock';
import * as useDeviceWidths from 'src/hooks/useDeviceWidths';
import { RenderGrid } from 'src/layout/Grid/GridComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';
import type { GridRow } from 'src/layout/common.generated';
import type { CompExternalExact } from 'src/layout/layout';

describe('GridComponent', () => {
  const render = async (hiddenValue: unknown) =>
    await renderGenericComponentTest({
      type: 'Grid',
      renderer: (props) => <RenderGrid {...props} />,
      component: {
        rows: [
          {
            header: true,
            readOnly: false,
            cells: [
              { text: 'accordion.title' },
              {
                text: 'FormLayout',
                columnOptions: { hidden: hiddenValue },
              },
            ],
          },
          {
            header: false,
            readOnly: false,
            cells: [{ text: 'accordion.title' }, { text: 'FormLayout' }],
          },
        ],
      } as CompExternalExact<'Grid'>,
    });

  it('hides a column when header cell hidden evaluates to true', async () => {
    await render(true);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(1);

    const titleOccurrences = screen.getAllByText('This is a title');
    expect(titleOccurrences).toHaveLength(2);
    expect(screen.queryByText('This is a page title')).not.toBeInTheDocument();

    const bodyCells = screen.getAllByRole('cell');
    expect(bodyCells).toHaveLength(1);
    expect(screen.getAllByText('This is a title')[0]).toBeInTheDocument();
  });

  it('does not hide a column when hidden evaluates to false', async () => {
    await render(false);

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);

    const titleOccurrences = screen.getAllByText('This is a title');
    expect(titleOccurrences.length).toBeGreaterThanOrEqual(1);
    const pageTitleOccurrences = screen.getAllByText('This is a page title');
    expect(pageTitleOccurrences.length).toBeGreaterThanOrEqual(1);
  });

  it('applies colSpan from cellStyle in text cells', async () => {
    await renderGenericComponentTest({
      type: 'Grid',
      renderer: (props) => <RenderGrid {...props} />,
      component: {
        rows: [
          {
            header: true,
            readOnly: false,
            cells: [
              {
                text: 'accordion.title',
                cellStyle: { colSpan: 2 },
              },
              { text: 'FormLayout' },
            ],
          },
        ],
      } as CompExternalExact<'Grid'>,
    });

    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThanOrEqual(1);
    const firstHeaderCell = headers[0];
    expect(firstHeaderCell).toHaveAttribute('colspan', '2');
  });

  it('applies colSpan for component cells', async () => {
    await renderGenericComponentTest({
      type: 'Grid',
      renderer: (props) => <RenderGrid {...props} />,
      component: {
        rows: [
          {
            header: false,
            readOnly: false,
            cells: [
              {
                component: 'grid-text',
                cellStyle: {
                  colSpan: 3,
                },
              },
            ],
          },
        ],
      } as CompExternalExact<'Grid'>,
      queries: {
        fetchLayouts: async () => ({
          FormLayout: {
            data: {
              layout: [
                {
                  id: 'my-test-component-id',
                  type: 'Grid',
                  rows: [
                    {
                      header: false,
                      readOnly: false,
                      cells: [
                        {
                          component: 'grid-text',
                          cellStyle: {
                            colSpan: 3,
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'grid-text',
                  type: 'Text',
                  value: '',
                  textResourceBindings: {
                    title: 'accordion.title',
                  },
                },
              ],
            },
          },
        }),
      },
    });

    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThanOrEqual(1);
    const firstCell = cells[0];
    expect(firstCell).toHaveAttribute('colspan', '3');
  });

  describe('mobile layout', () => {
    const renderMobile = async (rows: GridRow[]) => {
      jest.spyOn(useDeviceWidths, 'useIsMobile').mockReturnValue(true);
      return await renderGenericComponentTest({
        type: 'Grid',
        renderer: (props) => <RenderGrid {...props} />,
        component: { rows } as CompExternalExact<'Grid'>,
        queries: {
          fetchLayouts: async () => ({
            FormLayout: {
              data: {
                layout: [
                  { id: 'my-test-component-id', type: 'Grid', rows },
                  {
                    id: 'answer-1',
                    type: 'TextArea',
                    textResourceBindings: { title: 'Svar' },
                    dataModelBindings: { simpleBinding: { dataType: defaultDataTypeMock, field: 'answer1' } },
                  },
                  {
                    id: 'answer-2',
                    type: 'TextArea',
                    textResourceBindings: { title: 'Svar' },
                    dataModelBindings: { simpleBinding: { dataType: defaultDataTypeMock, field: 'answer2' } },
                  },
                ],
              },
            },
          }),
        },
      });
    };

    const kravSvarRows: GridRow[] = [
      {
        header: true,
        cells: [{ text: 'Krav' }, { text: 'Svar' }],
      },
      {
        cells: [{ text: 'Setter brukeren i sentrum' }, { component: 'answer-1' }],
      },
      {
        cells: [{ text: 'Tilrettelegger for gjenbruk' }, { component: 'answer-2' }],
      },
    ];

    it('does not render the desktop table on mobile', async () => {
      await renderMobile(kravSvarRows);
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
    });

    it('keeps each row category text visible and associates it with the field', async () => {
      await renderMobile(kravSvarRows);

      // The category text from each body row must remain visible
      expect(screen.getByText('Setter brukeren i sentrum')).toBeInTheDocument();
      expect(screen.getByText('Tilrettelegger for gjenbruk')).toBeInTheDocument();

      // Each field is wrapped in a group labelled by its row's category text
      const firstGroup = screen.getByRole('group', { name: 'Setter brukeren i sentrum' });
      expect(within(firstGroup).getByRole('textbox')).toBeInTheDocument();

      const secondGroup = screen.getByRole('group', { name: 'Tilrettelegger for gjenbruk' });
      expect(within(secondGroup).getByRole('textbox')).toBeInTheDocument();
    });

    it('does not render the redundant column-title header row as repeated context', async () => {
      await renderMobile(kravSvarRows);
      // 'Krav' is only present in the header row, which should not be rendered on mobile
      expect(screen.queryByText('Krav')).not.toBeInTheDocument();
    });

    it('hides rows whose only component is hidden', async () => {
      const rows: GridRow[] = [
        {
          cells: [{ text: 'Visible requirement' }, { component: 'answer-1' }],
        },
        {
          cells: [{ text: 'Hidden requirement' }, { component: 'answer-2' }],
        },
      ];

      jest.spyOn(useDeviceWidths, 'useIsMobile').mockReturnValue(true);
      await renderGenericComponentTest({
        type: 'Grid',
        renderer: (props) => <RenderGrid {...props} />,
        component: { rows } as CompExternalExact<'Grid'>,
        queries: {
          fetchLayouts: async () => ({
            FormLayout: {
              data: {
                layout: [
                  { id: 'my-test-component-id', type: 'Grid', rows },
                  {
                    id: 'answer-1',
                    type: 'TextArea',
                    textResourceBindings: { title: 'Svar' },
                    dataModelBindings: { simpleBinding: { dataType: defaultDataTypeMock, field: 'answer1' } },
                  },
                  {
                    id: 'answer-2',
                    type: 'TextArea',
                    hidden: true,
                    textResourceBindings: { title: 'Svar' },
                    dataModelBindings: { simpleBinding: { dataType: defaultDataTypeMock, field: 'answer2' } },
                  },
                ],
              },
            },
          }),
        },
      });

      expect(screen.getByText('Visible requirement')).toBeInTheDocument();
      expect(screen.queryByText('Hidden requirement')).not.toBeInTheDocument();
    });
  });
});
