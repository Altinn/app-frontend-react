import React from 'react';

import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import type { CompInputInternal } from 'src/layout/Input/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type InputComponentSummaryProps = {
  componentNode: LayoutNode<'Input'>;
  displayData: string;
  summaryOverrides?: CompInputInternal['summaryProps'];
};

/*
 * Hidden: Dersom hidden = true fjernes hele node fra hierarkiet.
 * hvis vi da rendrer summary, vil fjernes også være fjernet fra summary
 * Hvis vi da vil vise komponent kun på summary, er det vanskelig å få til.
 *
 *
 * hideInSummary
 *
 * */

export const InputSummary = ({ componentNode, displayData }: InputComponentSummaryProps) => {
  const validations = useUnifiedValidationsForNode(componentNode);
  const errors = validationsOfSeverity(validations, 'error');
  const title = componentNode.item.textResourceBindings?.title;

  return (
    <SingleValueSummary
      title={title && <Lang id={title} />}
      displayData={displayData}
      errors={errors}
      componentNode={componentNode}
    />
  );
};
