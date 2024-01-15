import React from 'react';
import type { JSX } from 'react';

import type { ErrorObject } from 'ajv';

import type { PropsFromGenericComponent, ValidateAny } from '..';

import { runAllValidations } from 'src/layout/componentValidation';
import { LikertGroupDef } from 'src/layout/LikertGroup/config.def.generated';
import { LikertGroupHierarchyGenerator } from 'src/layout/LikertGroup/hierarchy';
import { LikertGroupComponent } from 'src/layout/LikertGroup/LikertGroup';
import { LikertGroupSummary } from 'src/layout/LikertGroup/LikertGroupSummary';
import { type LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type {
  ComponentValidation,
  FormValidations,
  ISchemaValidationError,
  ValidationDataSources,
} from 'src/features/validation';
import type { CompExternalExact } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';

export class LikertGroup extends LikertGroupDef implements ValidateAny {
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

  runValidations(
    node: LayoutNode,
    ctx: ValidationDataSources,
    schemaErrors: ISchemaValidationError[],
  ): FormValidations {
    return runAllValidations(node, ctx, schemaErrors);
  }

  // This component does not have empty field validation, so has to override its inherited method
  runEmptyFieldValidation(): ComponentValidation[] {
    return [];
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
