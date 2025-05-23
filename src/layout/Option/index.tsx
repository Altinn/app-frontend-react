import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { useLanguage } from 'src/features/language/useLanguage';
import { getSelectedValueToText } from 'src/features/options/getSelectedValueToText';
import { useNodeOptions } from 'src/features/options/useNodeOptions';
import { OptionDef } from 'src/layout/Option/config.def.generated';
import { OptionComponent } from 'src/layout/Option/OptionComponent';
import { OptionSummary } from 'src/layout/Option/OptionSummary';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { DisplayData } from 'src/features/displayData';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';

export class Option extends OptionDef implements DisplayData {
  useDisplayData(nodeId: string): string {
    const value = NodesInternal.useNodeDataWhenType(nodeId, 'Option', (data) => data.item?.value) ?? '';
    const options = useNodeOptions(nodeId).options;
    const langTools = useLanguage();
    return getSelectedValueToText(value, langTools, options) || '';
  }

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Option'>>(function LayoutComponentOptionRender(props, _) {
    return <OptionComponent {...props} />;
  });

  renderSummary2(props: Summary2Props<'Option'>): JSX.Element | null {
    return <OptionSummary {...props} />;
  }

  evalExpressions(props: ExprResolver<'Option'>) {
    return {
      ...this.evalDefaultExpressions(props),
      value: props.evalStr(props.item.value, ''),
    };
  }
}
