import React, { useRef, useState } from 'react';

import { Dialog, Heading, List, Paragraph } from '@digdir/designsystemet-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dot from 'dot-object';
import { QRCodeSVG } from 'qrcode.react';

import { Button } from 'src/app-components/Button/Button';
import { Spinner } from 'src/app-components/loading/Spinner/Spinner';
import { Panel } from 'src/app-components/Panel/Panel';
import { Description } from 'src/components/form/Description';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import {
  getDocumentClaims,
  getDocumentDisplayName,
  startWalletVerification,
  walletQueries,
} from 'src/layout/Lommebok/api';
import { DocumentListItem } from 'src/layout/Lommebok/DocumentListItem';
import { generateXsdFromWalletClaims } from 'src/layout/Lommebok/generateXsd';
import classes from 'src/layout/Lommebok/LommebokComponent.module.css';
import { PresentationValue } from 'src/layout/Lommebok/PresentationValue';
import { useSaveLommebokData, useUploadLommebokPdfMutation } from 'src/layout/Lommebok/useLommebokMutations';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { RequestedDocument } from 'src/layout/Lommebok/config.generated';

export function LommebokComponent(props: PropsFromGenericComponent<'Lommebok'>) {
  const { request, textResourceBindings } = useItemWhenType(props.baseComponentId, 'Lommebok');
  const { title, description } = textResourceBindings || {};
  const indexedId = useIndexedId(props.baseComponentId);
  const { langAsString } = useLanguage();
  const queryClient = useQueryClient();
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simplified local state - only track active dialogs and flows
  const [activeDocument, setActiveDocument] = useState<RequestedDocument['type'] | null>(null);
  const [pendingDocument, setPendingDocument] = useState<RequestedDocument['type'] | null>(null);
  const [pendingPdfUpload, setPendingPdfUpload] = useState<RequestedDocument['type'] | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const activeRequestDoc = request?.find((doc) => doc.type === activeDocument);

  const saveLommebokData = useSaveLommebokData(activeRequestDoc?.saveToDataType || 'default', activeRequestDoc?.data);
  const uploadPdfMutation = useUploadLommebokPdfMutation(
    request?.find((doc) => doc.type === pendingPdfUpload)?.alternativeUploadToDataType || 'default',
  );

  // Mutation to start verification
  const startMutation = useMutation({
    mutationKey: ['startWalletVerification'],
    mutationFn: (docType: RequestedDocument['type']) => startWalletVerification(docType),
    onSuccess: (data, docType) => {
      // Store verificationId in state and set active document
      setVerificationId(data.verifier_transaction_id);
      setActiveDocument(docType);
    },
    onError: (error) => {
      window.logError('Failed to start wallet verification:', error);
    },
  });

  const statusQuery = useQuery(walletQueries.status(verificationId));
  const resultQuery = useQuery({
    ...walletQueries.result(verificationId),
    enabled: statusQuery.data?.status === 'AVAILABLE' && !!verificationId,
  });

  // Handle confirmation dialog
  const handleRequestDocument = (docType: RequestedDocument['type']) => {
    setPendingDocument(docType);
    confirmDialogRef.current?.showModal();
  };

  const handleConfirmRequest = () => {
    if (pendingDocument) {
      startMutation.mutate(pendingDocument);
      setPendingDocument(null);
      // Don't close dialog - it will transition to QR/polling view
    }
  };

  const handleCancelRequest = () => {
    setPendingDocument(null);
    confirmDialogRef.current?.close();
  };

  // Handle cancel active verification
  const handleCancelVerification = () => {
    if (verificationId) {
      // Clean up queries for this verification
      queryClient.removeQueries({ queryKey: walletQueries.statusKey(verificationId) });
      queryClient.removeQueries({ queryKey: walletQueries.resultKey(verificationId) });
    }
    setActiveDocument(null);
    setVerificationId(null);
    confirmDialogRef.current?.close();
  };

  // Handle save wallet data
  const handleSaveData = async () => {
    if (!activeDocument || !resultQuery.data?.claims || !activeRequestDoc?.saveToDataType) {
      window.logWarn('[Lommebok] Missing required data for save', {
        activeDocument,
        hasClaims: !!resultQuery.data?.claims,
        saveToDataType: activeRequestDoc?.saveToDataType,
      });
      return;
    }

    saveLommebokData(resultQuery.data.claims);
    // Close dialog after successful save
    confirmDialogRef.current?.close();
    setActiveDocument(null);
    setVerificationId(null);
  };

  // Handle XSD download from wallet claims
  const handleDownloadXsdFromClaims = () => {
    if (!activeDocument || !resultQuery.data?.claims) {
      return;
    }

    const xsd = generateXsdFromWalletClaims(resultQuery.data.claims, activeDocument);

    // Create blob and download
    const blob = new Blob([xsd], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeDocument.replace(/-/g, '')}.xsd`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle alternative PDF upload
  const handleAlternativeUpload = (docType: RequestedDocument['type']) => {
    setPendingPdfUpload(docType);
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !pendingPdfUpload) {
      return;
    }

    // Validate it's a PDF
    if (file.type !== 'application/pdf') {
      alert(langAsString('wallet.pdf_only'));
      return;
    }

    await uploadPdfMutation.mutateAsync(file);
    setPendingPdfUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get dialog content based on state
  const getDialogContent = () => {
    if (!activeDocument) {
      return null;
    }

    const isPolling = statusQuery.isFetching;
    const hasFailed = statusQuery.data?.status === 'FAILED';
    const hasClaims = !!resultQuery.data?.claims;
    const authorizationUrl = startMutation.data?.authorization_request;

    // Show loading while starting
    if (startMutation.isPending) {
      return (
        <>
          <Dialog.Block>
            <Heading level={2}>
              <Lang id='wallet.starting_verification' />
            </Heading>
          </Dialog.Block>
          <Dialog.Block>
            <div className={classes.loadingContainer}>
              <Spinner aria-label={langAsString('general.loading')} />
            </div>
          </Dialog.Block>
        </>
      );
    }

    // Show error state
    if (hasFailed) {
      return (
        <>
          <Dialog.Block>
            <Heading level={2}>
              <Lang id='wallet.verification_failed' />
            </Heading>
          </Dialog.Block>
          <Dialog.Block>
            <Panel
              variant='error'
              showIcon
            >
              <Lang id='wallet.verification_failed' />
            </Panel>
          </Dialog.Block>
          <Dialog.Block>
            <div className={classes.dialogButtons}>
              <Button
                onClick={handleCancelVerification}
                variant='secondary'
              >
                <Lang id='general.close' />
              </Button>
            </div>
          </Dialog.Block>
        </>
      );
    }

    // Show claims with save button
    if (hasClaims && activeRequestDoc?.saveToDataType) {
      // Get presentation fields from the configured data array
      const presentationFields =
        activeRequestDoc.data
          ?.map((mapping) => {
            const value = dot.pick(mapping.field, resultQuery.data?.claims || {});

            if (value === undefined || value === null) {
              return null;
            }

            return {
              title: mapping.title,
              value,
              displayType: mapping.displayType,
            };
          })
          .filter((field): field is NonNullable<typeof field> => field !== null) || [];

      return (
        <>
          <Dialog.Block>
            <Heading level={2}>
              <Lang id='wallet.data_received_title' />
            </Heading>
            <Paragraph>
              <Lang id='wallet.data_received_description' />
            </Paragraph>
          </Dialog.Block>
          <Dialog.Block>
            {presentationFields.length > 0 ? (
              <div className={classes.dataPreview}>
                {presentationFields.map((field, index) => (
                  <div
                    key={index}
                    className={classes.dataPreviewItem}
                  >
                    <dt className={classes.dataPreviewLabel}>{field.title}</dt>
                    <dd className={classes.dataPreviewValue}>
                      <PresentationValue
                        value={field.value}
                        displayType={field.displayType}
                      />
                    </dd>
                  </div>
                ))}
              </div>
            ) : (
              <Paragraph>
                <Lang id='wallet.no_configured_fields' />
              </Paragraph>
            )}
          </Dialog.Block>
          <Dialog.Block>
            <div className={classes.dialogButtons}>
              <Button
                onClick={handleSaveData}
                variant='primary'
              >
                <Lang id='wallet.save_button' />
              </Button>
              <Button
                onClick={handleCancelVerification}
                variant='secondary'
              >
                <Lang id='general.cancel' />
              </Button>
            </div>
          </Dialog.Block>
        </>
      );
    }

    // Show claims with XSD download button (when no saveToDataType configured)
    if (hasClaims && !activeRequestDoc?.saveToDataType) {
      return (
        <>
          <Dialog.Block>
            <Heading level={2}>
              <Lang id='wallet.data_received_title' />
            </Heading>
          </Dialog.Block>
          <Dialog.Block>
            <Panel
              variant='success'
              showIcon
            >
              <Lang id='wallet.data_received_description' />
            </Panel>
            <Heading
              level={3}
              data-size='sm'
            >
              <Lang id='wallet.received_claims_title' />
            </Heading>
            <List.Unordered className={classes.claimsList}>
              {Object.entries(resultQuery.data?.claims || {}).map(([key, value]) => (
                <List.Item key={key}>
                  <strong>{key}:</strong> {JSON.stringify(value)}
                </List.Item>
              ))}
            </List.Unordered>
          </Dialog.Block>
          <Dialog.Block>
            <div className={classes.dialogButtons}>
              <Button
                onClick={handleDownloadXsdFromClaims}
                variant='primary'
              >
                Download XSD
              </Button>
              <Button
                onClick={handleCancelVerification}
                variant='secondary'
              >
                <Lang id='general.close' />
              </Button>
            </div>
          </Dialog.Block>
        </>
      );
    }

    // Show QR/polling state
    if (authorizationUrl) {
      return (
        <>
          <Dialog.Block>
            <Heading level={2}>
              <Lang id='wallet.verification_title' />
            </Heading>
          </Dialog.Block>
          <Dialog.Block>
            <Paragraph>
              <Lang id='wallet.verification_description' />
            </Paragraph>
            <div className={classes.qrContainer}>
              <QRCodeSVG
                value={authorizationUrl}
                size={256}
                level='M'
                includeMargin={true}
                className={classes.qrCode}
              />
            </div>
            <div className={classes.linkContainer}>
              <Button
                onClick={() => (window.location.href = authorizationUrl)}
                variant='primary'
              >
                <Lang id='wallet.open_wallet' />
              </Button>
            </div>
            {isPolling && (
              <div className={classes.pollingIndicator}>
                <Spinner
                  aria-label={langAsString('wallet.waiting_for_verification')}
                  data-size='sm'
                />
                <Lang id='wallet.waiting_for_verification' />
              </div>
            )}
          </Dialog.Block>
          <Dialog.Block>
            <div className={classes.dialogButtons}>
              <Button
                onClick={handleCancelVerification}
                variant='secondary'
              >
                <Lang id='wallet.cancel_request' />
              </Button>
            </div>
          </Dialog.Block>
        </>
      );
    }

    return null;
  };

  return (
    <div className={classes.container}>
      <Heading
        level={2}
        data-size='sm'
      >
        <Lang id={title} />
      </Heading>
      {description && (
        <Description
          description={<Lang id={description} />}
          componentId={indexedId}
        />
      )}
      <List.Unordered className={classes.documentList}>
        {request?.map((doc) => (
          <DocumentListItem
            key={doc.type}
            doc={doc}
            handleRequestDocument={handleRequestDocument}
            handleAlternativeUpload={handleAlternativeUpload}
          />
        ))}
      </List.Unordered>

      {/* Dialog for confirmation and QR/polling */}
      <Dialog
        ref={confirmDialogRef}
        modal
        closedby='any'
      >
        {activeDocument ? (
          // Show QR/polling content if verification has started
          getDialogContent()
        ) : (
          // Show confirmation content if no active verification
          <>
            <Dialog.Block>
              <Heading level={2}>
                <Lang id='wallet.confirm_request_title' />
              </Heading>
            </Dialog.Block>
            <Dialog.Block>
              <Paragraph>
                <Lang id='wallet.confirm_request_description' />
              </Paragraph>
              {pendingDocument && (
                <>
                  <Heading
                    level={3}
                    data-size='sm'
                  >
                    {getDocumentDisplayName(pendingDocument)}
                  </Heading>
                  <Paragraph>
                    <Lang id='wallet.confirm_claims_description' />
                  </Paragraph>
                  {(() => {
                    const pendingRequestDoc = request?.find((doc) => doc.type === pendingDocument);
                    const dataFields = pendingRequestDoc?.data;

                    if (dataFields && dataFields.length > 0) {
                      // Show configured data fields
                      return (
                        <List.Unordered className={classes.claimsList}>
                          {dataFields.map((field, index) => (
                            <List.Item key={index}>{field.title}</List.Item>
                          ))}
                        </List.Unordered>
                      );
                    } else {
                      // Fallback to showing all claims from the credential type
                      return (
                        <List.Unordered className={classes.claimsList}>
                          {getDocumentClaims(pendingDocument).map((claim, index) => (
                            <List.Item key={index}>{claim.name}</List.Item>
                          ))}
                        </List.Unordered>
                      );
                    }
                  })()}
                </>
              )}
            </Dialog.Block>
            <Dialog.Block>
              <div className={classes.dialogButtons}>
                <Button
                  onClick={handleConfirmRequest}
                  variant='primary'
                >
                  <Lang id='wallet.confirm_proceed' />
                </Button>
                <Button
                  onClick={handleCancelRequest}
                  variant='secondary'
                >
                  <Lang id='general.cancel' />
                </Button>
              </div>
            </Dialog.Block>
          </>
        )}
      </Dialog>

      {/* Hidden file input for PDF upload */}
      <input
        ref={fileInputRef}
        type='file'
        accept='application/pdf'
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />
    </div>
  );
}
