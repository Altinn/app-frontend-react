import React from 'react';

import { getLanguageFromKey } from 'src/language/sharedLanguage';
import classes from 'src/layout/FileUpload/shared/render.module.css';
import { getFileEnding, removeFileEnding } from 'src/utils/attachment';

interface IFileNameProps {
  fileName: string;
  url: string;
}

export const FileName = (props: IFileNameProps) => (
  <a
    href={props.url}
    className={classes.download}
  >
    <span className={classes.truncate}>{removeFileEnding(props.fileName)}</span>
    <span className={classes.test}>{getFileEnding(props.fileName)}</span>
  </a>
);

interface IAttachmentsCounterProps {
  language: any;
  currentNumberOfAttachments: number;
  minNumberOfAttachments: number;
  maxNumberOfAttachments: number;
}
export const AttachmentsCounter = ({
  language,
  currentNumberOfAttachments,
  minNumberOfAttachments,
  maxNumberOfAttachments,
}: IAttachmentsCounterProps) => (
  <div className='file-upload-text-bold-small'>
    {`${getLanguageFromKey('form_filler.file_uploader_number_of_files', language)} ${
      minNumberOfAttachments ? `${currentNumberOfAttachments}/${maxNumberOfAttachments}` : currentNumberOfAttachments
    }.`}
  </div>
);
