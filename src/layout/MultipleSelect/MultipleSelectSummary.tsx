import React from 'react';

import { Lang } from 'src/features/language/Lang';
import { MultipleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/MultipleValueSummary';
import type { MultipleSelectSummaryOverrideProps } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type MultipleSelectSummaryProps = {
  componentNode: LayoutNode<'MultipleSelect'>;
  summaryOverrides?: MultipleSelectSummaryOverrideProps;
};

export const MultipleSelectSummary = ({ componentNode, summaryOverrides }: MultipleSelectSummaryProps) => {
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
