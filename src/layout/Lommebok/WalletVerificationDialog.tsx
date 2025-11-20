import React, { forwardRef, useEffect, useState } from 'react';

import { Dialog, Heading, List, Paragraph } from '@digdir/designsystemet-react';
import { useQuery } from '@tanstack/react-query';
import dot from 'dot-object';
import { QRCodeSVG } from 'qrcode.react';

import { Button } from 'src/app-components/Button/Button';
import { Panel } from 'src/app-components/Panel/Panel';
import { Lang } from 'src/features/language/Lang';
import { getDocumentClaims, getDocumentDisplayName, walletQueries } from 'src/layout/Lommebok/api';
import { DocumentDataPreview } from 'src/layout/Lommebok/DocumentDataPreview';
import { generateXsdFromWalletClaims } from 'src/layout/Lommebok/generateXsd';
import classes from 'src/layout/Lommebok/LommebokComponent.module.css';
import type { RequestedDocument } from 'src/layout/Lommebok/config.generated';

interface WalletVerificationDialogProps {
  doc: RequestedDocument;
  verificationId: string | null;
  authorizationUrl: string | null;
  pendingConfirmation: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
  onSaveData: (claims: Record<string, unknown>) => void;
  onClearVerification: () => void;
}

export const WalletVerificationDialog = forwardRef<HTMLDialogElement, WalletVerificationDialogProps>(
  (
    {
      doc,
      verificationId,
      authorizationUrl,
      pendingConfirmation,
      onConfirm,
      onCancel,
      onClose,
      onSaveData,
      onClearVerification,
    },
    ref,
  ) => {
    // Local state to preserve claims and failed status while dialog is open
    const [preservedClaims, setPreservedClaims] = useState<Record<string, unknown> | null>(null);
    const [preservedFailed, setPreservedFailed] = useState(false);

    const statusQuery = useQuery(walletQueries.status(verificationId));
    const resultQuery = useQuery({
      ...walletQueries.result(verificationId),
      enabled: statusQuery.data?.status === 'AVAILABLE' && !!verificationId,
    });

    // Preserve claims when they arrive
    useEffect(() => {
      if (resultQuery.data?.claims) {
        setPreservedClaims(resultQuery.data.claims);
      }
    }, [resultQuery.data?.claims]);

    // Preserve failed status when it arrives
    useEffect(() => {
      if (statusQuery.data?.status === 'FAILED') {
        setPreservedFailed(true);
      }
    }, [statusQuery.data?.status]);

    // Clear verification ID after fetching result when status is no longer PENDING
    useEffect(() => {
      const status = statusQuery.data?.status;
      if (status && status !== 'PENDING' && (resultQuery.data || status === 'FAILED')) {
        // Verification is complete (either success or failed), clear the ID
        onClearVerification();
      }
    }, [statusQuery.data?.status, resultQuery.data, onClearVerification, verificationId]);

    // Reset preserved state when dialog props change (new verification or closed)
    useEffect(() => {
      if (!verificationId && !authorizationUrl && !pendingConfirmation) {
        // Dialog is being closed/reset, clear preserved data
        setPreservedClaims(null);
        setPreservedFailed(false);
      }
    }, [verificationId, authorizationUrl, pendingConfirmation]);

    const hasFailed = preservedFailed;
    const hasClaims = !!preservedClaims;

    const handleDownloadXsdFromClaims = () => {
      if (!preservedClaims) {
        return;
      }

      const xsd = generateXsdFromWalletClaims(preservedClaims, doc.type);

      // Create blob and download
      const blob = new Blob([xsd], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.type.replace(/-/g, '')}.xsd`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const handleSave = () => {
      if (preservedClaims) {
        onSaveData(preservedClaims);
      }
    };

    const getDialogContent = () => {
      // Show confirmation screen before starting verification
      if (pendingConfirmation) {
        const dataFields = doc.data;
        return (
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
              <Heading
                level={3}
                data-size='sm'
              >
                {getDocumentDisplayName(doc.type)}
              </Heading>
              <Paragraph>
                <Lang id='wallet.confirm_claims_description' />
              </Paragraph>
              {dataFields && dataFields.length > 0 ? (
                <List.Unordered className={classes.claimsList}>
                  {dataFields.map((field, index) => (
                    <List.Item key={index}>{field.title}</List.Item>
                  ))}
                </List.Unordered>
              ) : (
                <List.Unordered className={classes.claimsList}>
                  {getDocumentClaims(doc.type).map((claim, index) => (
                    <List.Item key={index}>{claim.name}</List.Item>
                  ))}
                </List.Unordered>
              )}
            </Dialog.Block>
            <Dialog.Block>
              <div className={classes.dialogButtons}>
                <Button
                  onClick={onConfirm}
                  variant='primary'
                >
                  <Lang id='wallet.confirm_proceed' />
                </Button>
                <Button
                  onClick={onCancel}
                  variant='secondary'
                >
                  <Lang id='general.cancel' />
                </Button>
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
                  onClick={onClose}
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
      if (hasClaims && doc.saveToDataType) {
        // Get presentation fields from the configured data array
        const presentationFields =
          doc.data
            ?.map((mapping) => {
              const value = dot.pick(mapping.field, preservedClaims || {});

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
                <DocumentDataPreview fields={presentationFields} />
              ) : (
                <Paragraph>
                  <Lang id='wallet.no_configured_fields' />
                </Paragraph>
              )}
            </Dialog.Block>
            <Dialog.Block>
              <div className={classes.dialogButtons}>
                <Button
                  onClick={handleSave}
                  variant='primary'
                >
                  <Lang id='wallet.save_button' />
                </Button>
                <Button
                  onClick={onClose}
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
      if (hasClaims && !doc.saveToDataType) {
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
                {Object.entries(preservedClaims || {}).map(([key, value]) => (
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
                  onClick={onClose}
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
                  height={256}
                  width={256}
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
            </Dialog.Block>
            <Dialog.Block>
              <div className={classes.dialogButtons}>
                <Button
                  onClick={onClose}
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
      <Dialog
        ref={ref}
        modal
        closedby='any'
      >
        {getDialogContent()}
      </Dialog>
    );
  },
);

WalletVerificationDialog.displayName = 'WalletVerificationDialog';
