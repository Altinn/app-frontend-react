import { useProcessNext } from 'src/hooks/queries/useProcessNext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export const useCanSubmitForm = (node: LayoutNode): { canSubmit: boolean; busyWithId?: string; message?: string } => {
  const { langAsString } = useLanguage();
  const submittingId = useAppSelector((state) => state.formData.submittingId);
  const { busyWithId, isLoading } = useProcessNext(node);
  const attachments = useAppSelector((state) => state.attachments.attachments);

  const attachmentsPending = Object.values(attachments).some((fileUploader) =>
    fileUploader.some((attachment) => !attachment.uploaded || attachment.updating || attachment.deleting),
  );

  const busyWithId = submittingId || completingId || undefined;
  const canSubmit = !busyWithId && !attachmentsPending;
  const message = attachmentsPending ? langAsString('general.wait_for_attachments') : undefined;

  return { canSubmit, busyWithId, message };
};
