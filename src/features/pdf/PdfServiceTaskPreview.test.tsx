import React from 'react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { jest } from '@jest/globals';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { getInstanceDataMock } from 'src/__mocks__/getInstanceDataMock';
import { getLayoutSetsMock } from 'src/__mocks__/getLayoutSetsMock';
import { getProcessDataMock } from 'src/__mocks__/getProcessDataMock';
import { Form } from 'src/components/form/Form';
import { PresentationComponent } from 'src/components/presentation/Presentation';
import { ComponentRouting, NavigateToStartUrl, ProcessWrapper } from 'src/components/wrappers/ProcessWrapper';
import { TaskOverrides } from 'src/core/contexts/TaskOverrides';
import { FormProvider } from 'src/features/form/FormContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';
import { PdfWrapper } from 'src/features/pdf/PdfWrapper';
import { fetchInstanceData, fetchProcessState } from 'src/queries/queries';
import { renderWithoutInstanceAndLayout } from 'src/test/renderWithProviders';
import type { ILayoutSettings } from 'src/layout/common.generated';
import type { ILayoutCollection } from 'src/layout/layout';
import type { AppQueries } from 'src/queries/types';

const firstId = '2f5c6a01-30e1-4d72-a19e-162a90517d14';
const secondId = '85b7f187-80f8-40aa-800e-39ffbc47c751';
const taskId = 'SubformPdf';
const instanceId = '512345/75154373-aed4-41f7-95b4-e5b5115c2edc';

