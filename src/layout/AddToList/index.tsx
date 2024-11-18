import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { AddToListComponent } from 'src/layout/AddToList/AddToList';
import { AddToListDef } from 'src/layout/AddToList/config.def.generated';
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

export class AddToList extends AddToListDef {
  validateDataModelBindings(ctx: LayoutValidationCtx<'AddToList'>): string[] {
    // throw new Error('Method not implemented.');
    return [];
  }
  claimChildren(props: ChildClaimerProps<'AddToList', unknown>): void {
    // throw new Error('Method not implemented.');
  }
  pickDirectChildren(
    state: {
      validations: ComponentValidation[];
      validationVisibility: number;
      validationsProcessedLast: ValidationsProcessedLast;
      type: 'node';
      pageKey: string;
      layout: CompIntermediate<'AddToList'>;
      item: CompInternal<'AddToList'> | undefined;
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
      layout: CompIntermediate<'AddToList'>;
      item: CompInternal<'AddToList'> | undefined;
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
    layout: CompIntermediate<'AddToList'>;
    item: CompInternal<'AddToList'> | undefined;
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
      layout: CompIntermediate<'AddToList'>;
      item: CompInternal<'AddToList'> | undefined;
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
    layout: CompIntermediate<'AddToList'>;
    item: CompInternal<'AddToList'> | undefined;
    hidden: boolean | undefined;
    rowIndex: number | undefined;
    errors: GeneratorErrors | undefined;
  }> {
    // throw new Error('Method not implemented.');
    return {};
  }
  getDisplayData(node: BaseLayoutNode<'AddToList'>, displayDataProps: DisplayDataProps): string {
    // throw new Error('Method not implemented.');
    return '';
  }
  renderSummary(props: SummaryRendererProps<'AddToList'>): JSX.Element | null {
    // throw new Error('Method not implemented.');
    return <div>summary</div>;
  }
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'AddToList'>>(
    function LayoutComponentAddToListRender(props, _): JSX.Element | null {
      return <AddToListComponent {...props}></AddToListComponent>;
    },
  );
}
