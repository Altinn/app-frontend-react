import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import { getAttachmentDataMock, getAttachmentMock } from 'src/__mocks__/getAttachmentsMock';
import { FileUploadComponent } from 'src/layout/FileUpload/FileUploadComponent';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import type { IAttachment, TemporaryAttachment, UploadedAttachment } from 'src/features/attachments';
import type { FileScanResult } from 'src/features/attachments/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

// Mock the attachment hooks
const mockUseAttachmentsFor = jest.fn();
const mockUseAttachmentsUploader = jest.fn();
const mockUseAddRejectedAttachments = jest.fn();

jest.mock('src/features/attachments/hooks', () => ({
  useAttachmentsFor: () => mockUseAttachmentsFor(),
  useAttachmentsUploader: () => mockUseAttachmentsUploader(),
  useAddRejectedAttachments: () => mockUseAddRejectedAttachments(),
  useAttachmentsSelector: jest.fn(),
  useFailedAttachmentsFor: jest.fn(() => []),
  useWaitUntilUploaded: jest.fn(),
}));

// Mock the polling hook
jest.mock('src/layout/FileUpload/hooks/useFileScanPolling', () => ({
  useFileScanPolling: jest.fn(() => ({
    isPolling: false,
    hasPendingScans: false,
  })),
}));

// Mock other hooks
jest.mock('src/features/options/useGetOptions', () => ({
  useGetOptions: jest.fn(() => ({ options: [], isFetching: false })),
}));

jest.mock('src/features/validation/selectors/unifiedValidationsForNode', () => ({
  useUnifiedValidationsForNode: jest.fn(() => []),
}));

jest.mock('src/features/routing/AppRoutingContext', () => ({
  useIsSubformPage: jest.fn(() => false),
}));

jest.mock('src/hooks/useDeviceWidths', () => ({
  useIsMobileOrTablet: jest.fn(() => false),
}));

