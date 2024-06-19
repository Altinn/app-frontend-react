import React from 'react';

import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { MultipleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/MultipleValueSummary';
import type { CompMultipleSelectInternal } from 'src/layout/MultipleSelect/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type MultupleSelectSummaryProps = {
  componentNode: LayoutNode<'MultipleSelect'>;
  summaryOverrides?: CompMultipleSelectInternal['summaryProps'];
  displayData: string;
};

export const MultipleSelectSummary = ({ componentNode, summaryOverrides, displayData }: MultupleSelectSummaryProps) => {
  const maxStringLength = 75;
  const showAsList =
    summaryOverrides?.displayType === 'list' ||
    (!summaryOverrides?.displayType && displayData?.length >= maxStringLength);
  const validations = useUnifiedValidationsForNode(componentNode);
  const errors = validationsOfSeverity(validations, 'error');
  const title = componentNode.item.textResourceBindings?.title;
  return (
    <MultipleValueSummary
      title={<Lang id={title} />}
      displayData={displayData}
      errors={errors}
      componentNode={componentNode}
      showAsList={showAsList}
    />
  );
};
