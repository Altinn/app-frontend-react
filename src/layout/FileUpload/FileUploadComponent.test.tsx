import React from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { getAttachments } from 'src/__mocks__/attachmentsMock';
import { getInstanceDataMock } from 'src/__mocks__/instanceDataStateMock';
import { FileUploadComponent } from 'src/layout/FileUpload/FileUploadComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';
import type { UploadedAttachment } from 'src/features/attachments';
import type { CompFileUploadWithTagExternal } from 'src/layout/FileUploadWithTag/config.generated';
import type { RenderGenericComponentTestProps } from 'src/test/renderWithProviders';

const testId = 'mockId';

describe('FileUploadComponent', () => {
  it('should show add attachment button and file counter when number of attachments is less than max', () => {
    render({
      component: { maxNumberOfAttachments: 3 },
      attachments: getAttachments({ count: 2 }),
    });

    expect(
      screen.getByRole('button', {
        name: 'Legg til flere vedlegg',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Antall filer 2\/3\./i)).toBeInTheDocument();
  });

  it('should not show add attachment button, and should show file counter when number of attachments is same as max', () => {
    render({
      component: { maxNumberOfAttachments: 3 },
      attachments: getAttachments({ count: 3 }),
    });

    expect(
      screen.queryByRole('button', {
        name: 'Legg til flere vedlegg',
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Antall filer 3\/3\./i)).toBeInTheDocument();
  });

  describe('file status', () => {
    it('should show loading when file uploaded=false', async () => {
      const attachments = getAttachments({ count: 0 });
      render({ attachments });

      // Upload an attachment
      const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
      const dropZone = screen.getByTestId(`altinn-drop-zone-${testId}`);
      await userEvent.upload(dropZone, file);

      expect(screen.getByText('Laster innhold')).toBeInTheDocument();
    });

    it('should not show loading when file uploaded=true', () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].uploaded = true;

      render({ attachments });

      expect(screen.queryByText('Laster innhold')).not.toBeInTheDocument();
    });

    it('should show loading when file deleting=true', () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].deleting = true;

      render({ attachments });

      expect(screen.getByText('Laster innhold')).toBeInTheDocument();
    });

    it('should not show loading when file deleting=false', () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].deleting = false;

      render({ attachments });

      expect(screen.queryByText('Laster innhold')).not.toBeInTheDocument();
    });
  });

  describe('displayMode', () => {
    it('should not display drop area when displayMode is simple', () => {
      render({
        component: { displayMode: 'simple' },
        attachments: getAttachments({ count: 3 }),
      });

      expect(screen.queryByTestId(`altinn-drop-zone-${testId}`)).not.toBeInTheDocument();
    });

    it('should display drop area when displayMode is not simple', () => {
      render({
        component: { displayMode: 'list' },
        attachments: getAttachments({ count: 3 }),
      });

      expect(screen.getByTestId(`altinn-drop-zone-${testId}`)).toBeInTheDocument();
    });

    it('should not display drop area when displayMode is not simple and max attachments is reached', () => {
      render({
        component: { displayMode: 'list', maxNumberOfAttachments: 3 },
        attachments: getAttachments({ count: 3 }),
      });

      expect(screen.queryByTestId(`altinn-drop-zone-${testId}`)).not.toBeInTheDocument();
    });
  });
});

