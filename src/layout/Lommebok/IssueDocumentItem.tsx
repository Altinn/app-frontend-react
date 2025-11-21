import React, { useRef } from 'react';

import { Details } from '@digdir/designsystemet-react';

import { Button } from 'src/app-components/Button/Button';
import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { useLayoutSetIdFromUrl } from 'src/features/form/layoutSets/useCurrentLayoutSet';
import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { getDocumentDisplayName } from 'src/layout/Lommebok/api';
import { WalletIssuanceDialog } from 'src/layout/Lommebok/WalletIssuanceDialog';
import type { IssuableDocument } from 'src/layout/Lommebok/config.generated';

interface IssueDocumentItemProps {
  doc: IssuableDocument;
}

export function IssueDocumentItem({ doc }: IssueDocumentItemProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Get the data type to use (default or configured)
  const layoutSide = useLayoutSetIdFromUrl();
  const defaultDataType = useDataTypeFromLayoutSet(layoutSide);
  const dataType = doc.urlDataType || defaultDataType || 'default';

  // Read the URL from the data model
  const selector = FD.useDebouncedSelector();
  const credentialUrl = selector({ dataType, field: doc.urlField });

  // Validation: check if URL exists and is valid
  const hasValidUrl = typeof credentialUrl === 'string' && credentialUrl.trim().length > 0;

  const handleIssueToWallet = () => {
    if (!hasValidUrl) {
      return;
    }
    dialogRef.current?.showModal();
  };

  const handleCloseDialog = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <Details defaultOpen>
        <Details.Summary>{getDocumentDisplayName(doc.type)}</Details.Summary>
        <Details.Content>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {!hasValidUrl && (
              <div
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#FEF3CD',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                <Lang id='wallet.issue_no_url' />
              </div>
            )}
            <div>
              <Button
                onClick={handleIssueToWallet}
                variant='primary'
                size='sm'
                disabled={!hasValidUrl}
              >
                <Lang id='wallet.issue_to_wallet' />
              </Button>
            </div>
          </div>
        </Details.Content>
      </Details>

      <WalletIssuanceDialog
        ref={dialogRef}
        doc={doc}
        credentialUrl={credentialUrl as string}
        onClose={handleCloseDialog}
      />
    </>
  );
}
