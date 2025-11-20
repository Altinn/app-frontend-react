import React, { forwardRef } from 'react';

import { Dialog, Heading, Paragraph } from '@digdir/designsystemet-react';
import { QRCodeSVG } from 'qrcode.react';

import { Button } from 'src/app-components/Button/Button';
import { Lang } from 'src/features/language/Lang';
import { getDocumentDisplayName } from 'src/layout/Lommebok/api';
import classes from 'src/layout/Lommebok/LommebokComponent.module.css';
import type { IssuableDocument } from 'src/layout/Lommebok/config.generated';

interface WalletIssuanceDialogProps {
  doc: IssuableDocument;
  credentialUrl: string;
  onClose: () => void;
}

export const WalletIssuanceDialog = forwardRef<HTMLDialogElement, WalletIssuanceDialogProps>(
  ({ doc, credentialUrl, onClose }, ref) => {
    const handleOpenWallet = () => {
      window.location.href = credentialUrl;
    };

    return (
      <Dialog
        ref={ref}
        modal
        closedby='any'
      >
        <Dialog.Block>
          <Heading level={2}>
            <Lang id='wallet.issue_title' />
          </Heading>
        </Dialog.Block>
        <Dialog.Block>
          <Paragraph>
            <Lang
              id='wallet.issue_description'
              params={[getDocumentDisplayName(doc.type)]}
            />
          </Paragraph>
          <div className={classes.qrContainer}>
            <QRCodeSVG
              value={credentialUrl}
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
              onClick={handleOpenWallet}
              variant='primary'
            >
              <Lang id='wallet.open_wallet_accept' />
            </Button>
          </div>
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
      </Dialog>
    );
  },
);

WalletIssuanceDialog.displayName = 'WalletIssuanceDialog';