function setup(currentTaskId = 'Task_1') {
  jest.mocked(fetchProcessState).mockImplementation(async () =>
    getProcessDataMock((p) => {
      p.processTasks = [
        p.currentTask!,
        { elementId: taskId, elementType: 'ServiceTask', altinnTaskType: 'subformPdf' },
        { elementId: 'PdfAuto', elementType: 'ServiceTask', altinnTaskType: 'pdf' },
        { elementId: 'PdfLayout', elementType: 'ServiceTask', altinnTaskType: 'pdf' },
      ];
      if (currentTaskId !== 'Task_1') {
        p.currentTask = { ...p.currentTask!, elementId: currentTaskId, altinnTaskType: 'subformPdf' };
      }
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

function input(id: string, dataType: string, title: string) {
  return {
    id,
    type: 'Input',
    dataModelBindings: { simpleBinding: { dataType, field: 'value' } },
    textResourceBindings: { title },
  };
}

/**
 * The documented v4 setup for subform PDFs: the service task's layout set uses the subform data type and holds a
 * hidden copy of the Subform component, which the PDF URL routes into. The subform's own layout set has a PDF layout.
 */
function layouts(layoutSetId: string): ILayoutCollection {
  switch (layoutSetId) {
    case 'subform-pdf':
      return {
        ServiceTask: {
          data: {
            layout: [
              { id: 'service-task-failed', type: 'Paragraph', textResourceBindings: { title: 'Service task failed' } },
              { id: 'subform-component', type: 'Subform', layoutSet: 'subform-layout', hidden: true, tableColumns: [] },
            ],
          },
        },
      } as ILayoutCollection;
    case 'subform-layout':
      return {
        Subform: { data: { layout: [input('subform-input', 'subform-data', 'Subform value')] } },
        Pdf: {
          data: {
            layout: [
              { id: 'subform-pdf-title', type: 'Header', size: 'L', textResourceBindings: { title: 'Subform PDF' } },
              input('subform-pdf-value', 'subform-data', 'Subform value'),
            ],
          },
        },
      } as ILayoutCollection;
    case 'pdf-layout':
      return {
        Pdf: { data: { layout: [input('pdf-layout-value', 'test-data-model', 'Main field')] } },
      } as ILayoutCollection;
    default:
      return {
        FormLayout: { data: { layout: [input('main-input', 'test-data-model', 'Main field')] } },
      } as ILayoutCollection;
  }
}

function layoutSettings(layoutSetId: string): ILayoutSettings {
  switch (layoutSetId) {
    case 'subform-pdf':
      return { pages: { order: ['ServiceTask'] } };
    case 'subform-layout':
      return { pages: { order: ['Subform'], pdfLayoutName: 'Pdf' } };
    case 'pdf-layout':
      return { pages: { order: ['Pdf'], pdfLayoutName: 'Pdf' } };
    default:
      return { pages: { order: ['FormLayout'] } };
  }
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
    fetchLayouts: async (layoutSetId) => layouts(layoutSetId),
    fetchLayoutSettings: async (layoutSetId) => layoutSettings(layoutSetId),
    fetchLayoutSettingsForInstance: async (layoutSetId) => layoutSettings(layoutSetId),
    fetchDataModelSchema: async () => ({ type: 'object', properties: { value: { type: 'string' } } }),
    fetchFormData: async (url) => ({
      value: url.includes(secondId) ? 'Second subform' : url.includes(firstId) ? 'First subform' : 'Main value',
    }),
  };
}

/**
 * The instance routes from App.tsx, so a subform PDF URL routes into the Subform component
 */
function PreviewRouter({ children, path }: PropsWithChildren<{ path: string }>) {
  const router = createMemoryRouter(
    [
      {
        path: 'instance/:instanceOwnerPartyId/:instanceGuid/:taskId',
        element: children,
        children: [
          { index: true, element: <NavigateToStartUrl forceCurrentTask={false} /> },
          {
            path: ':pageKey',
            children: [
              {
                index: true,
                element: (
                  <PdfWrapper>
                    <PresentationComponent>
                      <Form />
                    </PresentationComponent>
                  </PdfWrapper>
                ),
              },
              {
                path: ':componentId',
                children: [
                  { index: true, element: <ComponentRouting /> },
                  { path: '*', element: <ComponentRouting /> },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: children },
    ],
    { basename: '/ttd/test', initialEntries: [`/ttd/test${path}`], future: { v7_relativeSplatPath: true } },
  );

  return (
    <RouterProvider
      router={router}
      future={{ v7_startTransition: true }}
    />
  );
}

async function renderPreview({
  selectedId = secondId,
  pdf = true,
  target = taskId,
  currentTaskId = 'Task_1',
  extraQuery = '',
  renderChildren,
  queryOverrides,
}: {
  selectedId?: string;
  pdf?: boolean;
  target?: string;
  currentTaskId?: string;
  extraQuery?: string;
  renderChildren?: React.ReactNode;
  queryOverrides?: Partial<AppQueries>;
} = {}) {
  setup(currentTaskId);
  // The same URL shape the backend sends to the PDF generator for a subform PDF
  const page = target === taskId ? `subform/subform-component/${selectedId}/` : '';
  const query = pdf ? `pdf=1${extraQuery}` : '';
  const suffix = query ? `?${query}` : '';
  const path = `/instance/${instanceId}/${target}/${page}${suffix}`;
  window.location.hash = `#${path}`;
  return renderWithoutInstanceAndLayout({
    renderer: () => (
      <InstanceProvider>
        {renderChildren ?? (
          <ProcessWrapper>
            <FormProvider>
              <Outlet />
            </FormProvider>
          </ProcessWrapper>
        )}
      </InstanceProvider>
    ),
    router: ({ children }) => <PreviewRouter path={path}>{children}</PreviewRouter>,
    queries: { ...queries(), ...queryOverrides },
  });
}

async function expectSubformPdf(
  result: Awaited<ReturnType<typeof renderPreview>>,
  selectedId: string,
  expected: string,
  absent: string,
) {
  await waitFor(() => expect(result.container.querySelector('#readyForPrint')).not.toBeNull());
  expect(screen.getByText('Subform PDF')).toBeInTheDocument();
  expect(screen.getByDisplayValue(expected)).toBeInTheDocument();
  expect(screen.queryByDisplayValue(absent)).not.toBeInTheDocument();
  expect(screen.queryByText('Service task failed')).not.toBeInTheDocument();
  expect(screen.queryByDisplayValue('Main value')).not.toBeInTheDocument();
  expect(result.queries.fetchLayouts).toHaveBeenCalledWith('subform-pdf');
  expect(result.queries.fetchLayouts).toHaveBeenCalledWith('subform-layout');
  expect(result.queries.fetchFormData).toHaveBeenCalledWith(expect.stringContaining(selectedId), {});
}

describe('PDF service task previews in frontend v4', () => {
  it.each([
    [firstId, 'First subform', 'Second subform'],
    [secondId, 'Second subform', 'First subform'],
  ])('renders the requested subform %s while an earlier task is current', async (selectedId, expected, absent) => {
    const result = await renderPreview({ selectedId });
    await expectSubformPdf(result, selectedId, expected, absent);
    expect(result.queries.fetchPdfFormat).not.toHaveBeenCalled();
    result.unmount();
    expect(result.mutations.doPatchFormData.mock).not.toHaveBeenCalled();
    expect(result.mutations.doPatchMultipleFormData.mock).not.toHaveBeenCalled();
  });

  it('renders the requested subform when the subform PDF task is current', async () => {
    const result = await renderPreview({ selectedId: firstId, currentTaskId: taskId });
    await expectSubformPdf(result, firstId, 'First subform', 'Second subform');
  });

  it('keeps normal navigation to a future task blocked', async () => {
    await renderPreview({ pdf: false });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Gå til riktig prosessteg' })).toBeInTheDocument());
    expect(screen.queryByText('Subform PDF')).not.toBeInTheDocument();
  });

  it('renders auto-PDF tasks without a layout while another task is current', async () => {
    const result = await renderPreview({ target: 'PdfAuto', extraQuery: '&task=Task_1' });
    await waitFor(() => expect(result.container.querySelector('#readyForPrint')).not.toBeNull());
    expect(screen.getByText('Main value')).toBeInTheDocument();
    expect(result.queries.fetchLayouts).toHaveBeenCalledWith('some-data-task');
  });

  it('renders a future PDF task with its own layout', async () => {
    const result = await renderPreview({ target: 'PdfLayout' });
    await waitFor(() => expect(result.container.querySelector('#readyForPrint')).not.toBeNull());
    expect(screen.getByDisplayValue('Main value')).toBeInTheDocument();
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
