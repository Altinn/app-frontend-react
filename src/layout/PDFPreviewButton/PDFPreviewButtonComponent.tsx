import React from 'react';

import type { PropsFromGenericComponent } from '..';

import { PDFGeneratorPreview } from 'src/components/PDFGeneratorPreview/PDFGeneratorPreview';
import { useStrictInstanceId } from 'src/features/instance/InstanceContext';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { NodeValidationProps } from 'src/layout/layout';

export type IActionButton = PropsFromGenericComponent<'PDFPreviewButton'>;

export function PDFPreviewButtonRenderLayoutValidator({ node }: NodeValidationProps<'PDFPreviewButton'>) {
  const instanceId = useStrictInstanceId();

  const addError = NodesInternal.useAddError();

  if (!instanceId) {
    const error = `Cannot use PDF preview button in a stateless app`;
    addError(error, node);
    window.logErrorOnce(`Validation error for '${node.id}': ${error}`);
  }
  return null;
}

export function PDFPreviewButtonComponent({ node }: IActionButton) {
  const { textResourceBindings } = useNodeItem(node);
  return <PDFGeneratorPreview buttonTitle={textResourceBindings?.title} />;
}
