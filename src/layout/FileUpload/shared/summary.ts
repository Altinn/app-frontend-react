import type { IFormData } from 'src/features/form/data';
import type { IAttachments } from 'src/shared/resources/attachments';

export function extractListFromBinding(formData: IFormData, listBinding: string): string[] {
  return Object.keys(formData)
    .filter((key) => key.startsWith(listBinding))
    .map((key) => formData[key]);
}

export function attachmentNamesFromUuids(componentId: string, uuids: string[], attachments: IAttachments): string[] {
  if (!uuids.length) {
    return [];
  }

  return uuids
    .map((uuid) => {
      const attachmentsForComponent = attachments[componentId];
      if (attachmentsForComponent) {
        const foundAttachment = attachmentsForComponent.find((a) => a.id === uuid);
        if (foundAttachment && foundAttachment.name) {
          return foundAttachment.name;
        }
      }

      return '';
    })
    .filter((name) => name !== '');
}

export function attachmentNamesFromComponentId(componentId: string, attachments: IAttachments): string[] {
  const foundAttachments = attachments[componentId];
  if (foundAttachments) {
    return foundAttachments.map((a) => a.name).filter((name) => !!name) as string[];
  }

  return [];
}
