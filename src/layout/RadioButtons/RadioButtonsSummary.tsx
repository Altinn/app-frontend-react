import React from 'react';

import { useDisplayData } from 'src/features/displayData/useDisplayData';
import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type RadioButtonsSummaryProps = {
  isCompact?: boolean;
  componentNode: LayoutNode<'RadioButtons'>;
  emptyFieldText?: string;
};

export const RadioButtonsSummary = ({ componentNode, isCompact, emptyFieldText }: RadioButtonsSummaryProps) => {
  const validations = useUnifiedValidationsForNode(componentNode);
  const displayData = useDisplayData(componentNode);
  const errors = validationsOfSeverity(validations, 'error');
  const title = useNodeItem(componentNode, (i) => i.textResourceBindings?.title);
  return (
    <SingleValueSummary
      title={
        title && (
          <Lang
            id={title}
            node={componentNode}
          />
        )
      }
      displayData={displayData}
      errors={errors}
      componentNode={componentNode}
      isCompact={isCompact}
      emptyFieldText={emptyFieldText}
    />
  );
};
