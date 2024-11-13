import React from 'react';

import type { PropsFromGenericComponent } from '..';

import { PDFGeneratorPreview } from 'src/components/PDFGeneratorPreview/PDFGeneratorPreview';
import { useNodeItem } from 'src/utils/layout/useNodeItem';

export type IActionButton = PropsFromGenericComponent<'PDFPreviewButton'>;

export function PDFPreviewButtonComponent({ node }: IActionButton) {
  const { textResourceBindings } = useNodeItem(node);
  return <PDFGeneratorPreview buttonTitle={textResourceBindings?.title} />;
}
