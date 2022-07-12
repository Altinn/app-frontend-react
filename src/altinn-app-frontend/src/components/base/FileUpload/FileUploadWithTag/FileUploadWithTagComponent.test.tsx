import React from 'react';
import { screen } from '@testing-library/react';

import type { IComponentProps } from 'src/components';

import {
  AsciiUnitSeparator,
  getFileEnding,
  removeFileEnding,
} from 'src/utils/attachment';
import {
  getFileUploadComponentValidations,
  parseFileUploadComponentWithTagValidationObject,
} from 'src/utils/formComponentUtils';
import type { IFileUploadWithTagProps } from './FileUploadWithTagComponent';
import { FileUploadWithTagComponent } from './FileUploadWithTagComponent';

import { renderWithProviders } from 'src/../testUtils';
import { getAttachments } from 'src/../__mocks__/attachmentsMock';
import { getFormLayoutStateMock } from 'src/../__mocks__/formLayoutStateMock';
import { getUiConfigStateMock } from 'src/../__mocks__/uiConfigStateMock';
import { getInitialStateMock } from 'src/../__mocks__/initialStateMock';

const testId = 'test-id';

describe('FileUploadWithTagComponent', () => {
  describe('uploaded', () => {
    it('should show spinner when file status has uploaded=false', () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].uploaded = false;

      render({}, { attachments });

      expect(screen.getByText(/general\.loading/i)).toBeInTheDocument();
    });

    it('should not show spinner when file status has uploaded=true', () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].uploaded = true;

      render({}, { attachments });

      expect(screen.queryByText(/general\.loading/i)).not.toBeInTheDocument();
    });
  });

  describe('updating', () => {
    it('should show spinner in edit mode when file status has updating=true', () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].updating = true;

      render({}, { attachments, editIndex: 0 });

      expect(screen.getByText(/general\.loading/i)).toBeInTheDocument();
    });

    it('should not show spinner in edit mode when file status has updating=false', () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].updating = false;

      render({}, { attachments, editIndex: 0 });

      expect(screen.queryByText(/general\.loading/i)).not.toBeInTheDocument();
    });
  });

  describe('editing', () => {
    it('should disable dropdown in edit mode when updating', () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].updating = true;

      render({}, { attachments, editIndex: 0 });

      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('should not disable dropdown in edit mode when not updating', () => {
      const attachments = getAttachments({ count: 1 });

      render({}, { attachments, editIndex: 0 });

      expect(screen.getByRole('combobox')).not.toBeDisabled();
    });

    it('should not disable save button', () => {
      const attachments = getAttachments({ count: 1 });

      render({}, { attachments, editIndex: 0 });

      expect(
        screen.getByRole('button', {
          name: /general\.save/i,
        }),
      ).not.toBeDisabled();
    });

    it('should disable save button when readOnly=true', () => {
      const attachments = getAttachments({ count: 1 });

      render({ readOnly: true }, { attachments, editIndex: 0 });

      expect(
        screen.getByRole('button', {
          name: /general\.save/i,
        }),
      ).toBeDisabled();
    });

    it('should disable save button when attachment.uploaded=false', () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].uploaded = false;

      render({}, { attachments, editIndex: 0 });

      expect(
        screen.getByRole('button', {
          name: /general\.save/i,
        }),
      ).toBeDisabled();
    });

    it('should not show save button when attachment.updating=true', () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].updating = true;

      render({}, { attachments, editIndex: 0 });

      expect(
        screen.queryByRole('button', {
          name: /general\.save/i,
        }),
      ).not.toBeInTheDocument();
    });

    it('should automatically show attachments in edit mode for attachments without tags', () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].tags = [];

      render({}, { attachments });

      expect(
        screen.getByRole('button', {
          name: /general\.save/i,
        }),
      ).toBeInTheDocument();
    });

    it('should not automatically show attachments in edit mode for attachments with tags', () => {
      const attachments = getAttachments({ count: 1 });
      attachments[0].tags = ['tag1'];

      render({}, { attachments });

      expect(
        screen.queryByRole('button', {
          name: /general\.save/i,
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe('files', () => {
    it('should display drop area when max attachments is not reached', () => {
      const attachments = getAttachments({ count: 2 });

      render({ maxNumberOfAttachments: 3 }, { attachments });

      expect(
        screen.getByRole('button', {
          name: /form_filler\.file_uploader_drag form_filler\.file_uploader_find form_filler\.file_uploader_valid_file_format form_filler\.file_upload_valid_file_format_all/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`altinn-drop-zone-${testId}`),
      ).toBeInTheDocument();
    });

    it('should not display drop area when max attachments is reached', () => {
      const attachments = getAttachments({ count: 3 });

      render({ maxNumberOfAttachments: 3 }, { attachments });

      expect(
        screen.queryByRole('button', {
          name: /form_filler\.file_uploader_drag form_filler\.file_uploader_find form_filler\.file_uploader_valid_file_format form_filler\.file_upload_valid_file_format_all/i,
        }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId(`altinn-drop-zone-${testId}`),
      ).not.toBeInTheDocument();
    });
  });

  it('getFileUploadWithTagComponentValidations should return correct validation', () => {
    const mockLanguage = {
      language: {
        form_filler: {
          file_uploader_validation_error_delete:
            'Noe gikk galt under slettingen av filen, prøv igjen senere.',
          file_uploader_validation_error_upload:
            'Noe gikk galt under opplastingen av filen, prøv igjen senere.',
          file_uploader_validation_error_update:
            'Noe gikk galt under oppdatering av filens merking, prøv igjen senere.',
        },
      },
    };

    const uploadValidation = getFileUploadComponentValidations(
      'upload',
      mockLanguage.language,
    );
    expect(uploadValidation).toEqual({
      simpleBinding: {
        errors: [
          'Noe gikk galt under opplastingen av filen, prøv igjen senere.',
        ],
        warnings: [],
      },
    });

    const updateValidation = getFileUploadComponentValidations(
      'update',
      mockLanguage.language,
    );
    expect(updateValidation).toEqual({
      simpleBinding: {
        errors: [
          'Noe gikk galt under oppdatering av filens merking, prøv igjen senere.',
        ],
        warnings: [],
      },
    });

    const updateValidationWithId = getFileUploadComponentValidations(
      'update',
      mockLanguage.language,
      'mock-attachment-id',
    );
    expect(updateValidationWithId).toEqual({
      simpleBinding: {
        errors: [
          'mock-attachment-id' +
            AsciiUnitSeparator +
            'Noe gikk galt under oppdatering av filens merking, prøv igjen senere.',
        ],
        warnings: [],
      },
    });

    const deleteValidation = getFileUploadComponentValidations(
      'delete',
      mockLanguage.language,
    );
    expect(deleteValidation).toEqual({
      simpleBinding: {
        errors: ['Noe gikk galt under slettingen av filen, prøv igjen senere.'],
        warnings: [],
      },
    });
  });

  it('parseFileUploadComponentWithTagValidationObject should return correct validation array', () => {
    const mockValidations = [
      'Noe gikk galt under opplastingen av filen, prøv igjen senere.',
      'Noe gikk galt under oppdatering av filens merking, prøv igjen senere.',
      'mock-attachment-id' +
        AsciiUnitSeparator +
        'Noe gikk galt under oppdatering av filens merking, prøv igjen senere.',
      'Noe gikk galt under slettingen av filen, prøv igjen senere.',
    ];
    const expectedResult = [
      {
        id: '',
        message:
          'Noe gikk galt under opplastingen av filen, prøv igjen senere.',
      },
      {
        id: '',
        message:
          'Noe gikk galt under oppdatering av filens merking, prøv igjen senere.',
      },
      {
        id: 'mock-attachment-id',
        message:
          'Noe gikk galt under oppdatering av filens merking, prøv igjen senere.',
      },
      {
        id: '',
        message: 'Noe gikk galt under slettingen av filen, prøv igjen senere.',
      },
    ];

    const validationArray =
      parseFileUploadComponentWithTagValidationObject(mockValidations);
    expect(validationArray).toEqual(expectedResult);
  });

  it('should get file ending correctly', () => {
    expect(getFileEnding('test.jpg')).toEqual('.jpg');
    expect(getFileEnding('navn.med.punktum.xml')).toEqual('.xml');
    expect(getFileEnding('navnutenfilendelse')).toEqual('');
    expect(getFileEnding(null)).toEqual('');
  });

  it('should remove file ending correctly', () => {
    expect(removeFileEnding('test.jpg')).toEqual('test');
    expect(removeFileEnding('navn.med.punktum.xml')).toEqual(
      'navn.med.punktum',
    );
    expect(removeFileEnding('navnutenfilendelse')).toEqual(
      'navnutenfilendelse',
    );
    expect(removeFileEnding(null)).toEqual('');
  });
});

const render = (
  props: Partial<IFileUploadWithTagProps> = {},
  { attachments = getAttachments(), editIndex = -1 },
) => {
  const initialState = {
    ...getInitialStateMock(),
    attachments: {
      attachments: {
        [testId]: attachments,
      },
      validationResults: {
        [testId]: {
          simpleBinding: {
            errors: [
              'mock error message',
              'attachment-id-2' + AsciiUnitSeparator + 'mock error message',
            ],
          },
        },
      },
    },
    optionState: {
      options: {
        test: {
          id: testId,
          options: [
            { value: 'attachment-tag-0', label: 'attachment-tag-label-0' },
            { value: 'attachment-tag-1', label: 'attachment-tag-label-1' },
            { value: 'attachment-tag-2', label: 'attachment-tag-label-2' },
          ],
          loading: false,
        },
      },
      error: null,
    },
    formLayout: {
      ...getFormLayoutStateMock(),
      uiConfig: {
        ...getUiConfigStateMock(),
        fileUploadersWithTag: {
          [testId]: {
            editIndex,
            chosenOptions: {
              'attachment-id-0': 'attachment-tag-0',
              'attachment-id-1': 'attachment-tag-1',
              'attachment-id-2': 'attachment-tag-2',
            },
          },
        },
      },
    },
  };

  const textResourceBindings = {
    tagTitle: 'attachment-tag-title',
    'attachment-tag-label-0': 'attachment-tag-value-0',
    'attachment-tag-label-1': 'attachment-tag-value-1',
    'attachment-tag-label-2': 'attachment-tag-value-2',
  };

  const allProps = {
    id: testId,
    isValid: true,
    maxFileSizeInMB: 2,
    maxNumberOfAttachments: 7,
    minNumberOfAttachments: 1,
    readOnly: false,
    optionsId: 'test-options-id',
    getTextResource: jest.fn(),
    getTextResourceAsString: jest.fn(),
    textResourceBindings: textResourceBindings,
    ...({} as IComponentProps),
    ...props,
  };

  renderWithProviders(<FileUploadWithTagComponent {...allProps} />, {
    preloadedState: initialState,
  });
};
