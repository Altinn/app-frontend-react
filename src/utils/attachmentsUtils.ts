import type { ApplicationMetadata } from 'src/features/applicationMetadata/types';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { IAttachmentGrouping, IData, IDataType, IDisplayAttachment } from 'src/types/shared';

export enum DataTypeReference {
  IncludeAll = 'include-all',
  RefDataAsPdf = 'ref-data-as-pdf',
  FromTask = 'from-task',
}

export const filterDisplayAttachments = ({
  data,
  applicationMetadata,
}: {
  data: IData[];
  applicationMetadata: ApplicationMetadata;
}): IDisplayAttachment[] => {
  const excludeDataTypes = applicationMetadata.dataTypes
    .filter((dataType) => {
      if (dataType.appLogic) {
        return true;
      }

      return !!dataType.allowedContributers?.some((it) => it === 'app:owned');
    })
    .map((type) => type.id);

  const filteredData = data.filter(
    (el) => el.dataType !== DataTypeReference.RefDataAsPdf && !excludeDataTypes.includes(el.dataType),
  );

  return toDisplayAttachments(filteredData);
};

export const filterDisplayPdfAttachments = (data: IData[]) =>
  toDisplayAttachments(data.filter((el) => el.dataType === DataTypeReference.RefDataAsPdf));

export const toDisplayAttachments = (data: IData[]): IDisplayAttachment[] =>
  data.map((dataElement: IData) => ({
    name: dataElement.filename,
    url: dataElement.selfLinks?.apps,
    iconClass: 'reg reg-attachment',
    dataType: dataElement.dataType,
  }));

/**
 * Gets the attachment groupings from a list of attachments.
 */
export const getAttachmentGroupings = (
  attachments: IDisplayAttachment[] | undefined,
  applicationMetadata: ApplicationMetadata | null,
  langTools: IUseLanguage,
): IAttachmentGrouping => {
  const attachmentGroupings: IAttachmentGrouping = {};

  if (!attachments || !applicationMetadata) {
    return attachmentGroupings;
  }

  attachments.forEach((attachment: IDisplayAttachment) => {
    const grouping = getGroupingForAttachment(attachment, applicationMetadata);
    const title = langTools.langAsString(grouping);
    if (!attachmentGroupings[title]) {
      attachmentGroupings[title] = [];
    }
    attachmentGroupings[title].push(attachment);
  });

  return attachmentGroupings;
};

/**
 * Gets the grouping for a specific attachment
 * @param attachment the attachment
 * @param applicationMetadata the application metadata
 */
export const getGroupingForAttachment = (
  attachment: IDisplayAttachment,
  applicationMetadata: ApplicationMetadata,
): string => {
  if (!applicationMetadata || !applicationMetadata.dataTypes || !attachment) {
    return 'null';
  }

  const attachmentType = applicationMetadata.dataTypes.find(
    (dataType: IDataType) => dataType.id === attachment.dataType,
  );

  if (!attachmentType || !attachmentType.grouping) {
    return 'null';
  }

  return attachmentType.grouping;
};

export function getFileContentType(file: File): string {
  if (!file.type) {
    return 'application/octet-stream';
  } else if (file.name.toLowerCase().endsWith('.csv')) {
    return 'text/csv';
  }
  return file.type;
}

export function getSizeWithUnit(bytes: number, numberOfDecimals: number = 0): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(numberOfDecimals)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(numberOfDecimals)} MB`;
}
