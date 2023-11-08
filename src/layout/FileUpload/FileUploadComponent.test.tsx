import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { getAttachments } from 'src/__mocks__/attachmentsMock';
import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { getInstanceDataMock } from 'src/__mocks__/instanceDataStateMock';
import { FileUploadComponent } from 'src/layout/FileUpload/FileUploadComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { CompExternalExact } from 'src/layout/layout';
import type { RenderGenericComponentTestProps } from 'src/test/renderWithProviders';
import type { IData } from 'src/types/shared';

const testId = 'mockId';

function getDataElements(...props: Parameters<typeof getAttachments>): IData[] {
  return getAttachments(...props).map((a) => ({ ...a.data, dataType: testId, contentType: 'image/png' }));
}

describe('FileUploadComponent', () => {
  it('should show add attachment button and file counter when number of attachments is less than max', async () => {
    await render({
      component: { maxNumberOfAttachments: 3 },
      attachments: getDataElements({ count: 2 }),
    });

    expect(
      screen.getByRole('button', {
        name: 'Legg til flere vedlegg',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Antall filer 2\/3\./i)).toBeInTheDocument();
  });

  it('should not show add attachment button, and should show file counter when number of attachments is same as max', async () => {
    await render({
      component: { maxNumberOfAttachments: 3 },
      attachments: getDataElements({ count: 3 }),
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
      const attachment = getDataElements({ count: 1 })[0];
      attachment.filename = 'chucknorris.png';
      const { mutations } = await render({ attachments: [] });
      expect(mutations.doAttachmentUpload.mock).not.toHaveBeenCalled();

      // Upload an attachment
      const file = new File(['(⌐□_□)'], attachment.filename, { type: attachment.contentType });
      // eslint-disable-next-line testing-library/no-node-access
      const fileInput = screen.getByTestId(`altinn-drop-zone-${testId}`).querySelector('input') as HTMLInputElement;
      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Laster innhold')).toBeInTheDocument();
      });

      mutations.doAttachmentUpload.resolve(attachment);

      await waitFor(() => {
        expect(screen.queryByText('Laster innhold')).not.toBeInTheDocument();
      });

      expect(mutations.doAttachmentUpload.mock).toHaveBeenCalledTimes(1);
    });

    it('should not show loading when file uploaded=true', async () => {
      const attachments = getDataElements({ count: 1 });
      await render({ attachments });

      expect(screen.queryByText('Laster innhold')).not.toBeInTheDocument();
    });

    it('should show loading when file deleting=true', async () => {
      const attachments = getDataElements({ count: 1 });
      const { mutations } = await render({ attachments });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Slett' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Slett' }));

      await waitFor(() => {
        expect(screen.getByText('Laster innhold')).toBeInTheDocument();
      });

      mutations.doAttachmentRemove.resolve();

      await waitFor(() => {
        expect(screen.queryByText('Laster innhold')).not.toBeInTheDocument();
      });

      expect(mutations.doAttachmentRemove.mock).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('button', { name: 'Slett' })).not.toBeInTheDocument();
    });
  });

  describe('displayMode', () => {
    it('should not display drop area when displayMode is simple', async () => {
      await render({
        component: { displayMode: 'simple' },
        attachments: getDataElements({ count: 3 }),
      });

      expect(screen.queryByTestId(`altinn-drop-zone-${testId}`)).not.toBeInTheDocument();
    });

    it('should display drop area when displayMode is not simple', async () => {
      await render({
        component: { displayMode: 'list', maxNumberOfAttachments: 5 },
        attachments: getDataElements({ count: 3 }),
      });

      expect(screen.getByTestId(`altinn-drop-zone-${testId}`)).toBeInTheDocument();
    });

    it('should not display drop area when displayMode is not simple and max attachments is reached', async () => {
      await render({
        component: { displayMode: 'list', maxNumberOfAttachments: 3 },
        attachments: getDataElements({ count: 3 }),
      });

      expect(screen.queryByTestId(`altinn-drop-zone-${testId}`)).not.toBeInTheDocument();
    });
  });
});

