import React, { forwardRef } from 'react';

import { TableDef } from 'src/layout/Table/config.def.generated';
import { TableComponent, TableSummary } from 'src/layout/Table/TableComponent';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

export class Table extends TableDef {
  validateDataModelBindings(ctx: LayoutValidationCtx<'Table'>): string[] {
    return [];
  }
  getDisplayData(node: BaseLayoutNode<'Table'>, displayDataProps: DisplayDataProps): string {
    return '';
  }
  renderSummary2(props: Summary2Props<'Table'>): React.JSX.Element | null {
    return <TableSummary componentNode={props.target} />;
  }
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Table'>>(
    function LayoutComponentTableRender(props, _): JSX.Element | null {
      return <TableComponent {...props}></TableComponent>;
    },
  );

  renderSummary(props: SummaryRendererProps<'Table'>): React.JSX.Element | null {
    return null;
  }
}
