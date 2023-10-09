export interface IAttachmentState {
  attachments: IAttachments;
  error?: Error;
  pendingMapping?: boolean;
}

export interface IAttachment {
  uploaded: boolean;
  updating: boolean;
  deleting: boolean;
  name?: string;
  size: number;
  tags?: string[];
  id: string;
}
export interface IAttachments {
  [attachmentComponentId: string]: IAttachment[];
}
