import React from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { getApplicationMetadataMock } from 'src/__mocks__/getApplicationMetadataMock';
import { ApplicationMetadataProvider } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { LayoutSetsProvider } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { FormDataReadWriteProvider } from 'src/features/formData/FormDataReadWrite';
import { FD } from 'src/features/formData/FormDataWrite';
import { FormDataWriteDispatchGatekeeperProvider } from 'src/features/formData/FormDataWriteDispatch';
import { renderWithMinimalProviders } from 'src/test/renderWithProviders';
import type { FDAction } from 'src/features/formData/FormDataWriteStateMachine';

interface DataModelFlat {
  'obj1.prop1': string;
  'obj1.prop2': string;
  'obj2.prop1': string;
}

interface RenderCounts {
  ReaderObj1Prop1: number;
  ReaderObj1Prop2: number;
  ReaderObj2Prop1: number;

  WriterObj1Prop1: number;
  WriterObj1Prop2: number;
  WriterObj2Prop1: number;
}

interface Props {
  path: keyof DataModelFlat;
  countKey: keyof RenderCounts;
  renderCounts: RenderCounts;
}

describe('FormData', () => {
  function DataModelReader({ path, countKey, renderCounts }: Props) {
    renderCounts[countKey]++;
    const value = FD.usePickFreshString(path);

    return <div data-testid={`reader-${path}`}>{value}</div>;
  }

  function DataModelWriter({ path, countKey, renderCounts }: Props) {
    renderCounts[countKey]++;
    const value = FD.usePickFreshString(path);
    const save = FD.useSetForBinding(path);

    return (
      <input
        data-testid={`writer-${path}`}
        value={value}
        onChange={(ev) => save(ev.target.value)}
      />
    );
  }

  async function render(props: Partial<Parameters<typeof renderWithMinimalProviders>[0]> = {}) {
    const renderCounts: RenderCounts = {
      ReaderObj1Prop1: 0,
      ReaderObj1Prop2: 0,
      ReaderObj2Prop1: 0,

      WriterObj1Prop1: 0,
      WriterObj1Prop2: 0,
      WriterObj2Prop1: 0,
    };

    const dispatch = jest.fn().mockImplementation(() => true);
    const utils = await renderWithMinimalProviders({
      renderer: () => (
        <ApplicationMetadataProvider>
          <LayoutSetsProvider>
            <FormDataWriteDispatchGatekeeperProvider value={dispatch}>
              <FormDataReadWriteProvider>
                <DataModelReader
                  renderCounts={renderCounts}
                  path='obj1.prop1'
                  countKey='ReaderObj1Prop1'
                />
                <DataModelReader
                  renderCounts={renderCounts}
                  path='obj1.prop2'
                  countKey='ReaderObj1Prop2'
                />
                <DataModelReader
                  renderCounts={renderCounts}
                  path='obj2.prop1'
                  countKey='ReaderObj2Prop1'
                />
                <DataModelWriter
                  renderCounts={renderCounts}
                  path='obj1.prop1'
                  countKey='WriterObj1Prop1'
                />
                <DataModelWriter
                  renderCounts={renderCounts}
                  path='obj1.prop2'
                  countKey='WriterObj1Prop2'
                />
                <DataModelWriter
                  renderCounts={renderCounts}
                  path='obj2.prop1'
                  countKey='WriterObj2Prop1'
                />
              </FormDataReadWriteProvider>
            </FormDataWriteDispatchGatekeeperProvider>
          </LayoutSetsProvider>
        </ApplicationMetadataProvider>
      ),
      queries: {
        fetchApplicationMetadata: async () =>
          getApplicationMetadataMock({
            onEntry: {
              show: 'stateless',
            },
          }),
        fetchFormData: async () => ({
          obj1: {
            prop1: 'value1',
            prop2: 'value2',
          },
          obj2: {
            prop1: 'value3',
          },
        }),
        ...props.queries,
      },
      ...props,
    });

    return { ...utils, dispatch, renderCounts };
  }

  it('Form state changes should not affect other', async () => {
    const { renderCounts, dispatch } = await render();
    expect(screen.getAllByTestId(/^reader-/).length).toBe(3);
    expect(screen.getAllByTestId(/^writer-/).length).toBe(3);

    const initialRenders = { ...renderCounts };

    // Change a value
    await userEvent.type(screen.getByTestId('writer-obj1.prop1'), 'a');
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setLeafValue',
      path: 'obj1.prop1',
      newValue: 'value1a',
    } as FDAction);

    expect(renderCounts).toEqual({
      ...initialRenders,
      WriterObj1Prop1: initialRenders.WriterObj1Prop1 + 1,
      ReaderObj1Prop1: initialRenders.ReaderObj1Prop1 + 1,
    });
  });
});
