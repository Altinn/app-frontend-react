import { makeLikertChildId } from 'src/layout/Likert/Generator/makeLikertChildId';
import type { ChildClaimerProps } from 'src/layout/LayoutComponent';

export function claimLikertChildren({ claimChild, item }: ChildClaimerProps<'Likert'>): void {
  claimChild(makeLikertChildId(item.id));
}
