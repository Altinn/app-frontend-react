import type { AxiosError } from 'axios';

import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface AttachmentActionUpload {
  action: 'upload';
  file: File;
  node: LayoutNode<'FileUpload' | 'FileUploadWithTag'>;
}

export interface AttachmentActionUpdate {
  action: 'update';
  tags: string[];
  attachment: UploadedAttachment;
}

export interface AttachmentActionRemove {
  action: 'delete';
  attachment: UploadedAttachment;
}

export interface IAttachmentsCtx {
  attachments: IAttachments;
  upload(action: AttachmentActionUpload): Promise<string | undefined>;
  update(action: AttachmentActionUpdate): Promise<void>;
  remove(action: AttachmentActionRemove): Promise<void>;
}

interface IAttachmentTemporary {
  temporaryId: string;
  filename: string;
  size: number;
}

interface Metadata {
  updating: boolean;
  deleting: boolean;
  error?: AxiosError;
}

export type UploadedAttachment = { uploaded: true; data: IData } & Metadata;
export type TemporaryAttachment = { uploaded: false; data: IAttachmentTemporary } & Metadata;
export type IAttachment = UploadedAttachment | TemporaryAttachment;

export interface IAttachments<T extends IAttachment = IAttachment> {
  [attachmentComponentId: string]: T[] | undefined;
}
