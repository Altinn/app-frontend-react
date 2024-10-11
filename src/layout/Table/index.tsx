import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { TableDef } from 'src/layout/Table/config.def.generated';
import { TableComponent } from 'src/layout/Table/TableComponent';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { ComponentValidation, ValidationsProcessedLast } from 'src/features/validation';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompIntermediate, CompInternal } from 'src/layout/layout';
import type { ChildClaimerProps, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ChildClaim } from 'src/utils/layout/generator/GeneratorContext';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';
import type { GeneratorErrors } from 'src/utils/layout/types';
import type { TraversalRestriction } from 'src/utils/layout/useNodeTraversal';

export class Table extends TableDef {
  validateDataModelBindings(ctx: LayoutValidationCtx<'Table'>): string[] {
    // throw new Error('Method not implemented.');
    return [];
  }
  claimChildren(props: ChildClaimerProps<'Table', unknown>): void {
    // throw new Error('Method not implemented.');
  }
  pickDirectChildren(
    state: {
      validations: ComponentValidation[];
      validationVisibility: number;
      validationsProcessedLast: ValidationsProcessedLast;
      type: 'node';
      pageKey: string;
      layout: CompIntermediate<'Table'>;
      item: CompInternal<'Table'> | undefined;
      hidden: boolean | undefined;
      rowIndex: number | undefined;
      errors: GeneratorErrors | undefined;
    },
    restriction?: TraversalRestriction,
  ): LayoutNode[] {
    // throw new Error('Method not implemented.');
    return [];
  }
  addChild(
    state: {
      validations: ComponentValidation[];
      validationVisibility: number;
      validationsProcessedLast: ValidationsProcessedLast;
      type: 'node';
      pageKey: string;
      layout: CompIntermediate<'Table'>;
      item: CompInternal<'Table'> | undefined;
      hidden: boolean | undefined;
      rowIndex: number | undefined;
      errors: GeneratorErrors | undefined;
    },
    childNode: LayoutNode,
    claim: ChildClaim,
    rowIndex: number | undefined,
  ): Partial<{
    validations: ComponentValidation[];
    validationVisibility: number;
    validationsProcessedLast: ValidationsProcessedLast;
    type: 'node';
    pageKey: string;
    layout: CompIntermediate<'Table'>;
    item: CompInternal<'Table'> | undefined;
    hidden: boolean | undefined;
    rowIndex: number | undefined;
    errors: GeneratorErrors | undefined;
  }> {
    // throw new Error('Method not implemented.');
    return {};
  }
  removeChild(
    state: {
      validations: ComponentValidation[];
      validationVisibility: number;
      validationsProcessedLast: ValidationsProcessedLast;
      type: 'node';
      pageKey: string;
      layout: CompIntermediate<'Table'>;
      item: CompInternal<'Table'> | undefined;
      hidden: boolean | undefined;
      rowIndex: number | undefined;
      errors: GeneratorErrors | undefined;
    },
    childNode: LayoutNode,
    claim: ChildClaim,
    rowIndex: number | undefined,
  ): Partial<{
    validations: ComponentValidation[];
    validationVisibility: number;
    validationsProcessedLast: ValidationsProcessedLast;
    type: 'node';
    pageKey: string;
    layout: CompIntermediate<'Table'>;
    item: CompInternal<'Table'> | undefined;
    hidden: boolean | undefined;
    rowIndex: number | undefined;
    errors: GeneratorErrors | undefined;
  }> {
    // throw new Error('Method not implemented.');
    return {};
  }
  getDisplayData(node: BaseLayoutNode<'Table'>, displayDataProps: DisplayDataProps): string {
    // throw new Error('Method not implemented.');
    return '';
  }
  renderSummary(props: SummaryRendererProps<'Table'>): JSX.Element | null {
    // throw new Error('Method not implemented.');
    return <div>summary</div>;
  }
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Table'>>(
    function LayoutComponentTableRender(props, _): JSX.Element | null {
      console.log('props', props);
      return <TableComponent {...props}></TableComponent>;
    },
  );
}
