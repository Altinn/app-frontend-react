import React from 'react';

import { Alert, Button } from '@digdir/designsystemet-react';
import { Close } from '@navikt/ds-icons';
import { isAxiosError } from 'axios';

import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { type FileUploaderNode, type IFailedAttachment, isDataPostError } from 'src/features/attachments';
import { useDeleteFailedAttachment, useFailedAttachmentsFor } from 'src/features/attachments/hooks';
import { Lang } from 'src/features/language/Lang';
import { getValidationIssueMessage } from 'src/features/validation/backendValidation/backendValidationUtils';
import classes from 'src/layout/FileUpload/Error/FailedAttachments.module.css';
import { isRejectedFileError } from 'src/layout/FileUpload/RejectedFileError';

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
  return (
    <Alert
      size='sm'
      severity='danger'
      role='alert'
      aria-live='assertive'
      aria-label={attachment.data.filename}
    >
      <div className={classes.container}>
        <div className={classes.wrapper}>
          <span className={classes.title}>{attachment.data.filename}</span>
          <div className={classes.content}>
            <ErrorDetails error={attachment.error} />
          </div>
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

function ErrorDetails({ error }: { error: Error }) {
  const backendFeatures = useApplicationMetadata().features ?? {};
  if (isAxiosError(error)) {
    const reply = error.response?.data;
    const issues = isDataPostError(reply)
      ? reply.uploadValidationIssues
      : backendFeatures.jsonObjectInDataResponse && Array.isArray(reply) // This is the old API response
        ? reply
        : null;

    if (issues && issues.length === 1) {
      const { key, params } = getValidationIssueMessage(issues[0]);
      return (
        <Lang
          id={key}
          params={params}
        />
      );
    }
    if (issues && issues.length > 1) {
      const params = issues.map((issue) => getValidationIssueMessage(issue));
      const message = params.map((_, i) => `- {${i}}`).join('\n- ');
      return (
        <Lang
          id={message}
          params={params}
        />
      );
    }
  }

  if (isRejectedFileError(error)) {
    if (error.data.rejection.file.size > error.data.maxFileSizeInMB * bytesInOneMB) {
      return (
        <Lang
          id='form_filler.file_uploader_validation_error_file_size'
          params={[error.data.rejection.file.name]}
        />
      );
    } else {
      return (
        <Lang
          id='form_filler.file_uploader_validation_error_general'
          params={[error.data.rejection.file.name]}
        />
      );
    }
  }

  return <Lang id='form_filler.file_uploader_validation_error_upload' />;
}

const bytesInOneMB = 1048576;
