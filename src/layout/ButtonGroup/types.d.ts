import type { ExprResolved } from 'src/features/expressions/types';
import type { ILayoutCompBase } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ValidTexts = undefined;
type Base = ILayoutCompBase<'ButtonGroup', undefined, ValidTexts>;

export interface ILayoutCompButtonGroupInHierarchy extends ExprResolved<Base> {
  childComponents: LayoutNode[];
}

export interface ILayoutCompButtonGroup extends Base {
  children: string[];
}
