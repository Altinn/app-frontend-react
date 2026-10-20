import React from 'react';

import { jest } from '@jest/globals';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { getInstanceDataMock } from 'src/__mocks__/getInstanceDataMock';
import { getLayoutSetsMock } from 'src/__mocks__/getLayoutSetsMock';
import { getProcessDataMock } from 'src/__mocks__/getProcessDataMock';
import { ProcessWrapper } from 'src/components/wrappers/ProcessWrapper';
import { TaskOverrides } from 'src/core/contexts/TaskOverrides';
import { FormProvider } from 'src/features/form/FormContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';
import { PdfWrapper } from 'src/features/pdf/PdfWrapper';
import { fetchInstanceData, fetchProcessState } from 'src/queries/queries';
import { InstanceRouter, renderWithoutInstanceAndLayout } from 'src/test/renderWithProviders';
import type { AppQueries } from 'src/queries/types';

const firstId = '2f5c6a01-30e1-4d72-a19e-162a90517d14';
const secondId = '85b7f187-80f8-40aa-800e-39ffbc47c751';
const taskId = 'SubformPdf';

function setup() {
  jest.mocked(fetchProcessState).mockImplementation(async () =>
    getProcessDataMock((p) => {
      p.processTasks = [
        p.currentTask!,
        { elementId: taskId, elementType: 'ServiceTask', altinnTaskType: 'subformPdf' },
        { elementId: 'PdfAuto', elementType: 'ServiceTask', altinnTaskType: 'pdf' },
        { elementId: 'PdfLayout', elementType: 'ServiceTask', altinnTaskType: 'pdf' },
      ];
    }),
  );
  jest.mocked(fetchInstanceData).mockImplementation(async () =>
    getInstanceDataMock((instance) => {
      const template = instance.data[0];
      instance.data.push(
        { ...template, id: firstId, dataType: 'subform-data' },
        { ...template, id: secondId, dataType: 'subform-data' },
      );
    }),
  );
}

function queries(): Partial<AppQueries> {
  return {
    fetchLayoutSets: async () => ({
      sets: [
        ...getLayoutSetsMock().sets,
        { id: 'subform-pdf', dataType: 'subform-data', tasks: [taskId] },
        { id: 'pdf-layout', dataType: 'test-data-model', tasks: ['PdfLayout'] },
      ],
    }),
    fetchLayouts: async (layoutSetId) => ({
      Pdf: {
        data: {
          layout: [
            {
              id: 'value',
              type: 'Input',
              dataModelBindings: {
                simpleBinding: {
                  dataType: layoutSetId === 'subform-pdf' ? 'subform-data' : 'test-data-model',
                  field: 'value',
                },
              },
              textResourceBindings: { title: 'Value' },
            },
          ],
        },
      },
    }),
    fetchLayoutSettings: async () => ({ pages: { order: ['Pdf'], pdfLayoutName: 'Pdf' } }),
    fetchDataModelSchema: async () => ({ type: 'object', properties: { value: { type: 'string' } } }),
    fetchFormData: async (url) => ({ value: url.includes(secondId) ? 'Second subform' : 'First subform' }),
  };
}

async function renderPreview({
  selectedId = secondId,
  pdf = true,
  target = taskId,
  extraQuery = '',
  renderChildren,
  queryOverrides,
}: {
  selectedId?: string;
  pdf?: boolean;
  target?: string;
  extraQuery?: string;
  renderChildren?: React.ReactNode;
  queryOverrides?: Partial<AppQueries>;
} = {}) {
  setup();
  const page = target === taskId ? `subform/subform-component/${selectedId}` : '';
  const query = pdf ? `pdf=1${extraQuery}` : '';
  const suffix = query ? `?${query}` : '';
  window.location.hash = `#/instance/512345/75154373-aed4-41f7-95b4-e5b5115c2edc/${target}/${page}${suffix}`;
  return renderWithoutInstanceAndLayout({
    renderer: () => (
      <InstanceProvider>
        {renderChildren ?? (
          <ProcessWrapper>
            <span>Normal form</span>
          </ProcessWrapper>
        )}
      </InstanceProvider>
    ),
    router: ({ children }) => (
      <InstanceRouter
        taskId={target}
        initialPage={page}
        alwaysRouteToChildren={true}
        query={query}
      >
        {children}
      </InstanceRouter>
    ),
    queries: { ...queries(), ...queryOverrides },
  });
}

