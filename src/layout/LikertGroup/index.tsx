import React from 'react';
import type { JSX } from 'react';

import type { ErrorObject } from 'ajv';

import { LikertGroupDef } from 'src/layout/LikertGroup/config.def.generated';
import { LikertGroupHierarchyGenerator } from 'src/layout/LikertGroup/hierarchy';
import { LikertGroupComponent } from 'src/layout/LikertGroup/LikertGroup';
import { LikertGroupSummary } from 'src/layout/LikertGroup/LikertGroupSummary';
import { type LayoutNode } from 'src/utils/layout/LayoutNode';
import { runValidationOnNodes } from 'src/utils/validation/validation';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { GroupValidation, PropsFromGenericComponent } from 'src/layout';
import type { CompExternalExact } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { IValidationObject, ValidationContextGenerator } from 'src/utils/validation/types';

export class LikertGroup extends LikertGroupDef implements GroupValidation {
  private _hierarchyGenerator = new LikertGroupHierarchyGenerator();

  directRender(): boolean {
    return true;
  }

  render(props: PropsFromGenericComponent<'LikertGroup'>): JSX.Element | null {
    return <LikertGroupComponent {...props} />;
  }

  renderSummary({
    onChangeClick,
    changeText,
    summaryNode,
    targetNode,
    overrides,
  }: SummaryRendererProps<'LikertGroup'>): JSX.Element | null {
    return (
      <LikertGroupSummary
        onChangeClick={onChangeClick}
        changeText={changeText}
        summaryNode={summaryNode}
        targetNode={targetNode}
        overrides={overrides}
      />
    );
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }

  getDisplayData(): string {
    return '';
  }

  hierarchyGenerator(): ComponentHierarchyGenerator<'LikertGroup'> {
    return this._hierarchyGenerator;
  }

  // Validering på hver enkel komponent/element i gruppen
  runGroupValidations(
    node: LayoutNode<'LikertGroup'>,
    validationCtxGenerator: ValidationContextGenerator,
    onlyInRowIndex?: number,
  ): IValidationObject[] {
    return runValidationOnNodes(node.flat(true, onlyInRowIndex), validationCtxGenerator);
  }

  isDataModelBindingsRequired(): boolean {
    return true;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'LikertGroup'>): string[] {
    const [errors, result] = this.validateDataModelBindingsAny(ctx, 'LikertGroup', ['array']);
    if (errors) {
      return errors;
    }

    if (result) {
      const innerType = Array.isArray(result.items) ? result.items[0] : result.items;
      if (!innerType || typeof innerType !== 'object' || !innerType.type || innerType.type !== 'object') {
        return [`LikertGroup-datamodellbindingen peker mot en ukjent type i datamodellen`];
      }
    }

    return [];
  }

  /**
   * Override layout validation to select a specific pointer depending on the type of group.
   */
  validateLayoutConfing(
    component: CompExternalExact<'LikertGroup'>,
    validatate: (pointer: string, data: unknown) => ErrorObject[] | undefined,
  ): ErrorObject[] | undefined {
    const schemaPointer = '#/definitions/LikertGroup';
    return validatate(schemaPointer, component);
  }
}
