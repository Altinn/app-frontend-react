import React from 'react';

import { Alert, Button } from '@digdir/designsystemet-react';
import { Close } from '@navikt/ds-icons';

import { useDeleteFailedAttachment, useFailedAttachmentsFor } from 'src/features/attachments/hooks';
import classes from 'src/layout/FileUpload/Error/FailedAttachments.module.css';
import type { FileUploaderNode, IFailedAttachment } from 'src/features/attachments';

export function FailedAttachments({ node }: { node: FileUploaderNode }) {
  const failedAttachments = useFailedAttachmentsFor(node);
  const deleteFailedAttachment = useDeleteFailedAttachment();

  return failedAttachments.length > 0 ? (
    <div className={classes.list}>
      {failedAttachments.map((attachment) => (
        <FileUploadError
          key={attachment.data.temporaryId}
          attachment={attachment}
          handleClose={() => deleteFailedAttachment(node, attachment.data.temporaryId)}
        />
      ))}
    </div>
  ) : null;
}

function FileUploadError({ attachment, handleClose }: { attachment: IFailedAttachment; handleClose: () => void }) {
  const fileName = attachment.data.filename;
  const errorMessage = typeof attachment.error === 'string' ? attachment.error : attachment.error.message;

  return (
    <Alert
      size='sm'
      severity='danger'
      role='alert'
      aria-live='assertive'
      //TODO: better label
      aria-label={fileName}
    >
      <div className={classes.container}>
        <div className={classes.wrapper}>
          <span className={classes.title}>{fileName}</span>
          <div className={classes.content}>{errorMessage}</div>
        </div>
        <Button
          className={classes.closeButton}
          variant='tertiary'
          color='second'
          onClick={handleClose}
        >
          <Close
            fontSize='1rem'
            aria-hidden='true'
          />
        </Button>
      </div>
    </Alert>
  );
}
