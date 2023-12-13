import React from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { getApplicationMetadataMock } from 'src/__mocks__/getApplicationMetadataMock';
import { ApplicationMetadataProvider } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { LayoutSetsProvider } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { FormDataReadWriteProvider } from 'src/features/formData/FormDataReadWrite';
import { FD } from 'src/features/formData/FormDataWrite';
import { FormDataWriteGatekeepersProvider } from 'src/features/formData/FormDataWriteGatekeepers';
import { makeDefaultFormDataMethodMocks, renderWithMinimalProviders } from 'src/test/renderWithProviders';

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

async function genericRender(props: Partial<Parameters<typeof renderWithMinimalProviders>[0]> = {}) {
  const formDataMethods = makeDefaultFormDataMethodMocks();
  return {
    formDataMethods,
    ...(await renderWithMinimalProviders({
      ...props,
      renderer: () => (
        <ApplicationMetadataProvider>
          <LayoutSetsProvider>
            <FormDataWriteGatekeepersProvider value={formDataMethods}>
              <FormDataReadWriteProvider>{props.renderer && props.renderer()}</FormDataReadWriteProvider>
            </FormDataWriteGatekeepersProvider>
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
        fetchFormData: async () => ({}),
        ...props.queries,
      },
    })),
  };
}

