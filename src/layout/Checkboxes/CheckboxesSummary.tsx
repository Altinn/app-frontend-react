import React from 'react';

import { Lang } from 'src/features/language/Lang';
import { MultipleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/MultipleValueSummary';
import type { CheckboxSummaryOverrideProps } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type CheckboxesSummaryProps = {
  componentNode: LayoutNode<'Checkboxes'>;
  summaryOverrides?: CheckboxSummaryOverrideProps;
};

export const CheckboxesSummary = ({ componentNode, summaryOverrides }: CheckboxesSummaryProps) => {
  const displayData = componentNode.def.useDisplayData(componentNode);
  const maxStringLength = 75;
  const showAsList =
    summaryOverrides?.displayType === 'list' ||
    (!summaryOverrides?.displayType && displayData?.length >= maxStringLength);
  const title = componentNode.item.textResourceBindings?.title;
  return (
    <MultipleValueSummary
      title={<Lang id={title} />}
      componentNode={componentNode}
      showAsList={showAsList}
    />
  );
};
