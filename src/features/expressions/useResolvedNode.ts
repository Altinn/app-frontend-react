import { useExprContext } from 'src/utils/layout/ExprContext';
import type { ComponentExceptGroup, ILayoutComponent } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/hierarchy';
import type { ComponentOf } from 'src/utils/layout/hierarchy.types';

type MaybeSpecificItem<T> = T extends ILayoutComponent
  ? T extends { type: infer Type }
    ? Type extends ComponentExceptGroup
      ? LayoutNode<'resolved', ComponentOf<'resolved', Type>>
      : LayoutNode<'resolved'>
    : LayoutNode<'resolved'>
  : LayoutNode<'resolved'>;

export function useResolvedNode<T>(selector: string | undefined | T): MaybeSpecificItem<T> | undefined {
  const context = useExprContext();

  if (typeof selector === 'string') {
    return context.findById(selector) as any;
  }

  if (typeof selector == 'object' && selector !== null && 'id' in selector && typeof selector.id === 'string') {
    return context.findById(selector.id) as any;
  }

  return undefined;
}