describe('FormData rendering', () => {
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

    const utils = await genericRender({
      renderer: () => (
        <>
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
        </>
      ),
      queries: {
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

    return { ...utils, renderCounts };
  }

  it('Form state changes should not affect other components', async () => {
    const { renderCounts, formDataMethods } = await render();
    expect(screen.getAllByTestId(/^reader-/).length).toBe(3);
    expect(screen.getAllByTestId(/^writer-/).length).toBe(3);

    const initialRenders = { ...renderCounts };
    expect(initialRenders).toEqual({
      ReaderObj1Prop1: 1,
      ReaderObj1Prop2: 1,
      ReaderObj2Prop1: 1,

      WriterObj1Prop1: 1,
      WriterObj1Prop2: 1,
      WriterObj2Prop1: 1,
    });

    // Change a value
    await userEvent.type(screen.getByTestId('writer-obj1.prop1'), 'a');
    expect(formDataMethods.setLeafValue).toHaveBeenCalledTimes(1);
    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({
      path: 'obj1.prop1',
      newValue: 'value1a',
    });

    expect(renderCounts).toEqual({
      ...initialRenders,
      ReaderObj1Prop1: 2,
      WriterObj1Prop1: 2,
    });
  });
});

describe('Form data locking', () => {
  function Writer({ path }: { path: keyof DataModelFlat }) {
    const value = FD.usePickFreshString(path);
    const save = FD.useSetForBinding(path);

    return (
      <input
        data-testid={path}
        value={value}
        onChange={(ev) => save(ev.target.value)}
      />
    );
  }

  function LockActionButton() {
    const { lock, unlock, isLocked } = FD.useLocking('myLockId');

    return (
      <>
        <div data-testid='isLocked'>{isLocked ? 'true' : 'false'}</div>
        <button
          onClick={async () => {
            if (isLocked) {
              // Unlock with some pretend updated form data
              unlock({ 'obj1.prop1': 'new value' });
            } else {
              await lock();
            }
          }}
        >
          Lock form data
        </button>
      </>
    );
  }

  function HasUnsavedChanges() {
    const hasUnsavedChanges = FD.useHasUnsavedChanges();
    return <div data-testid='hasUnsavedChanges'>{hasUnsavedChanges ? 'true' : 'false'}</div>;
  }

  async function render(props: Partial<Parameters<typeof renderWithMinimalProviders>[0]> = {}) {
    return genericRender({
      renderer: () => (
        <>
          <Writer path='obj1.prop1' />
          <Writer path='obj1.prop2' />
          <Writer path='obj2.prop1' />
          <LockActionButton />
          <HasUnsavedChanges />
        </>
      ),
      queries: {
        fetchFormData: async () => ({
          obj1: {
            prop1: 'value1',
          },
        }),
        ...props.queries,
      },
      ...props,
    });
  }

  function destructPutFormDataMock(mock: any, call = 0) {
    const multiPart: FormData = mock.mock.calls[call][1];
    const dataModel = JSON.parse(multiPart.get('dataModel') as string);
    const previousValues = JSON.parse(multiPart.get('previousValues') as string);
    return { dataModel, previousValues };
  }

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('Locking should allow changes to the form data, but some values may be overwritten', async () => {
    const user = userEvent.setup({ delay: null });
    const { mutations } = await render();
    expect(screen.getAllByTestId(/^obj\d+.prop\d+$/).length).toBe(3);
    expect(screen.getByTestId('obj1.prop1')).toHaveValue('value1');

    // Lock the form
    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByTestId('isLocked')).toHaveTextContent('true'));

    // Change a value (this will be overwritten later)
    await user.type(screen.getByTestId('obj1.prop1'), 'a');
    expect(screen.getByTestId('obj1.prop1')).toHaveValue('value1a');

    // Change another value (this will be preserved)
    await user.type(screen.getByTestId('obj1.prop2'), 'b');
    expect(screen.getByTestId('obj1.prop2')).toHaveValue('b');

    // Locking prevents saving
    expect(mutations.doPutFormData.mock).toHaveBeenCalledTimes(0);
    act(() => jest.advanceTimersByTime(5000));
    expect(mutations.doPutFormData.mock).toHaveBeenCalledTimes(0);

    // Unlock the form
    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByTestId('isLocked')).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId('obj1.prop1')).toHaveValue('new value'));
    expect(screen.getByTestId('obj1.prop2')).toHaveValue('b');
    expect(screen.getByTestId('obj2.prop1')).toHaveValue('');

    // Saving is now allowed, so the form data we saved earlier is sent. The one value
    // we changed that was overwritten is now lost.
    act(() => jest.advanceTimersByTime(5000));
    await waitFor(() => expect(mutations.doPutFormData.mock).toHaveBeenCalledTimes(1));

    const { dataModel, previousValues } = destructPutFormDataMock(mutations.doPutFormData.mock);
    expect(dataModel).toEqual({
      obj1: {
        prop1: 'new value',
        prop2: 'b',
      },
    });
    expect(previousValues).toEqual({
      // obj1.prop1 was changed, but the value was overwritten by the server. In this case it won't be in previousValues
      // because to the server it looks like the value was never changed.
      'obj1.prop2': null, // This was not set before, so the previous value is null
    });
  });

  it('Locking will not trigger a save if no values have changed', async () => {
    const user = userEvent.setup({ delay: null });
    const { mutations } = await render();
    expect(screen.getAllByTestId(/^obj\d+.prop\d+$/).length).toBe(3);

    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByTestId('isLocked')).toHaveTextContent('true'));

    // Change a value (this will be overwritten later)
    await user.type(screen.getByTestId('obj1.prop1'), 'a');
    expect(screen.getByTestId('obj1.prop1')).toHaveValue('value1a');

    expect(mutations.doPutFormData.mock).toHaveBeenCalledTimes(0);
    act(() => jest.advanceTimersByTime(5000));
    expect(mutations.doPutFormData.mock).toHaveBeenCalledTimes(0);

    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByTestId('isLocked')).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId('obj1.prop1')).toHaveValue('new value'));
    expect(screen.getByTestId('obj1.prop2')).toHaveValue('');
    expect(screen.getByTestId('obj2.prop1')).toHaveValue('');

    act(() => jest.advanceTimersByTime(5000));
    await waitFor(() => expect(screen.getByTestId('hasUnsavedChanges')).toHaveTextContent('false'));
    expect(mutations.doPutFormData.mock).toHaveBeenCalledTimes(0);
  });

  it('Unsaved changes should be saved before locking', async () => {
    const user = userEvent.setup({ delay: null });
    const { mutations } = await render();

    // Change a value
    await user.type(screen.getByTestId('obj2.prop1'), 'a');
    expect(screen.getByTestId('obj2.prop1')).toHaveValue('a');
    expect(screen.getByTestId('hasUnsavedChanges')).toHaveTextContent('true');

    expect(mutations.doPutFormData.mock).toHaveBeenCalledTimes(0);
    await user.click(screen.getByRole('button'));
    expect(mutations.doPutFormData.mock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('isLocked')).toHaveTextContent('false'); // The save has not finished yet

    const { dataModel, previousValues } = destructPutFormDataMock(mutations.doPutFormData.mock);
    expect(dataModel).toEqual({
      obj1: {
        prop1: 'value1',
      },
      obj2: {
        prop1: 'a',
      },
    });
    expect(previousValues).toEqual({
      'obj2.prop1': null, // This was not set before, so the previous value is null
    });

    mutations.doPutFormData.resolve();
    await waitFor(() => expect(screen.getByTestId('isLocked')).toHaveTextContent('true'));
  });
});
