import React from 'react';

import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { CompInternal } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type DropdownComponentSummaryProps = {
  componentNode: LayoutNode<'Dropdown'>;
  summaryOverrides?: CompInternal<'Summary2'>['overrides'];
};

export const DropdownSummary = ({ componentNode }: DropdownComponentSummaryProps) => {
  const displayData = componentNode.def.useDisplayData(componentNode);
  const validations = useUnifiedValidationsForNode(componentNode);
  const errors = validationsOfSeverity(validations, 'error');
  const title = useNodeItem(componentNode, (i) => i.textResourceBindings?.title);
  return (
    <SingleValueSummary
      title={title && <Lang id={title} />}
      displayData={displayData}
      errors={errors}
      componentNode={componentNode}
    />
  );
};
