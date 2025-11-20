import React from 'react';

import { Link } from '@digdir/designsystemet-react';

import { useLaxInstanceId } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { FileExtensionIcon } from 'src/layout/FileUpload/FileUploadTable/AttachmentFileName';
import { getFileEnding } from 'src/layout/FileUpload/utils/fileEndings';
import classes from 'src/layout/Lommebok/UploadedFileDisplay.module.css';
import { getSizeWithUnit } from 'src/utils/attachmentsUtils';
import { getDataElementUrl } from 'src/utils/urls/appUrlHelper';
import { makeUrlRelativeIfSameDomain } from 'src/utils/urls/urlHelper';
import type { IData } from 'src/types/shared';

interface UploadedFileDisplayProps {
  dataElement: IData;
}

/**
 * Component to display an uploaded file with icon, name, size, and download link
 */
export function UploadedFileDisplay({ dataElement }: UploadedFileDisplayProps) {
  const language = useCurrentLanguage();
  const instanceId = useLaxInstanceId();
  const fileEnding = getFileEnding(dataElement.filename);

  const downloadUrl = instanceId
    ? makeUrlRelativeIfSameDomain(getDataElementUrl(instanceId, dataElement.id, language))
    : undefined;

  return (
    <div className={classes.container}>
      <div className={classes.fileInfo}>
        <div className={classes.fileHeader}>
          <FileExtensionIcon
            fileEnding={fileEnding}
            className={classes.icon}
          />
          <div className={classes.fileDetails}>
            {downloadUrl ? (
              <Link
                href={downloadUrl}
                className={classes.fileName}
                data-testid='lommebok-file-download'
              >
                {dataElement.filename}
              </Link>
            ) : (
              <span className={classes.fileName}>{dataElement.filename}</span>
            )}
            <span className={classes.fileSize}>{getSizeWithUnit(dataElement.size)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
