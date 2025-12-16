import { isAttachmentUploaded } from 'src/features/attachments';
import { useInstanceDataElements, useLaxInstanceId } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { getDataElementUrl } from 'src/utils/urls/appUrlHelper';
import { makeUrlRelativeIfSameDomain } from 'src/utils/urls/urlHelper';
import type { IAttachment } from 'src/features/attachments';

export function useThumbnailLink(attachment: IAttachment): string {
  const dataElements = useInstanceDataElements(undefined);
  const instanceId = useLaxInstanceId();
  const language = useCurrentLanguage();

  if (!isAttachmentUploaded(attachment)) {
    return '';
  }

  const thumbnailLink = attachment.data.metadata?.find((meta) => meta.key === 'thumbnailLink')?.value ?? null;

  if (!thumbnailLink) {
    return '';
  }

  const thumbnailDataElement = dataElements.find(
    (el) =>
      el.dataType === 'thumbnail' &&
      el.metadata?.some((meta) => meta.key === 'attachmentLink' && meta.value === thumbnailLink),
  );

  if (!thumbnailDataElement?.id || !instanceId) {
    return '';
  }

  return makeUrlRelativeIfSameDomain(getDataElementUrl(instanceId, thumbnailDataElement.id, language)) || '';
}
