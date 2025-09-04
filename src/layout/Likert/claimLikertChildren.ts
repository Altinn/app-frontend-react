import { makeLikertChildId } from 'src/layout/Likert/Generator/makeLikertChildId';
import type { ChildClaimerProps } from 'src/layout/LayoutComponent';

export interface ClaimLikertChildrenOptions {
  pluginKey: string;
}

export function claimLikertChildren(
  { claimChild, item }: ChildClaimerProps<'Likert'>,
  options: ClaimLikertChildrenOptions,
): void {
  claimChild(options.pluginKey, makeLikertChildId(item.id));
}
