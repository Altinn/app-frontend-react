import React from 'react';

import type { PropsFromGenericComponent } from '..';

import { LinkDef } from 'src/layout/Link/config.generated';
import { LinkComponent } from 'src/layout/Link/LinkComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { ILayoutCompLink } from 'src/layout/Link/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Link extends LinkDef {
  render(props: PropsFromGenericComponent<'Link'>): JSX.Element | null {
    return <LinkComponent {...props} />;
  }
}

export const Config = {
  def: new Link(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompLink;
  nodeItem: ExprResolved<ILayoutCompLink>;
  nodeObj: LayoutNode;
  validTextResourceBindings: 'target' | 'title';
  validDataModelBindings: undefined;
};
