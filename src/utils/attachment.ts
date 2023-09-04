import { deleteGroupData } from 'src/utils/databindings';
import { splitDashedKey } from 'src/utils/formLayout';
import type { IAttachments } from 'src/features/attachments';
import type { CompExternal } from 'src/layout/layout';

export function getFileEnding(filename: string | undefined): string {
  if (!filename) {
    return '';
  }
  const split: string[] = filename.split('.');
  if (split.length === 1) {
    return '';
  }
  return `.${split[split.length - 1]}`;
}

export function removeFileEnding(filename: string | undefined): string {
  if (!filename) {
    return '';
  }
  const split: string[] = filename.split('.');
  if (split.length === 1) {
    return filename;
  }
  return filename.replace(`.${split[split.length - 1]}`, '');
}

/**
 * When removing a row in a repeating group, this function shifts attachments bound to later rows upwards. Pass in the
 * groupId and index for the row being deleted.
 */
export function shiftAttachmentRowInRepeatingGroup(
  attachments: IAttachments,
  uploaderComponents: CompExternal[],
  groupId: string,
  index: number,
): IAttachments {
  const result = { ...attachments };
  const splitId = splitDashedKey(groupId);
  const lookForComponents = new Set(uploaderComponents.map((c) => c.id));

  let lastIndex = -1;
  for (const key of Object.keys(attachments)) {
    const thisSplitId = splitDashedKey(key);
    if (lookForComponents.has(thisSplitId.baseComponentId)) {
      lastIndex = Math.max(lastIndex, thisSplitId.depth[splitId.depth.length] || -1);
    }
  }

  for (let laterIdx = index + 1; laterIdx <= lastIndex; laterIdx++) {
    for (const componentId of lookForComponents) {
      deleteGroupData(result, componentId + splitId.stringDepthWithLeadingDash, laterIdx, false, true);
    }
  }

  return result;
}

export const AsciiUnitSeparator = String.fromCharCode(31); // Used to separate units within a string.
