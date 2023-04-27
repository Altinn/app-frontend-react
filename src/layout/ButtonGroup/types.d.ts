import type { ExprResolved } from 'src/features/expressions/types';
import type { ComponentTypes, ILayoutCompBase } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export type ButtonGroupChildType = Extract<
  ComponentTypes,
  'Button' | 'NavigationButtons' | 'InstantiationButton' | 'PrintButton'
>;

export interface ILayoutCompButtonGroupInHierarchy extends ExprResolved<ILayoutCompBase<'ButtonGroup'>> {
  childComponents: LayoutNode[];
}

export interface ILayoutCompButtonGroup extends ILayoutCompBase<'ButtonGroup'> {
  children: string[];
}
