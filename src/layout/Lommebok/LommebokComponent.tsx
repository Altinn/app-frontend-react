import React, { useEffect, useRef, useState } from 'react';

import { Dialog, Heading, List, Paragraph, Tag } from '@digdir/designsystemet-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';

import { Button } from 'src/app-components/Button/Button';
import { Spinner } from 'src/app-components/loading/Spinner/Spinner';
import { Panel } from 'src/app-components/Panel/Panel';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import {
  fetchWalletResult,
  getDocumentClaims,
  getDocumentDisplayName,
  startWalletVerification,
  type VerificationResultResponse,
  walletQueries,
} from 'src/layout/Lommebok/api';
import classes from 'src/layout/Lommebok/LommebokComponent.module.css';
import { useExternalItem } from 'src/utils/layout/hooks';
import type { PropsFromGenericComponent } from 'src/layout';
import type { RequestedDocument } from 'src/layout/Lommebok/config.generated';

// State per document type
interface DocumentState {
  verificationId: string | null;
  authorizationUrl: string | null;
  claims: VerificationResultResponse['claims'] | null;
  error: boolean;
}

export function LommebokComponent(props: PropsFromGenericComponent<'Lommebok'>) {
  const { request } = useExternalItem(props.baseComponentId, 'Lommebok');
  const { langAsString } = useLanguage();
  const queryClient = useQueryClient();
  const confirmDialogRef = useRef<HTMLDialogElement>(null);

  // Track state for each document type
  const [documentStates, setDocumentStates] = useState<Record<string, DocumentState>>({});
  const [activeDocument, setActiveDocument] = useState<RequestedDocument['type'] | null>(null);
  const [pendingDocument, setPendingDocument] = useState<RequestedDocument['type'] | null>(null);

  // Get active document state
  const activeState = activeDocument ? documentStates[activeDocument] : null;

  // Mutation to start verification
  const startMutation = useMutation({
    mutationKey: ['startWalletVerification', activeDocument],
    mutationFn: (docType: RequestedDocument['type']) => startWalletVerification(docType),
    onSuccess: (data, docType) => {
      setDocumentStates((prev) => ({
        ...prev,
        [docType]: {
          verificationId: data.verifier_transaction_id,
          authorizationUrl: data.authorization_request,
          claims: null,
          error: false,
        },
      }));
      setActiveDocument(docType);
    },
    onError: (error, docType) => {
      window.logError('Failed to start wallet verification:', error);
      setDocumentStates((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          error: true,
        },
      }));
    },
  });

  // Query to poll status for active document
  const statusQuery = useQuery(walletQueries.status(activeState?.verificationId ?? null));

  // Fetch result when status becomes AVAILABLE
  useEffect(() => {
    const fetchResult = async () => {
      if (
        statusQuery.data?.status === 'AVAILABLE' &&
        activeDocument &&
        activeState?.verificationId &&
        !activeState.claims
      ) {
        try {
          const result = await fetchWalletResult(activeState.verificationId);
          if (result.claims) {
            setDocumentStates((prev) => ({
              ...prev,
              [activeDocument]: {
                ...prev[activeDocument],
                claims: result.claims,
              },
            }));
          }
        } catch (error) {
          window.logError('Failed to fetch wallet result:', error);
        }
      }
    };

    void fetchResult();
  }, [statusQuery.data?.status, activeDocument, activeState]);

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
    if (activeDocument) {
      setDocumentStates((prev) => {
        const newState = { ...prev };
        delete newState[activeDocument];
        return newState;
      });
      queryClient.removeQueries({ queryKey: walletQueries.statusKey(activeState?.verificationId ?? null) });
      setActiveDocument(null);
      confirmDialogRef.current?.close();
    }
  };

  // Get dialog content based on state
  const getDialogContent = () => {
    if (!activeDocument) {
      return null;
    }

    const isPolling = statusQuery.isFetching;
    const hasFailed = statusQuery.data?.status === 'FAILED';

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

    // Show QR/polling state
    if (activeState?.authorizationUrl) {
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
                value={activeState.authorizationUrl}
                size={256}
                level='M'
                includeMargin={true}
                className={classes.qrCode}
              />
            </div>
            <div className={classes.linkContainer}>
              <Button
                onClick={() => (window.location.href = activeState?.authorizationUrl || '')}
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

  // Close dialog when claims are successfully retrieved
  useEffect(() => {
    if (activeState?.claims && confirmDialogRef.current?.open) {
      confirmDialogRef.current.close();
      setActiveDocument(null);
    }
  }, [activeState?.claims]);

  // Render document list
  return (
    <div className={classes.container}>
      <Heading
        level={2}
        data-size='md'
      >
        <Lang id='wallet.request_title' />
      </Heading>
      <Paragraph>
        <Lang id='wallet.request_description' />
      </Paragraph>

      <List.Unordered className={classes.documentList}>
        {request?.map((doc) => {
          const docState = documentStates[doc.type];
          const hasSuccess = !!docState?.claims;
          const hasError = !!docState?.error;

          return (
            <List.Item
              key={doc.type}
              className={classes.documentListItem}
            >
              <div className={classes.documentItemContent}>
                <div className={classes.documentInfo}>
                  <span className={classes.documentName}>{getDocumentDisplayName(doc.type)}</span>
                </div>
                {hasSuccess ? (
                  <Tag
                    data-color='success'
                    data-size='sm'
                  >
                    <Lang id='wallet.document_received' />
                  </Tag>
                ) : hasError ? (
                  <Tag
                    data-color='danger'
                    data-size='sm'
                  >
                    <Lang id='wallet.start_failed' />
                  </Tag>
                ) : (
                  <Button
                    onClick={() => handleRequestDocument(doc.type)}
                    variant='primary'
                    size='sm'
                  >
                    <Lang id='wallet.request_document' />
                  </Button>
                )}
              </div>
            </List.Item>
          );
        })}
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
                  <List.Unordered className={classes.claimsList}>
                    {getDocumentClaims(pendingDocument).map((claim, index) => (
                      <List.Item key={index}>{claim.name}</List.Item>
                    ))}
                  </List.Unordered>
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
    </div>
  );
}
