import React from 'react';

import { PresentationComponent } from 'src/layout/LayoutComponent';
import { ParagraphComponent } from 'src/layout/Paragraph/ParagraphComponent';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompParagraph } from 'src/layout/Paragraph/types';

export class Paragraph extends PresentationComponent<'Paragraph'> {
  render(props: PropsFromGenericComponent<'Paragraph'>): JSX.Element | null {
    return <ParagraphComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }
}

export const Config = {
  def: new Paragraph(),
  types: {
    layout: {} as unknown as ILayoutCompParagraph,
    nodeItem: {} as unknown as ExprResolved<ILayoutCompParagraph>,
    nodeObj: LayoutNode,
  },
};
