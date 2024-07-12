import React from 'react';

import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import type { CompTextAreaInternal } from 'src/layout/TextArea/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type TextAreaComponentSummaryProps = {
  componentNode: LayoutNode<'TextArea'>;
  summaryOverrides?: CompTextAreaInternal['summaryProps'];
};

export const TextAreaSummary = ({ componentNode }: TextAreaComponentSummaryProps) => {
  const displayData = componentNode.def.useDisplayData(componentNode);
  const validations = useUnifiedValidationsForNode(componentNode);
  const errors = validationsOfSeverity(validations, 'error');
  const title = componentNode.item.textResourceBindings?.title;
  return (
    <SingleValueSummary
      title={title && <Lang id={title} />}
      displayData={displayData}
      errors={errors}
      componentNode={componentNode}
      multiline
    />
  );
};
