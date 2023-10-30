import {
  useAttachments,
  useAttachmentsAwaiter,
  useAttachmentsRemover,
} from 'src/features/attachments/AttachmentsContext';
import { isAttachmentUploaded } from 'src/features/attachments/index';
import type { LayoutNodeForGroup } from 'src/layout/Group/LayoutNodeForGroup';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type UploaderNode = LayoutNode<'FileUpload' | 'FileUploadWithTag'>;

/**
 * When deleting a row in a repeating group, we need to find any attachments that are uploaded
 * in that row (or any of its children) and remove them from the instance.
 *
 * We don't bother with removing attachment references from the form data, as that is handled automatically when
 * the repeating group row is deleted when attachment removal is successful.
 *
 * The 'onBeforeRowDeletion' function you get as a result here gives you a Promise that resolves to true if all
 * attachments were successfully removed, or false if any of them failed to be removed.
 */
export function useAttachmentDeletionInRepGroups(node: LayoutNodeForGroup) {
  const attachments = useAttachments();
  const remove = useAttachmentsRemover();
  const awaiter = useAttachmentsAwaiter();

  return {
    async onBeforeRowDeletion(index: number): Promise<boolean> {
      const uploaders = node
        .flat(true, index)
        .filter((node) => node.item.type === 'FileUpload' || node.item.type === 'FileUploadWithTag') as UploaderNode[];
      const promises: Promise<boolean>[] = [];

      for (const uploader of uploaders) {
        const files = attachments[uploader.item.id] ?? [];
        for (const file of files) {
          if (isAttachmentUploaded(file)) {
            promises.push(
              remove({
                attachment: file,
                node: uploader,
              }),
            );
          } else {
            promises.push(
              (async () => {
                const uploaded = await awaiter(file);
                if (uploaded) {
                  return await remove({
                    attachment: {
                      uploaded: true,
                      deleting: false,
                      updating: false,
                      data: uploaded,
                    },
                    node: uploader,
                  });
                }
                // If the attachment was never uploaded successfully, we don't need to remove
                // it, and we can just continue as if removing it was successful.
                return true;
              })(),
            );
          }
        }
      }

      const results = await Promise.all(promises);
      if (results.length === 0) {
        return true;
      }

      return results.every((result) => result);
    },
  };
}
