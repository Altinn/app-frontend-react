import React from 'react';

import type { PropsFromGenericComponent } from '..';

import { PDFGeneratorPreview } from 'src/components/PDFGeneratorPreview/PDFGeneratorPreview';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useStrictInstanceId } from 'src/features/instance/InstanceContext';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { isAtLeastVersion } from 'src/utils/versionCompare';
import type { NodeValidationProps } from 'src/layout/layout';

export type IActionButton = PropsFromGenericComponent<'PDFPreviewButton'>;

export function PDFPreviewButtonRenderLayoutValidator({ node }: NodeValidationProps<'PDFPreviewButton'>) {
  const instanceId = useStrictInstanceId();

  const addError = NodesInternal.useAddError();

  const applicationMetadata = useApplicationMetadata();

  const minimumBackendVersion = '8.5.0.157';

  const backendVersionOK = isAtLeastVersion({
    actualVersion: applicationMetadata.altinnNugetVersion ?? '',
    minimumVersion: minimumBackendVersion,
  });

  if (!backendVersionOK) {
    const error = `Need to be on at least backend version: ${minimumBackendVersion} to user this component`;
    addError(error, node);
    window.logErrorOnce(`Validation error for '${node.id}': ${error}`);
  }

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