describe('PDF service task previews in frontend v4', () => {
  it.each([
    [firstId, 'First subform', 'Second subform'],
    [secondId, 'Second subform', 'First subform'],
  ])('renders the requested subform %s while an earlier task is current', async (selectedId, expected, absent) => {
    const result = await renderPreview({ selectedId });
    await waitFor(() => expect(result.container.querySelector('#readyForPrint')).not.toBeNull());
    expect(screen.getByDisplayValue(expected)).toBeInTheDocument();
    expect(screen.queryByDisplayValue(absent)).not.toBeInTheDocument();
    expect(screen.queryByText('Normal form')).not.toBeInTheDocument();
    expect(result.queries.fetchLayouts).toHaveBeenCalledWith('subform-pdf');
    expect(result.queries.fetchFormData).toHaveBeenCalledWith(expect.stringContaining(selectedId), {});
    expect(result.queries.fetchPdfFormat).not.toHaveBeenCalled();
    result.unmount();
    expect(result.mutations.doPatchFormData.mock).not.toHaveBeenCalled();
    expect(result.mutations.doPatchMultipleFormData.mock).not.toHaveBeenCalled();
  });

  it('keeps normal navigation to a future task blocked', async () => {
    await renderPreview({ pdf: false });
    await waitFor(() => expect(screen.queryByText('Normal form')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Gå til riktig prosessteg' })).toBeInTheDocument();
  });

  it('renders auto-PDF tasks without a layout while another task is current', async () => {
    const result = await renderPreview({
      target: 'PdfAuto',
      extraQuery: '&task=Task_1',
      queryOverrides: { fetchLayoutSettings: async () => ({ pages: { order: ['Pdf'] } }) },
    });
    await waitFor(() => expect(result.container.querySelector('#readyForPrint')).not.toBeNull());
    expect(screen.getByText('First subform')).toBeInTheDocument();
    expect(result.queries.fetchLayouts).toHaveBeenCalledWith('some-data-task');
  });

  it('renders a future PDF task with its own layout', async () => {
    const result = await renderPreview({ target: 'PdfLayout' });
    await waitFor(() => expect(result.container.querySelector('#readyForPrint')).not.toBeNull());
    expect(screen.getByDisplayValue('First subform')).toBeInTheDocument();
    expect(result.queries.fetchLayouts).toHaveBeenCalledWith('pdf-layout');
    expect(result.queries.fetchPdfFormat).not.toHaveBeenCalled();
    result.unmount();
    expect(result.mutations.doPatchMultipleFormData.mock).not.toHaveBeenCalled();
  });

  it('keeps the legacy formatter for current-task PDF previews', async () => {
    const result = await renderPreview({
      target: 'Task_1',
      renderChildren: (
        <FormProvider>
          <PdfWrapper />
        </FormProvider>
      ),
      queryOverrides: { fetchLayoutSettings: async () => ({ pages: { order: ['Pdf'] } }) },
    });
    await waitFor(() => expect(result.container.querySelector('#readyForPrint')).not.toBeNull());
    expect(result.queries.fetchPdfFormat).toHaveBeenCalled();
  });

  it('does not allow writes or saves from another task preview', async () => {
    const log = jest.spyOn(window, 'logError').mockImplementation(() => {});
    try {
      const result = await renderPreview({
        renderChildren: (
          <FormProvider>
            <WriteProbe />
          </FormProvider>
        ),
      });
      expect(screen.getByText('Second subform')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Try writing' }));
      expect(screen.getByText('Second subform')).toBeInTheDocument();
      expect(screen.queryByText('Changed')).not.toBeInTheDocument();
      expect(log).toHaveBeenCalledWith('Tried to write to readOnly dataType "subform-data"');
      result.unmount();
      expect(result.mutations.doPatchFormData.mock).not.toHaveBeenCalled();
      expect(result.mutations.doPatchMultipleFormData.mock).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });

  it('preserves writable data in the existing current-task preview', async () => {
    await renderPreview({
      target: 'Task_1',
      renderChildren: (
        <FormProvider>
          <WriteProbe dataType='test-data-model' />
        </FormProvider>
      ),
    });
    fireEvent.click(screen.getByRole('button', { name: 'Try writing' }));
    expect(screen.getByText('Changed')).toBeInTheDocument();
  });

  it('preserves explicit task overrides within a PDF preview', async () => {
    await renderPreview({
      renderChildren: (
        <TaskOverrides taskId='Task_1'>
          <TaskProbe />
        </TaskOverrides>
      ),
    });
    expect(screen.getByText('Selected task: Task_1')).toBeInTheDocument();
  });
});

function WriteProbe({ dataType = 'subform-data' }: { dataType?: string }) {
  const reference = { dataType, field: 'value' };
  const value = FD.useCurrentPick(reference);
  const setValue = FD.useSetLeafValue();
  return (
    <>
      <span>{String(value)}</span>
      <button onClick={() => setValue({ reference, newValue: 'Changed' })}>Try writing</button>
    </>
  );
}

function TaskProbe() {
  return <span>Selected task: {useProcessTaskId()}</span>;
}