describe('FileUpload with Infected Files Integration', () => {
  const createInfectedAttachment = (filename = 'infected-file.pdf'): UploadedAttachment =>
    getAttachmentMock({
      data: getAttachmentDataMock({
        fileScanResult: 'Infected' as FileScanResult,
        filename,
      }),
      uploaded: true,
    });

  const createCleanAttachment = (filename = 'clean-file.pdf'): UploadedAttachment =>
    getAttachmentMock({
      data: getAttachmentDataMock({
        fileScanResult: 'Clean' as FileScanResult,
        filename,
      }),
      uploaded: true,
    });

  const createPendingAttachment = (filename = 'scanning-file.pdf'): UploadedAttachment =>
    getAttachmentMock({
      data: getAttachmentDataMock({
        fileScanResult: 'Pending' as FileScanResult,
        filename,
      }),
      uploaded: true,
    });

  const renderFileUploadWithAttachments = async (attachments: IAttachment[]) => {
    mockUseAttachmentsFor.mockReturnValue(attachments);

    return await renderWithInstanceAndLayout({
      renderer: () => (
        <FileUploadComponent
          node={
            {
              id: 'fileUpload-test',
              type: 'FileUpload',
              maxFileSizeInMB: 25,
              maxNumberOfAttachments: 5,
              minNumberOfAttachments: 1,
              displayMode: 'list',
              readOnly: false,
              hasCustomFileEndings: false,
              validFileEndings: [],
              textResourceBindings: {},
              dataModelBindings: {},
            } as LayoutNode<'FileUpload'>
          }
        />
      ),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('InfectedFileAlert integration', () => {
    it('should display infected file alert when infected files are present', async () => {
      const infectedFile = createInfectedAttachment('malware.exe');
      await renderFileUploadWithAttachments([infectedFile]);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Should show the infected file alert message
      expect(screen.getByText(/infisert fil/i)).toBeInTheDocument();
      expect(screen.getByText(/malware.exe/)).toBeInTheDocument();
    });

    it('should not display infected file alert when only clean files are present', async () => {
      const cleanFile = createCleanAttachment('document.pdf');
      await renderFileUploadWithAttachments([cleanFile]);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('should display multiple infected file alerts', async () => {
      const infectedFile1 = createInfectedAttachment('malware1.exe');
      const infectedFile2 = createInfectedAttachment('virus2.pdf');
      await renderFileUploadWithAttachments([infectedFile1, infectedFile2]);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts).toHaveLength(2);
      });

      expect(screen.getByText(/malware1.exe/)).toBeInTheDocument();
      expect(screen.getByText(/virus2.pdf/)).toBeInTheDocument();
    });

    it('should show alerts only for infected files in mixed attachment list', async () => {
      const cleanFile = createCleanAttachment('document.pdf');
      const infectedFile = createInfectedAttachment('malware.exe');
      const pendingFile = createPendingAttachment('scanning.pdf');

      await renderFileUploadWithAttachments([cleanFile, infectedFile, pendingFile]);

      await waitFor(() => {
        // Should only show one alert for the infected file
        const alerts = screen.getAllByRole('alert');
        expect(alerts).toHaveLength(1);
      });

      expect(screen.getByText(/malware.exe/)).toBeInTheDocument();
      expect(screen.queryByText(/document.pdf/)).not.toBeInTheDocument();
      expect(screen.queryByText(/scanning.pdf/)).not.toBeInTheDocument();
    });

    it('should not show alerts for pending scan results', async () => {
      const pendingFile = createPendingAttachment('scanning.pdf');
      await renderFileUploadWithAttachments([pendingFile]);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('should not show alerts for NotApplicable scan results', async () => {
      const notApplicableFile = getAttachmentMock({
        data: getAttachmentDataMock({
          fileScanResult: 'NotApplicable' as FileScanResult,
          filename: 'config.txt',
        }),
        uploaded: true,
      });

      await renderFileUploadWithAttachments([notApplicableFile]);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('FileTable integration with infected files', () => {
    it('should display infected files in the file table', async () => {
      const infectedFile = createInfectedAttachment('malware.exe');
      await renderFileUploadWithAttachments([infectedFile]);

      await waitFor(() => {
        // Should show the file in the table
        expect(screen.getByText('malware.exe')).toBeInTheDocument();
      });

      // Should show the infected file alert
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should display mixed file types in the table with appropriate statuses', async () => {
      const cleanFile = createCleanAttachment('document.pdf');
      const infectedFile = createInfectedAttachment('malware.exe');
      const pendingFile = createPendingAttachment('scanning.pdf');

      await renderFileUploadWithAttachments([cleanFile, infectedFile, pendingFile]);

      await waitFor(() => {
        // All files should be visible in the table
        expect(screen.getByText('document.pdf')).toBeInTheDocument();
        expect(screen.getByText('malware.exe')).toBeInTheDocument();
        expect(screen.getByText('scanning.pdf')).toBeInTheDocument();
      });

      // Only infected file should trigger alert
      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(1);
    });
  });

  describe('FileUpload component behavior with infected files', () => {
    it('should show file upload dropzone when no attachments are present', async () => {
      await renderFileUploadWithAttachments([]);

      await waitFor(() => {
        // Should show the dropzone for uploading files
        expect(screen.getByText(/last opp fil/i)).toBeInTheDocument();
      });
    });

    it('should show attachments counter with infected files', async () => {
      const infectedFile = createInfectedAttachment('malware.exe');
      const cleanFile = createCleanAttachment('document.pdf');
      await renderFileUploadWithAttachments([infectedFile, cleanFile]);

      await waitFor(() => {
        // Should show attachment count
        expect(screen.getByText(/2\/5/)).toBeInTheDocument();
      });
    });

    it('should handle empty attachments list', async () => {
      await renderFileUploadWithAttachments([]);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByText(/last opp fil/i)).toBeInTheDocument();
      });
    });

    it('should not show alerts for non-uploaded infected files', async () => {
      const nonUploadedInfectedFile: TemporaryAttachment = {
        uploaded: false,
        data: {
          temporaryId: 'temp-id',
          filename: 'uploading-malware.exe',
          size: 1024,
        },
        updating: false,
        deleting: false,
      };

      await renderFileUploadWithAttachments([nonUploadedInfectedFile]);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('File scan result edge cases', () => {
    it('should handle files without scan results', async () => {
      const fileWithoutScanResult = getAttachmentMock({
        data: {
          ...getAttachmentDataMock({ filename: 'legacy-file.pdf' }),
          fileScanResult: undefined,
        },
        uploaded: true,
      });

      await renderFileUploadWithAttachments([fileWithoutScanResult]);

      await waitFor(() => {
        expect(screen.getByText('legacy-file.pdf')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('should handle files with updating status during scan', async () => {
      const updatingFile: UploadedAttachment = {
        ...createPendingAttachment('scanning.pdf'),
        updating: true,
      };

      await renderFileUploadWithAttachments([updatingFile]);

      await waitFor(() => {
        expect(screen.getByText('scanning.pdf')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('should handle files with deleting status that are infected', async () => {
      const deletingInfectedFile: UploadedAttachment = {
        ...createInfectedAttachment('deleting-malware.exe'),
        deleting: true,
      };

      await renderFileUploadWithAttachments([deletingInfectedFile]);

      await waitFor(() => {
        expect(screen.getByText('deleting-malware.exe')).toBeInTheDocument();
        // Should still show alert for infected file even if being deleted
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and user experience', () => {
    it('should provide proper ARIA labels for infected file alerts', async () => {
      const infectedFile = createInfectedAttachment('malware.exe');
      await renderFileUploadWithAttachments([infectedFile]);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('aria-live', 'assertive');
        expect(alert).toHaveAttribute('aria-label');
      });
    });

    it('should truncate long filenames in alerts appropriately', async () => {
      const longFilename = 'this-is-a-very-long-filename-that-should-be-truncated-for-display-purposes.exe';
      const infectedFile = createInfectedAttachment(longFilename);
      await renderFileUploadWithAttachments([infectedFile]);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        // The full filename should be in the aria-label but truncated in display
        const alert = screen.getByRole('alert');
        expect(alert.getAttribute('aria-label')).toContain(longFilename);
      });
    });

    it('should display action message for infected files', async () => {
      const infectedFile = createInfectedAttachment('malware.exe');
      await renderFileUploadWithAttachments([infectedFile]);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        // Should show the action message
        expect(screen.getByText(/fjern filen/i)).toBeInTheDocument();
      });
    });
  });
});
