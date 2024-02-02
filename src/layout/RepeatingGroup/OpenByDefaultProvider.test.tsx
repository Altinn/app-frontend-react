import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import { FD } from 'src/features/formData/FormDataWrite';
import { RepeatingGroupProvider, useRepeatingGroupSelector } from 'src/layout/RepeatingGroup/RepeatingGroupContext';
import { renderWithNode } from 'src/test/renderWithProviders';
import type { JsonPatch } from 'src/features/formData/jsonPatch/types';
import type { ILayout } from 'src/layout/layout';
import type {
  CompRepeatingGroupExternal,
  CompRepeatingGroupInternal,
} from 'src/layout/RepeatingGroup/config.generated';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

describe('openByDefault', () => {
  function RenderTest() {
    const state = useRepeatingGroupSelector((state) => ({
      editingIndex: state.editingIndex,
      currentlyAddingRow: state.currentlyAddingRow !== undefined,
      visibleRowIndexes: state.visibleRowIndexes.sort(),
      hiddenRowIndexes: [...state.hiddenRowIndexes.values()].sort(),
    }));

    const data = FD.useDebouncedPick('MyGroup');
    return (
      <div data-testid='state'>
        {JSON.stringify({
          ...state,
          data,
        })}
      </div>
    );
  }

  interface Row {
    id: string;
    name: string;
  }

  interface Props {
    existingRows?: Row[];
    edit?: Partial<CompRepeatingGroupExternal['edit']>;
    hiddenRow?: CompRepeatingGroupExternal['hiddenRow'];
  }

  function render({ existingRows, edit, hiddenRow }: Props) {
    const layout: ILayout = [
      {
        id: 'myGroup',
        type: 'RepeatingGroup',
        dataModelBindings: {
          group: 'MyGroup',
        },
        children: ['name'],
        edit: {
          ...edit,
        },
        hiddenRow,
      },
      {
        id: 'name',
        type: 'Input',
        dataModelBindings: {
          simpleBinding: 'MyGroup.name',
        },
      },
    ];

    return renderWithNode<true, BaseLayoutNode<CompRepeatingGroupInternal>>({
      renderer: ({ node }) => (
        <RepeatingGroupProvider node={node}>
          <RenderTest />
        </RepeatingGroupProvider>
      ),
      nodeId: 'myGroup',
      inInstance: true,
      queries: {
        fetchFormData: async () => ({
          MyGroup: existingRows ?? [],
        }),
        fetchLayouts: async () => ({
          FormLayout: {
            data: { layout },
          },
        }),
      },
    });
  }

  function getState() {
    const json = screen.getByTestId('state').textContent;
    return JSON.parse(json!);
  }

  interface WaitForStateProps {
    state: any;
    mutations?: Awaited<ReturnType<typeof render>>['mutations'];
    expectedPatch?: JsonPatch[];
    newModelAfterSave?: any;
  }

  async function waitUntil({ state, mutations, expectedPatch, newModelAfterSave }: WaitForStateProps) {
    await waitFor(() => expect(getState()).toEqual(state));

    if (newModelAfterSave && mutations) {
      expect(mutations.doPatchFormData.mock).toHaveBeenCalledTimes(1);
      expect(mutations.doPatchFormData.mock).toHaveBeenCalledWith(
        expect.anything(),
        expectedPatch ? expect.objectContaining({ patch: expectedPatch }) : expect.anything(),
      );
      mutations.doPatchFormData.resolve({
        validationIssues: {},
        newDataModel: newModelAfterSave,
      });
      (mutations.doPatchFormData.mock as jest.Mock).mockClear();
    }

    // Because this typically happens in a loop, we need to wait a little more and check again to make sure
    // the state doesn't change again.
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(getState()).toEqual(state);
  }

  beforeAll(() => {
    jest.spyOn(window, 'logWarn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should not add a new row by default when off', async () => {
    await render({
      existingRows: [],
      edit: { openByDefault: false },
    });

    await waitUntil({
      state: {
        editingIndex: undefined,
        currentlyAddingRow: false,
        visibleRowIndexes: [],
        hiddenRowIndexes: [],
        data: [],
      },
    });
  });

  it('should add one new row by default when on', async () => {
    await render({
      existingRows: [],
      edit: { openByDefault: true },
    });

    await waitUntil({
      state: {
        editingIndex: 0,
        currentlyAddingRow: false,
        visibleRowIndexes: [0],
        hiddenRowIndexes: [],
        data: [{}],
      },
    });
  });

  it('should not add a new row if one already exists', async () => {
    await render({
      existingRows: [{ id: '1', name: 'test' }],
      edit: { openByDefault: true },
    });

    await waitUntil({
      state: {
        editingIndex: undefined,
        currentlyAddingRow: false,
        visibleRowIndexes: [0],
        hiddenRowIndexes: [],
        data: [{ id: '1', name: 'test' }],
      },
    });
  });

  it.each(['first', 'last'] as const)(
    'should open the row if one exist and openByDefault is %s',
    async (openByDefault) => {
      await render({
        existingRows: [{ id: '1', name: 'test' }],
        edit: { openByDefault },
      });

      await waitUntil({
        state: {
          editingIndex: 0,
          currentlyAddingRow: false,
          visibleRowIndexes: [0],
          hiddenRowIndexes: [],
          data: [{ id: '1', name: 'test' }],
        },
      });
    },
  );

  it.each(['first', 'last'] as const)(
    'should add the first row if none exists and openByDefault is %s',
    async (openByDefault) => {
      await render({
        existingRows: [],
        edit: { openByDefault },
      });

      await waitUntil({
        state: {
          editingIndex: 0,
          currentlyAddingRow: false,
          visibleRowIndexes: [0],
          hiddenRowIndexes: [],
          data: [{}],
        },
      });
    },
  );

  it.each(['first', 'last'] as const)(
    'should not add a new row if one already exists and openByDefault is %s',
    async (openByDefault) => {
      await render({
        existingRows: [{ id: '1', name: 'test' }],
        edit: { openByDefault },
      });

      await waitUntil({
        state: {
          editingIndex: 0,
          currentlyAddingRow: false,
          visibleRowIndexes: [0],
          hiddenRowIndexes: [],
          data: [{ id: '1', name: 'test' }],
        },
      });
    },
  );

  it.each(['first', 'last'] as const)(
    'should open the correct row if multiple exist and openByDefault is %s',
    async (openByDefault) => {
      await render({
        existingRows: [
          { id: '1', name: 'test' },
          { id: '2', name: 'test' },
        ],
        edit: { openByDefault },
      });

      await waitUntil({
        state: {
          editingIndex: openByDefault === 'last' ? 1 : 0,
          currentlyAddingRow: false,
          visibleRowIndexes: [0, 1],
          hiddenRowIndexes: [],
          data: [
            { id: '1', name: 'test' },
            { id: '2', name: 'test' },
          ],
        },
      });
    },
  );

  it.each(['first', 'last', true] as const)(
    'should add a new row if one already exists but is hidden, and openByDefault is %s',
    async (openByDefault) => {
      await render({
        existingRows: [{ id: '1', name: 'test' }],
        edit: { openByDefault },
        hiddenRow: ['equals', ['dataModel', 'MyGroup.name'], 'test'],
      });

      await waitUntil({
        state: {
          editingIndex: 1,
          currentlyAddingRow: false,
          visibleRowIndexes: [1],
          hiddenRowIndexes: [0],
          data: [{ id: '1', name: 'test' }, {}],
        },
      });
    },
  );

  it.each(['first', 'last', true] as const)(
    'should only attempt to add one new row if new rows keep getting hidden, and openByDefault is %s',
    async (openByDefault) => {
      await render({
        existingRows: [{ id: '1', name: 'test' }],
        edit: { openByDefault },
        hiddenRow: true,
      });

      // This should fail, because the new row we add is hidden. It's too late when we've already added it, so we
      // can't do anything about it, but a warning is logged.
      await waitUntil({
        state: {
          editingIndex: undefined,
          currentlyAddingRow: false,
          visibleRowIndexes: [],
          hiddenRowIndexes: [0, 1],
          data: [{ id: '1', name: 'test' }, {}],
        },
      });

      expect(window.logWarn).toHaveBeenCalledTimes(1);
    },
  );

  it('should not add rows if not allowed to', async () => {
    await render({
      existingRows: [],
      edit: { openByDefault: true, addButton: false },
    });

    await waitUntil({
      state: {
        editingIndex: undefined,
        currentlyAddingRow: false,
        visibleRowIndexes: [],
        hiddenRowIndexes: [],
        data: [],
      },
    });
  });
});
