import React from 'react';

import { screen } from '@testing-library/react';

import { getAttachmentsMock } from 'src/__mocks__/getAttachmentsMock';
import * as summaryHooks from 'src/layout/FileUpload/Summary/summary';
import { ImageUploadSummary2 } from 'src/layout/ImageUpload/ImageUploadSummary2';
import { renderGenericComponentTest, RenderGenericComponentTestProps } from 'src/test/renderWithProviders';

const targetBaseComponentId = 'mock-id';
const mockAttachment = getAttachmentsMock({ count: 1, fileSize: 500 })[0];

describe('ImageUploadSummary2', () => {
  beforeEach(() => jest.restoreAllMocks());

  it('renders label', async () => {
    await renderImageUploadSummary2();
    expect(screen.getByText('mock.label')).toBeInTheDocument();
  });

  it('renders required symbol when required', async () => {
    await renderImageUploadSummary2({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders empty value text when no attachment', async () => {
    await renderImageUploadSummary2();
    expect(screen.getByText('Du har ikke lagt inn informasjon her')).toBeInTheDocument();
  });

  it('renders attachment table when attachment exists', async () => {
    jest.spyOn(summaryHooks, 'useUploaderSummaryData').mockReturnValue([mockAttachment]);
    await renderImageUploadSummary2();
    expect(screen.getByText(mockAttachment.data.filename!)).toBeInTheDocument();
  });
});

const renderImageUploadSummary2 = async (
  props: Partial<RenderGenericComponentTestProps<'ImageUpload'>> & { required?: boolean } = {},
) => {
  const { required = false, component, ...rest } = props;

  return renderGenericComponentTest({
    type: 'ImageUpload',
    renderer: (p) => (
      <ImageUploadSummary2
        {...p}
        targetBaseComponentId={targetBaseComponentId}
      />
    ),
    component: {
      id: targetBaseComponentId,
      required,
      textResourceBindings: { title: 'mock.label' },
      ...component,
    },
    ...rest,
  });
};
