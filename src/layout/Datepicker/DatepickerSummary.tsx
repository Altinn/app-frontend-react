import React from 'react';

import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type DatepickerComponentSummaryProps = {
  isCompact?: boolean;
  componentNode: LayoutNode<'Datepicker'>;
};
export const DatepickerSummary = ({ componentNode, isCompact }: DatepickerComponentSummaryProps) => {
  const validations = useUnifiedValidationsForNode(componentNode);
  const errors = validationsOfSeverity(validations, 'error');
  const title = componentNode.item.textResourceBindings?.title;
  const displayData = componentNode.def.useDisplayData(componentNode);

  return (
    <SingleValueSummary
      title={title && <Lang id={title} />}
      displayData={displayData}
      errors={errors}
      componentNode={componentNode}
      isCompact={isCompact}
    />
  );
};
