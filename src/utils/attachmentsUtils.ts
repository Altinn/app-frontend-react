import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IUseLanguage } from 'src/hooks/useLanguage';
import type { IAttachmentGrouping, IData, IDataType, IDisplayAttachment } from 'src/types/shared';

export enum DataTypeReference {
  IncludeAll = 'include-all',
  RefDataAsPdf = 'ref-data-as-pdf',
}

export const filterInstanceAttachments = (
  data: IData[] | undefined,
  defaultElementIds: string[],
): IDisplayAttachment[] | undefined => {
  const filteredData = data?.filter(
    (dataElement: IData) =>
      !(defaultElementIds.includes(dataElement.dataType) || dataElement.dataType === DataTypeReference.RefDataAsPdf),
  );
  return getInstanceAttachments(filteredData);
};

export const filterInstancePdfAttachments = (data: IData[] | undefined): IDisplayAttachment[] | undefined => {
  const filteredData = data?.filter((dataElement: IData) => dataElement.dataType === DataTypeReference.RefDataAsPdf);
  return getInstanceAttachments(filteredData);
};

const getInstanceAttachments = (data: IData[] | undefined): IDisplayAttachment[] | undefined => {
  if (!data) {
    return undefined;
  }

  return data.map((dataElement: IData) => ({
    name: dataElement.filename,
    url: dataElement.selfLinks?.apps,
    iconClass: 'reg reg-attachment',
    dataType: dataElement.dataType,
  }));
};

/**
 * Gets the attachment groupings from a list of attachments.
 */
export const getAttachmentGroupings = (
  attachments: IDisplayAttachment[] | undefined,
  applicationMetadata: IApplicationMetadata | null,
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
  applicationMetadata: IApplicationMetadata,
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
