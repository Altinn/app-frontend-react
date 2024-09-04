import React from 'react';

import { Lang } from 'src/features/language/Lang';
import { MultipleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/MultipleValueSummary';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { CompInternal } from 'src/layout/layout';
import type { CheckboxSummaryOverrideProps } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface CheckboxesSummaryProps {
  componentNode: LayoutNode<'Checkboxes'>;
  summaryOverrides?: CompInternal<'Summary2'>['overrides'];
  isCompact?: boolean;
  emptyFieldText?: string;
}

export function CheckboxesSummary({
  componentNode,
  summaryOverrides,
  isCompact,
  emptyFieldText,
}: CheckboxesSummaryProps) {
  const displayData = componentNode.def.useDisplayData(componentNode);
  const maxStringLength = 75;
  const overrides = summaryOverrides?.find((override) => override.componentId === componentNode.baseId) as
    | CheckboxSummaryOverrideProps
    | undefined;
  const showAsList =
    overrides?.displayType === 'list' || (!overrides?.displayType && displayData?.length >= maxStringLength);
  const title = useNodeItem(componentNode, (i) => i.textResourceBindings?.title);

  return (
    <MultipleValueSummary
      title={<Lang id={title} />}
      componentNode={componentNode}
      isCompact={isCompact}
      showAsList={showAsList}
      emptyFieldText={emptyFieldText}
    />
  );
}
