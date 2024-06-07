import React from 'react';

import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { SingleFieldSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleFieldSummary';
import type { CompInputInternal } from 'src/layout/Input/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type InputComponentSummaryProps = {
  componentNode: LayoutNode<'Input'>;
  displayData: string;
  summaryOverrides?: CompInputInternal['summaryProps'];
};

export const InputSummary = ({ componentNode, displayData, summaryOverrides }: InputComponentSummaryProps) => {
  const validations = useUnifiedValidationsForNode(componentNode);
  const errors = validationsOfSeverity(validations, 'error');
  const title = componentNode.item.textResourceBindings?.title;
  return (
    <SingleFieldSummary
      title={title && <Lang id={title} />}
      displayData={displayData}
      errors={errors}
      componentNode={componentNode}
    />
  );
};
