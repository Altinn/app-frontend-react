import type { AxiosError } from 'axios';

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
}

interface Metadata {
  updating: boolean;
  deleting: boolean;
  error?: AxiosError;
}

export type IAttachment =
  | ({ uploaded: true; data: IData } & Metadata)
  | ({ uploaded: false; data: IAttachmentTemporary } & Metadata);

export interface IAttachments {
  [attachmentComponentId: string]: IAttachment[] | undefined;
}
