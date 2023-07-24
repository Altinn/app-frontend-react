import React from 'react';

import { ImageDef } from 'src/layout/Image/config.generated';
import { ImageComponent } from 'src/layout/Image/ImageComponent';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompImage } from 'src/layout/Image/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Image extends ImageDef {
  render(props: PropsFromGenericComponent<'Image'>): JSX.Element | null {
    return <ImageComponent {...props} />;
  }
}

export const Config = {
  def: new Image(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompImage;
  nodeItem: ExprResolved<ILayoutCompImage>;
  nodeObj: LayoutNode;
  validTextResourceBindings: 'altTextImg' | 'help';
  validDataModelBindings: undefined;
};
