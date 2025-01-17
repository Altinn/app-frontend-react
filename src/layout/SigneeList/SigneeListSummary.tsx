import React from 'react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface SigneeListSummaryProps {
  componentNode: LayoutNode<'SigneeList'>;
}

export function SigneeListSummary({ componentNode }: SigneeListSummaryProps) {
  const { dataModelBindings, title } = useNodeItem(componentNode, (i) => ({
    dataModelBindings: i.dataModelBindings,
    title: i.textResourceBindings?.title,
  }));
  const { formData } = useDataModelBindings(dataModelBindings);

  return <div />;
}
