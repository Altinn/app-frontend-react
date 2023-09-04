import type { IAttachments } from 'src/features/attachments';

export interface IMapAttachmentsActionFulfilled {
  attachments: IAttachments;
  initializedFor?: string;
}
