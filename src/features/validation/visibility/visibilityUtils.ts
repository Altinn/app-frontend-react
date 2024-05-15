// TODO: Remove?
export function getResolvedVisibilityForAttachment(
  attachmentVisibility: number | undefined,
  nodeVisibility: number,
): number {
  let mask = nodeVisibility;
  if (attachmentVisibility) {
    mask |= attachmentVisibility;
  }
  return mask;
}
