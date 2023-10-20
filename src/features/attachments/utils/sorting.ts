import type { IAttachment, IAttachments } from 'src/features/attachments/index';

export function mergeAndSort(a: IAttachments, b: IAttachments) {
  const result: IAttachments = structuredClone(a);
  for (const nodeId in b) {
    const next = b[nodeId];
    const existing = result[nodeId];
    if (existing && next) {
      existing.push(...structuredClone(next));
    } else if (!existing && next) {
      result[nodeId] = structuredClone(b[nodeId]);
    }
  }

  // Sort all attachments by name
  for (const nodeId in result) {
    const attachments = result[nodeId];
    if (attachments) {
      attachments.sort(sortAttachmentsByName);
    }
  }

  return result;
}

export function sortAttachmentsByName(a: IAttachment, b: IAttachment) {
  if (a.data.filename && b.data.filename) {
    return a.data.filename.localeCompare(b.data.filename);
  }
  return 0;
}
