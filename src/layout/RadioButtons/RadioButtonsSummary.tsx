import React from 'react';

import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { SingleFieldSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleFieldSummary';
import type { CompRadioButtonsInternal } from 'src/layout/RadioButtons/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type RadioButtonsSummaryProps = {
  componentNode: LayoutNode<'RadioButtons'>;
  displayData: string;
  summaryOverrides?: CompRadioButtonsInternal['summaryProps'];
};

export const RadioButtonsSummary = ({ componentNode, displayData, summaryOverrides }: RadioButtonsSummaryProps) => {
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
