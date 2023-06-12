import type { FileRejection } from 'react-dropzone';

import type { IUseLanguage } from 'src/hooks/useLanguage';

const bytesInOneMB = 1048576;

interface Args {
  langTools: IUseLanguage;
  rejectedFiles: FileRejection[];
  maxFileSizeInMB: number;
}

export function handleRejectedFiles({ language, rejectedFiles, maxFileSizeInMB }: Args): string[] {
  return rejectedFiles.length > 0
    ? rejectedFiles.map((fileRejection) => {
        if (fileRejection.file.size > maxFileSizeInMB * bytesInOneMB) {
          return `${fileRejection.file.name} ${getLanguageFromKey(
            'form_filler.file_uploader_validation_error_file_size',
            language,
          )}`;
        } else {
          return `${getLanguageFromKey('form_filler.file_uploader_validation_error_general_1', language)} ${
            fileRejection.file.name
          } ${getLanguageFromKey('form_filler.file_uploader_validation_error_general_2', language)}`;
        }
      })
    : [];
}