describe('FileUploadWithTagComponent', () => {
  describe('uploaded', () => {
    it('should show spinner when file status has uploaded=false', async () => {
      const attachments = getAttachments({ count: 0 });
      await renderWithTag({ attachments });

      // Upload an attachment
      const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
      const dropZone = screen.getByTestId(`altinn-drop-zone-${testId}`);
      await userEvent.upload(dropZone, file);

      expect(screen.getByText('Laster innhold')).toBeInTheDocument();
    });

    it('should not show spinner when file status has uploaded=true', async () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].uploaded = true;

      await renderWithTag({ attachments });

      expect(screen.queryByText('Laster innhold')).not.toBeInTheDocument();
    });
  });

  describe('updating', () => {
    it('should show spinner in edit mode when file status has updating=true', async () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].updating = true;

      await renderWithTag({ attachments });
      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));

      expect(screen.getByText('Laster innhold')).toBeInTheDocument();
    });

    it('should not show spinner in edit mode when file status has updating=false', async () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].updating = false;

      await renderWithTag({ attachments });
      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));

      expect(screen.queryByText('Laster innhold')).not.toBeInTheDocument();
    });
  });

  describe('editing', () => {
    it('should disable dropdown in edit mode when updating', async () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].updating = true;

      await renderWithTag({ attachments });
      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));

      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('should not disable dropdown in edit mode when not updating', async () => {
      await renderWithTag({ attachments: getAttachments({ count: 1 }) });
      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));

      expect(screen.getByRole('combobox')).not.toBeDisabled();
    });

    it('should not disable save button', async () => {
      await renderWithTag({ attachments: getAttachments({ count: 1 }) });
      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));

      expect(
        screen.getByRole('button', {
          name: 'Lagre',
        }),
      ).not.toBeDisabled();
    });

    it('should disable save button when readOnly=true', async () => {
      const attachments = getAttachments({ count: 1 });

      await renderWithTag({
        component: { readOnly: true },
        attachments,
      });
      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));

      expect(
        screen.getByRole('button', {
          name: 'Lagre',
        }),
      ).toBeDisabled();
    });

    it('should disable save button when attachment.uploaded=false', async () => {
      const attachments = getAttachments({ count: 0 });
      await renderWithTag({ attachments });

      // Upload an attachment
      const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
      const dropZone = screen.getByTestId(`altinn-drop-zone-${testId}`);
      await userEvent.upload(dropZone, file);

      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));

      expect(
        screen.getByRole('button', {
          name: 'Lagre',
        }),
      ).toBeDisabled();
    });

    it('should not show save button when attachment.updating=true', async () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].updating = true;

      await renderWithTag({ attachments });
      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));
      expect(
        screen.queryByRole('button', {
          name: 'Lagre',
        }),
      ).not.toBeInTheDocument();
    });

    it('should automatically show attachments in edit mode for attachments without tags', async () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].data.tags = [];

      await renderWithTag({ attachments });

      expect(
        screen.getByRole('button', {
          name: 'Lagre',
        }),
      ).toBeInTheDocument();
    });

    it('should not automatically show attachments in edit mode for attachments with tags', async () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].data.tags = ['tag1'];

      await renderWithTag({ attachments });
      expect(
        screen.queryByRole('button', {
          name: 'Lagre',
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe('files', () => {
    it('should display drop area when max attachments is not reached', async () => {
      await renderWithTag({
        component: { maxNumberOfAttachments: 3 },
        attachments: getAttachments({ count: 2 }),
      });

      expect(
        screen.getByRole('presentation', {
          name: 'Dra og slipp eller let etter fil Tillatte filformater er: alle',
        }),
      ).toBeInTheDocument();
    });

    it('should not display drop area when max attachments is reached', async () => {
      await renderWithTag({
        component: { maxNumberOfAttachments: 3 },
        attachments: getAttachments({ count: 3 }),
      });

      expect(
        screen.queryByRole('presentation', {
          name: 'Dra og slipp eller let etter fil Tillatte filformater er: alle',
        }),
      ).not.toBeInTheDocument();
    });
  });
});

interface Props extends Partial<RenderGenericComponentTestProps<'FileUpload'>> {
  attachments?: UploadedAttachment[];
}

const render = async ({ component, genericProps, attachments = getAttachments() }: Props = {}) => {
  await renderGenericComponentTest({
    type: 'FileUpload',
    renderer: (props) => <FileUploadComponent {...props} />,
    component: {
      id: testId,
      displayMode: 'simple',
      maxFileSizeInMB: 2,
      maxNumberOfAttachments: 4,
      minNumberOfAttachments: 1,
      readOnly: false,
      ...component,
    },
    genericProps: {
      isValid: true,
      ...genericProps,
    },
    mockedQueries: {
      fetchInstanceData: () => {
        const mock = getInstanceDataMock();
        mock.data.push(...attachments.map((a) => a.data));

        return Promise.resolve(mock);
      },
    },
  });
};

const renderWithTag = async ({ component, genericProps, attachments = getAttachments() }: Props = {}) => {
  await renderGenericComponentTest({
    type: 'FileUploadWithTag',
    renderer: (props) => <FileUploadComponent {...props} />,
    component: {
      id: testId,
      type: 'FileUploadWithTag',
      displayMode: 'list',
      maxFileSizeInMB: 2,
      maxNumberOfAttachments: 7,
      minNumberOfAttachments: 1,
      readOnly: false,
      optionsId: 'test-options-id',
      textResourceBindings: {
        tagTitle: 'attachment-tag-title',
      },
      ...component,
    } as CompFileUploadWithTagExternal,
    genericProps: {
      isValid: true,
      ...genericProps,
    },
    mockedQueries: {
      fetchInstanceData: () => {
        const mock = getInstanceDataMock();
        mock.data.push(...attachments.map((a) => a.data));

        return Promise.resolve(mock);
      },
    },
  });
};
