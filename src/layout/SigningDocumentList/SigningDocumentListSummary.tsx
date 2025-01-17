import React from 'react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface SigningDocumentListSummaryProps {
  componentNode: LayoutNode<'SigningDocumentList'>;
}

export function SigningDocumentListSummary({ componentNode }: SigningDocumentListSummaryProps) {
  const { dataModelBindings, title } = useNodeItem(componentNode, (i) => ({
    dataModelBindings: i.dataModelBindings,
    title: i.textResourceBindings?.title,
  }));
  const { formData } = useDataModelBindings(dataModelBindings);

  return <div />;
}
