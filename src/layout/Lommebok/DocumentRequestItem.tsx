import React, { useRef, useState } from 'react';

import { Details } from '@digdir/designsystemet-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { getDocumentDisplayName, startWalletVerification, walletQueries } from 'src/layout/Lommebok/api';
import { SavedDocumentFields } from 'src/layout/Lommebok/SavedDocumentFields';
import { useDocumentSavedStatus } from 'src/layout/Lommebok/useDocumentSavedStatus';
import {
  useResetDocumentData,
  useSaveLommebokData,
  useUploadLommebokPdfMutation,
} from 'src/layout/Lommebok/useLommebokMutations';
import { WalletVerificationDialog } from 'src/layout/Lommebok/WalletVerificationDialog';
import type { RequestedDocument } from 'src/layout/Lommebok/config.generated';

interface DocumentRequestItemProps {
  doc: RequestedDocument;
}

export function DocumentRequestItem({ doc }: DocumentRequestItemProps) {
  const { langAsString } = useLanguage();
  const queryClient = useQueryClient();
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingWalletRequest, setPendingWalletRequest] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null);

  const hasSaved = useDocumentSavedStatus(doc);
  const saveLommebokData = useSaveLommebokData(doc.saveToDataType || 'default', doc.data);
  const uploadPdfMutation = useUploadLommebokPdfMutation(doc.alternativeUploadToDataType || 'default');
  const resetDocumentMutation = useResetDocumentData(doc);

  // Start verification mutation
  const startMutation = useMutation({
    mutationKey: ['startWalletVerification', doc.type],
    mutationFn: () => startWalletVerification(doc.type),
    onSuccess: (data) => {
      setVerificationId(data.verifier_transaction_id);
      setAuthorizationUrl(data.authorization_request);
      setPendingWalletRequest(false);
    },
    onError: (error) => {
      window.logError('Failed to start wallet verification:', error);
      setPendingWalletRequest(false);
    },
  });

  const handleRequestFromWallet = () => {
    setPendingWalletRequest(true);
    confirmDialogRef.current?.showModal();
  };

  const handleConfirmRequest = () => {
    startMutation.mutate();
  };

  const handleCancelRequest = () => {
    setPendingWalletRequest(false);
    confirmDialogRef.current?.close();
  };

  const handleUploadPdf = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate it's a PDF
    if (file.type !== 'application/pdf') {
      alert(langAsString('wallet.pdf_only'));
      return;
    }

    await uploadPdfMutation.mutateAsync(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseVerification = () => {
    if (verificationId) {
      // Clean up queries for this verification
      queryClient.removeQueries({ queryKey: walletQueries.statusKey(verificationId) });
      queryClient.removeQueries({ queryKey: walletQueries.resultKey(verificationId) });
    }
    setVerificationId(null);
    setAuthorizationUrl(null);
    confirmDialogRef.current?.close();
  };

  const handleSaveData = (claims: Record<string, unknown>) => {
    saveLommebokData(claims);
    handleCloseVerification();
  };

  const handleResetData = async () => {
    await resetDocumentMutation.mutateAsync();
  };

  const handleClearVerification = () => {
    if (verificationId) {
      // Clean up queries for this verification
      queryClient.removeQueries({ queryKey: walletQueries.statusKey(verificationId) });
      queryClient.removeQueries({ queryKey: walletQueries.resultKey(verificationId) });
      setVerificationId(null);
      // Don't clear authorizationUrl here - we need to keep it so the dialog can still show the claims
      // It will be cleared when the dialog is actually closed via handleCloseVerification
    }
  };

  return (
    <>
      <Details defaultOpen>
        <Details.Summary>{getDocumentDisplayName(doc.type)}</Details.Summary>
        <Details.Content>
          {hasSaved ? (
            <>
              <SavedDocumentFields doc={doc} />
              <div style={{ marginTop: '1rem' }}>
                <Button
                  onClick={handleResetData}
                  variant='secondary'
                  size='sm'
                  color='danger'
                  disabled={resetDocumentMutation.isPending}
                >
                  <Lang id='wallet.remove_data' />
                </Button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                onClick={handleRequestFromWallet}
                variant='primary'
                size='sm'
                disabled={startMutation.isPending}
              >
                <Lang id='wallet.request_document' />
              </Button>
              {doc.alternativeUploadToDataType && (
                <>
                  <span>
                    <Lang id='general.or' />
                  </span>
                  <Button
                    onClick={handleUploadPdf}
                    variant='secondary'
                    size='sm'
                    disabled={uploadPdfMutation.isPending}
                  >
                    <Lang id='wallet.upload_document' />
                  </Button>
                </>
              )}
            </div>
          )}
        </Details.Content>
      </Details>

      <WalletVerificationDialog
        ref={confirmDialogRef}
        doc={doc}
        verificationId={verificationId}
        authorizationUrl={authorizationUrl}
        pendingConfirmation={pendingWalletRequest}
        onConfirm={handleConfirmRequest}
        onCancel={handleCancelRequest}
        onClose={handleCloseVerification}
        onSaveData={handleSaveData}
        onClearVerification={handleClearVerification}
      />

      {/* Hidden file input for PDF upload */}
      <input
        ref={fileInputRef}
        type='file'
        accept='application/pdf'
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />
    </>
  );
}
