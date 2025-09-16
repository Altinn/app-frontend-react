import React from 'react';
import { useDropzone } from 'react-dropzone';
import type { HTMLAttributes } from 'react';
import type { FileRejection } from 'react-dropzone';

import cn from 'classnames';

import classes from 'src/app-components/Dropzone/Dropzone.module.css';
import { mapExtensionToAcceptMime } from 'src/app-components/Dropzone/mapExtensionToAcceptMime';
import { Lang } from 'src/features/language/Lang';

export type IDropzoneComponentProps = {
  id: string;
  maxFileSizeInMB?: number;
  readOnly: boolean;
  onClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onDrop: (acceptedFiles: File[], rejectedFiles: FileRejection[]) => void;
  hasValidationMessages: boolean;
  hasCustomFileEndings?: boolean;
  validFileEndings?: string | string[];
  labelId?: string;
  describedBy?: string;
  className?: string;
} & Pick<HTMLAttributes<HTMLDivElement>, 'children'>;

const bytesInOneMB = 1048576;

export function Dropzone({
  id,
  maxFileSizeInMB,
  readOnly,
  onClick,
  onDrop,
  hasValidationMessages,
  hasCustomFileEndings,
  validFileEndings,
  labelId,
  children,
  className,
  describedBy,
  ...rest
}: IDropzoneComponentProps): React.JSX.Element {
  const maxSizeLabelId = `file-upload-max-size-${id}`;
  const describedby = maxFileSizeInMB ? `${describedBy} ${maxSizeLabelId}` : describedBy;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxFileSizeInMB && maxFileSizeInMB * bytesInOneMB,
    disabled: readOnly,
    accept:
      hasCustomFileEndings && validFileEndings !== undefined ? mapExtensionToAcceptMime(validFileEndings) : undefined,
  });
  return (
    <div>
      {maxFileSizeInMB && (
        <div
          className={classes.fileUploadTextBoldSmall}
          id={maxSizeLabelId}
        >
          <Lang
            id='form_filler.file_uploader_max_size_mb'
            params={[maxFileSizeInMB]}
          />
        </div>
      )}

      <div
        {...getRootProps({
          onClick,
        })}
        id={`altinn-drop-zone-${id}`}
        className={cn(
          classes.fileUpload,
          { [classes.active]: isDragActive },
          { [classes.validationError]: hasValidationMessages },
          { [classes.fileUploadInvalid]: hasValidationMessages },
          className,
        )}
        aria-labelledby={labelId}
        aria-describedby={describedby}
        {...rest}
      >
        <input
          {...getInputProps()}
          id={id}
        />
        {children}
      </div>
    </div>
  );
}
