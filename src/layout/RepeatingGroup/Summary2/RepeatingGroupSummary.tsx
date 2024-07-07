import React from 'react';

import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import type { InputSummaryOverrideProps } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type RepeatingGroupComponentSummaryProps = {
  componentNode: LayoutNode<'RepeatingGroup'>;
  summaryOverrides?: InputSummaryOverrideProps;
};
export const RepeatingGroupSummary = ({ componentNode }: RepeatingGroupComponentSummaryProps) => {
  const validations = useUnifiedValidationsForNode(componentNode);
  const errors = validationsOfSeverity(validations, 'error');
  const title = componentNode.item.textResourceBindings?.title;

  return <div>tjobing</div>;
};
