import React from 'react';

import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';

export const DatepickerSummary = ({ target, isCompact }: Summary2Props<'Datepicker'>) => {
  const validations = useUnifiedValidationsForNode(target);
  const errors = validationsOfSeverity(validations, 'error');
  const title = useNodeItem(target, (i) => i.textResourceBindings?.title);
  const displayData = target.def.useDisplayData(target);

  return (
    <SingleValueSummary
      title={title && <Lang id={title} />}
      displayData={displayData}
      errors={errors}
      componentNode={target}
      isCompact={isCompact}
    />
  );
};
