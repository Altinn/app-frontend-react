import type { IData } from 'altinn-shared/types';
import type { IAttachments } from '../shared/resources/attachments';
import type { IFormData } from 'src/features/form/data/formDataReducer';
import { getKeyIndex } from "src/utils/databindings";
import { ILayouts, ILayoutComponent, ILayoutGroup } from "src/features/form/layout";
import { isFileUploadComponent, isFileUploadWithTagComponent } from "src/utils/formLayout";

export function mapAttachmentListToAttachments(
  data: IData[],
  defaultElementId: string,
  formData: IFormData,
  layouts: ILayouts
): IAttachments {
  const attachments: IAttachments = {};
  const allComponents = [].concat(...Object.values(layouts)) as (ILayoutComponent | ILayoutGroup)[];

  data.forEach((element: IData) => {
    const baseComponentId = element.dataType;
    if (
      element.id === defaultElementId ||
      baseComponentId === 'ref-data-as-pdf'
    ) {
      return;
    }

    const component = allComponents.find((c) => c.id === baseComponentId);
    if (!component || (!isFileUploadComponent(component) && !isFileUploadWithTagComponent(component))) {
      return;
    }

    let [key, index] = convertToDashedComponentId(
      baseComponentId,
      formData,
      element.id,
      component.maxNumberOfAttachments > 1,
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

function convertToDashedComponentId(
  baseComponentId: string,
  formData: IFormData,
  attachmentUuid: string,
  hasIndex:boolean,
): [string, number] {
  const formDataKey = Object.keys(formData).find(
    (key) => formData[key] === attachmentUuid,
  );

  if (!formDataKey) {
    return ['', 0];
  }

  const groups = getKeyIndex(formDataKey);
  let componentId: string;
  let index:number;
  if (hasIndex) {
    const groupSuffix =
      groups.length > 1 ? `-${groups.slice(0, groups.length - 1).join('-')}` : '';

    componentId = `${baseComponentId}${groupSuffix}`;
    index = groups[groups.length - 1];
  } else {
    const groupSuffix =
      groups.length ? `-${groups.join('-')}` : '';

    componentId = `${baseComponentId}${groupSuffix}`;
    index = 0;
  }

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
