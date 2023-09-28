import type { IUploadAttachmentAction } from 'src/features/attachments/upload/uploadAttachmentActions';
import type { IData } from 'src/types/shared';

export interface IAttachmentState {}

export interface IAttachmentsCtx {
  attachments: IAttachments;
  upload(action: IUploadAttachmentAction): void;
}

interface IAttachmentTemporary {
  filename: string;
  size: number;
  id: string;
}

export type IAttachment =
  | { state: 'uploaded'; data: IData }
  | { state: 'uploading'; data: IAttachmentTemporary }
  | { state: 'upload-failed'; data: IAttachmentTemporary } // TODO: Add more info about reason?
  | { state: 'deleting'; data: IData }
  | { state: 'delete-failed'; data: IData } // TODO: Add more info about reason?
  | { state: 'updating'; data: IData }
  | { state: 'update-failed'; data: IData }; // TODO: Add more info about reason?

export interface IAttachments {
  [attachmentComponentId: string]: IAttachment[] | undefined;
}
