import type { IData } from 'altinn-shared/types';
import type { IAttachments } from '../shared/resources/attachments';
import type { IFormData } from 'src/features/form/data/formDataReducer';

export function mapAttachmentListToAttachments(
  data: IData[],
  defaultElementId: string,
  formData: IFormData,
): IAttachments {
  const attachments: IAttachments = {};

  data.forEach((element: IData) => {
    const baseComponentId = element.dataType;
    if (
      element.id === defaultElementId ||
      baseComponentId === 'ref-data-as-pdf'
    ) {
      return;
    }

    let [key, index] = convertToComponentId(
      baseComponentId,
      formData,
      element.id,
    );

    if (!key) {
      key = baseComponentId;
      index = attachments[key]?.length || 0;
    }

    if (!attachments[key]) {
      attachments[key] = [];
    }

    attachments[key][index] = {
      uploaded: true,
      deleting: false,
      updating: false,
      name: element.filename,
      size: element.size,
      tags: element.tags,
      id: element.id,
    };
  });

  return attachments;
}

function convertToComponentId(
  baseComponentId: string,
  formData: IFormData,
  attachmentId: string,
): [string, number] {
  const formDataKey = Object.keys(formData).find(
    (key) => formData[key] === attachmentId,
  );

  if (!formDataKey) {
    return ['', 0];
  }

  const groups = formDataKey
    .match(/\[\d+]/g)
    .map((s) => parseInt(s.replace('[', '').replace(']', '')));
  const componentId = `${baseComponentId}-${groups
    .slice(0, groups.length - 1)
    .join('-')}`;
  const index = groups[groups.length - 1];

  return [componentId, index];
}

export function getFileEnding(filename: string): string {
  if (!filename) {
    return '';
  }
  const split: string[] = filename.split('.');
  if (split.length === 1) {
    return '';
  }
  return `.${split[split.length - 1]}`;
}

export function removeFileEnding(filename: string): string {
  if (!filename) {
    return '';
  }
  const split: string[] = filename.split('.');
  if (split.length === 1) {
    return filename;
  }
  return filename.replace(`.${split[split.length - 1]}`, '');
}

export const AsciiUnitSeparator = String.fromCharCode(31); // Used to separate units within a string.