describe('FileUploadWithTagComponent', () => {
  describe('uploaded', () => {
    it('should show spinner when file status has uploaded=false', async () => {
      const attachments = getDataElements({ count: 0 });
      await renderWithTag({ attachments });

      // Upload an attachment
      const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
      // eslint-disable-next-line testing-library/no-node-access
      const dropZone = screen.getByTestId(`altinn-drop-zone-${testId}`).querySelector('input') as HTMLInputElement;
      await userEvent.upload(dropZone, file);

      expect(screen.getByText('Laster innhold')).toBeInTheDocument();
    });

    it('should not show spinner when file status has uploaded=true', async () => {
      const attachments = getDataElements({ count: 1 });
      await renderWithTag({ attachments });
      expect(screen.queryByText('Laster innhold')).not.toBeInTheDocument();
    });
  });

  describe('updating', () => {
    it('should show spinner in edit mode when file status has updating=true', async () => {
      const attachments = getDataElements({ count: 1 });
      const { mutations } = await renderWithTag({ attachments });

      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('Tag 1'));
      await userEvent.click(screen.getByRole('button', { name: 'Lagre' }));

      expect(mutations.doAttachmentAddTag.mock).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Laster innhold')).toBeInTheDocument();
      mutations.doAttachmentAddTag.resolve();

      await waitFor(() => {
        expect(screen.queryByText('Laster innhold')).not.toBeInTheDocument();
      });
      expect(mutations.doAttachmentRemoveTag.mock).toHaveBeenCalledTimes(0);
    });

    it('should not show spinner in edit mode when file status has updating=false', async () => {
      const attachments = getDataElements({ count: 1 });

      await renderWithTag({ attachments });
      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));

      expect(screen.queryByText('Laster innhold')).not.toBeInTheDocument();
    });
  });

  describe('editing', () => {
    it('should disable dropdown in edit mode when updating', async () => {
      const attachments = getDataElements({ count: 1 });
      const { mutations } = await renderWithTag({ attachments });

      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('Tag 1'));
      await userEvent.click(screen.getByRole('button', { name: 'Lagre' }));

      expect(mutations.doAttachmentAddTag.mock).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Laster innhold')).toBeInTheDocument();

      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('should not disable dropdown in edit mode when not updating', async () => {
      await renderWithTag({ attachments: getDataElements({ count: 1 }) });
      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));

      expect(screen.getByRole('combobox')).not.toBeDisabled();
    });

    it('should not disable save button', async () => {
      await renderWithTag({ attachments: getDataElements({ count: 1 }) });
      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));

      expect(
        screen.getByRole('button', {
          name: 'Lagre',
        }),
      ).not.toBeDisabled();
    });

    it('should disable save button when readOnly=true', async () => {
      const attachments = getDataElements({ count: 1 });

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
      const attachments = getDataElements({ count: 0 });
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
      const attachments = getDataElements({ count: 1 });
      const { mutations } = await renderWithTag({ attachments });

      await userEvent.click(screen.getByRole('button', { name: 'Rediger' }));
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('Tag 1'));
      await userEvent.click(screen.getByRole('button', { name: 'Lagre' }));

      expect(mutations.doAttachmentAddTag.mock).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByRole('button', {
          name: 'Lagre',
        }),
      ).not.toBeInTheDocument();
    });

    it('should automatically show attachments in edit mode for attachments without tags', async () => {
      const attachments = getDataElements({ count: 1 });
      attachments[0].tags = [];

      await renderWithTag({ attachments });

      expect(
        screen.getByRole('button', {
          name: 'Lagre',
        }),
      ).toBeInTheDocument();
    });

    it('should not automatically show attachments in edit mode for attachments with tags', async () => {
      const attachments = getDataElements({ count: 1 });
      attachments[0].tags = ['tag1'];

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
        attachments: getDataElements({ count: 2 }),
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
        attachments: getDataElements({ count: 3 }),
      });

      expect(
        screen.queryByRole('presentation', {
          name: 'Dra og slipp eller let etter fil Tillatte filformater er: alle',
        }),
      ).not.toBeInTheDocument();
    });
  });
});

type Types = 'FileUpload' | 'FileUploadWithTag';
interface Props<T extends Types> extends Partial<RenderGenericComponentTestProps<T>> {
  type: T;
  attachments?: IData[];
}

async function renderAbstract<T extends Types>({
  type,
  component,
  genericProps,
  attachments = getDataElements(),
}: Props<T>) {
  const application = getInitialStateMock().applicationMetadata.applicationMetadata;
  application?.dataTypes.push({
    id: testId,
    allowedContentTypes: ['image/png'],
    maxCount: 4,
    minCount: 1,
  });

  return await renderGenericComponentTest<T>({
    type,
    renderer: (props) => <FileUploadComponent {...props} />,
    component: {
      id: testId,
      displayMode: type === 'FileUpload' ? 'simple' : 'list',
      maxFileSizeInMB: 2,
      maxNumberOfAttachments: type === 'FileUpload' ? 3 : 7,
      minNumberOfAttachments: 1,
      readOnly: false,
      ...(type === 'FileUploadWithTag' && {
        optionsId: 'test-options-id',
        textResourceBindings: {
          tagTitle: 'attachment-tag-title',
        },
      }),
      ...component,
    } as CompExternalExact<T>,
    genericProps: {
      isValid: true,
      ...genericProps,
    },
    reduxState: getInitialStateMock((state) => {
      state.applicationMetadata.applicationMetadata = application as IApplicationMetadata;
      state.deprecated.lastKnownInstance = getInstanceDataMock();
      state.deprecated.lastKnownInstance.data.push(...attachments);
    }),
    queries: {
      fetchOptions: () =>
        Promise.resolve([
          { value: 'tag1', label: 'Tag 1' },
          { value: 'tag2', label: 'Tag 2' },
          { value: 'tag3', label: 'Tag 3' },
        ]),
    },
  });
}

const render = (props: Omit<Props<'FileUpload'>, 'type'>) => renderAbstract({ type: 'FileUpload', ...props });
const renderWithTag = (props: Omit<Props<'FileUploadWithTag'>, 'type'>) =>
  renderAbstract({ type: 'FileUploadWithTag', ...props });
