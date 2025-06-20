import { act, renderHook } from '@testing-library/react';

import { getAttachmentDataMock, getAttachmentMock } from 'src/__mocks__/getAttachmentsMock';
import { useInstancePolling } from 'src/features/instance/useInstancePolling';
import { useFileScanPolling } from 'src/layout/FileUpload/hooks/useFileScanPolling';
import type { FileUploaderNode, UploadedAttachment } from 'src/features/attachments';
import type { FileScanResult } from 'src/features/attachments/types';

// Mock the attachment hooks
const mockUseAttachmentsFor = jest.fn();
const mockStartPolling = jest.fn();
const mockStopPolling = jest.fn();

jest.mock('src/features/attachments/hooks', () => ({
  useAttachmentsFor: () => mockUseAttachmentsFor(),
}));

jest.mock('src/features/instance/useInstancePolling', () => ({
  useInstancePolling: jest.fn(() => ({
    startPolling: mockStartPolling,
    stopPolling: mockStopPolling,
  })),
}));

describe('FileScanFlow Integration Tests', () => {
  const mockNode = { id: 'fileUpload-test' } as FileUploaderNode;

  const createAttachmentWithScanResult = (scanResult: FileScanResult, filename = 'test-file.pdf'): UploadedAttachment =>
    getAttachmentMock({
      data: getAttachmentDataMock({
        fileScanResult: scanResult,
        filename,
      }),
      uploaded: true,
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useFileScanPolling hook behavior', () => {
    it('should start polling when there are pending scan results', () => {
      const pendingAttachment = createAttachmentWithScanResult('Pending', 'scanning.pdf');
      mockUseAttachmentsFor.mockReturnValue([pendingAttachment]);

      const { result } = renderHook(() => useFileScanPolling(mockNode));

      expect(mockStartPolling).toHaveBeenCalled();
      expect(mockStopPolling).not.toHaveBeenCalled();
      expect(result.current.isPolling).toBe(true);
      expect(result.current.hasPendingScans).toBe(true);
    });

    it('should stop polling when there are no pending scan results', () => {
      const cleanAttachment = createAttachmentWithScanResult('Clean', 'document.pdf');
      mockUseAttachmentsFor.mockReturnValue([cleanAttachment]);

      const { result } = renderHook(() => useFileScanPolling(mockNode));

      expect(mockStopPolling).toHaveBeenCalled();
      expect(mockStartPolling).not.toHaveBeenCalled();
      expect(result.current.isPolling).toBe(false);
      expect(result.current.hasPendingScans).toBe(false);
    });

    it('should stop polling when attachments change from pending to infected', () => {
      const pendingAttachment = createAttachmentWithScanResult('Pending', 'scanning.pdf');
      mockUseAttachmentsFor.mockReturnValue([pendingAttachment]);

      const { result, rerender } = renderHook(() => useFileScanPolling(mockNode));

      expect(result.current.isPolling).toBe(true);
      expect(mockStartPolling).toHaveBeenCalled();

      // Simulate scan completion with infected result
      const infectedAttachment = createAttachmentWithScanResult('Infected', 'scanning.pdf');
      mockUseAttachmentsFor.mockReturnValue([infectedAttachment]);

      act(() => {
        rerender();
      });

      expect(result.current.isPolling).toBe(false);
      expect(mockStopPolling).toHaveBeenCalled();
    });

    it('should stop polling when attachments change from pending to clean', () => {
      const pendingAttachment = createAttachmentWithScanResult('Pending', 'scanning.pdf');
      mockUseAttachmentsFor.mockReturnValue([pendingAttachment]);

      const { result, rerender } = renderHook(() => useFileScanPolling(mockNode));

      expect(result.current.isPolling).toBe(true);

      // Simulate scan completion with clean result
      const cleanAttachment = createAttachmentWithScanResult('Clean', 'scanning.pdf');
      mockUseAttachmentsFor.mockReturnValue([cleanAttachment]);

      act(() => {
        rerender();
      });

      expect(result.current.isPolling).toBe(false);
      expect(mockStopPolling).toHaveBeenCalled();
    });

    it('should handle multiple attachments with mixed scan results', () => {
      const cleanAttachment = createAttachmentWithScanResult('Clean', 'document.pdf');
      const pendingAttachment = createAttachmentWithScanResult('Pending', 'scanning.pdf');
      const infectedAttachment = createAttachmentWithScanResult('Infected', 'malware.exe');

      mockUseAttachmentsFor.mockReturnValue([cleanAttachment, pendingAttachment, infectedAttachment]);

      const { result } = renderHook(() => useFileScanPolling(mockNode));

      // Should poll because there's at least one pending attachment
      expect(result.current.isPolling).toBe(true);
      expect(result.current.hasPendingScans).toBe(true);
      expect(mockStartPolling).toHaveBeenCalled();
    });

    it('should not poll for NotApplicable scan results', () => {
      const notApplicableAttachment = createAttachmentWithScanResult('NotApplicable', 'config.txt');
      mockUseAttachmentsFor.mockReturnValue([notApplicableAttachment]);

      const { result } = renderHook(() => useFileScanPolling(mockNode));

      expect(result.current.isPolling).toBe(false);
      expect(result.current.hasPendingScans).toBe(false);
      expect(mockStopPolling).toHaveBeenCalled();
    });

    it('should handle empty attachments list', () => {
      mockUseAttachmentsFor.mockReturnValue([]);

      const { result } = renderHook(() => useFileScanPolling(mockNode));

      expect(result.current.isPolling).toBe(false);
      expect(result.current.hasPendingScans).toBe(false);
      expect(mockStopPolling).toHaveBeenCalled();
    });

    it('should handle non-uploaded attachments', () => {
      const nonUploadedAttachment = {
        uploaded: false,
        data: {
          temporaryId: 'temp-123',
          filename: 'uploading.pdf',
          size: 1024,
        },
        updating: false,
        deleting: false,
      };

      mockUseAttachmentsFor.mockReturnValue([nonUploadedAttachment]);

      const { result } = renderHook(() => useFileScanPolling(mockNode));

      expect(result.current.isPolling).toBe(false);
      expect(result.current.hasPendingScans).toBe(false);
      expect(mockStopPolling).toHaveBeenCalled();
    });
  });

  describe('File scan state transitions', () => {
    it('should handle upload -> pending -> clean workflow', () => {
      // Start with no attachments
      mockUseAttachmentsFor.mockReturnValue([]);
      const { result, rerender } = renderHook(() => useFileScanPolling(mockNode));

      expect(result.current.isPolling).toBe(false);

      // File uploaded and starts scanning
      const pendingAttachment = createAttachmentWithScanResult('Pending', 'document.pdf');
      mockUseAttachmentsFor.mockReturnValue([pendingAttachment]);

      act(() => {
        rerender();
      });

      expect(result.current.isPolling).toBe(true);
      expect(mockStartPolling).toHaveBeenCalled();

      // Scan completes as clean
      const cleanAttachment = createAttachmentWithScanResult('Clean', 'document.pdf');
      mockUseAttachmentsFor.mockReturnValue([cleanAttachment]);

      act(() => {
        rerender();
      });

      expect(result.current.isPolling).toBe(false);
      expect(mockStopPolling).toHaveBeenCalled();
    });

    it('should handle upload -> pending -> infected workflow', () => {
      // Start with uploaded file in pending state
      const pendingAttachment = createAttachmentWithScanResult('Pending', 'suspicious.exe');
      mockUseAttachmentsFor.mockReturnValue([pendingAttachment]);

      const { result, rerender } = renderHook(() => useFileScanPolling(mockNode));

      expect(result.current.isPolling).toBe(true);

      // Scan completes as infected
      const infectedAttachment = createAttachmentWithScanResult('Infected', 'suspicious.exe');
      mockUseAttachmentsFor.mockReturnValue([infectedAttachment]);

      act(() => {
        rerender();
      });

      expect(result.current.isPolling).toBe(false);
      expect(mockStopPolling).toHaveBeenCalled();
    });

    it('should continue polling if some files are still pending', () => {
      const cleanAttachment = createAttachmentWithScanResult('Clean', 'document.pdf');
      const pendingAttachment1 = createAttachmentWithScanResult('Pending', 'scanning1.pdf');
      const pendingAttachment2 = createAttachmentWithScanResult('Pending', 'scanning2.pdf');

      mockUseAttachmentsFor.mockReturnValue([cleanAttachment, pendingAttachment1, pendingAttachment2]);

      const { result, rerender } = renderHook(() => useFileScanPolling(mockNode));

      expect(result.current.isPolling).toBe(true);

      // One file completes scanning
      const cleanAttachment2 = createAttachmentWithScanResult('Clean', 'scanning1.pdf');
      mockUseAttachmentsFor.mockReturnValue([cleanAttachment, cleanAttachment2, pendingAttachment2]);

      act(() => {
        rerender();
      });

      // Should still be polling because one file is still pending
      expect(result.current.isPolling).toBe(true);
      expect(result.current.hasPendingScans).toBe(true);
    });
  });

  describe('Polling configuration', () => {
    it('should initialize polling with correct parameters', () => {
      mockUseAttachmentsFor.mockReturnValue([]);

      renderHook(() => useFileScanPolling(mockNode));

      // Check that useInstancePolling was called with correct config
      expect(useInstancePolling).toHaveBeenCalledWith({
        intervalMs: 5000,
        maxAttempts: 120,
      });
    });

    it('should cleanup polling on unmount', () => {
      const pendingAttachment = createAttachmentWithScanResult('Pending', 'scanning.pdf');
      mockUseAttachmentsFor.mockReturnValue([pendingAttachment]);

      const { unmount } = renderHook(() => useFileScanPolling(mockNode));

      unmount();

      expect(mockStopPolling).toHaveBeenCalled();
    });
  });
});
