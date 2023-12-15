import React from 'react';
import type { JSX } from 'react';

import type { ErrorObject } from 'ajv';

import { RepeatingGroupDef } from 'src/layout/RepeatingGroup/config.def.generated';
import { GroupHierarchyGenerator } from 'src/layout/RepeatingGroup/hierarchy';
import { RepeatingGroupContainer } from 'src/layout/RepeatingGroup/RepeatingGroupContainer';
import { SummaryRepeatingGroup } from 'src/layout/RepeatingGroup/SummaryRepeatingGroup';
import { runValidationOnNodes } from 'src/utils/validation/validation';
import { buildValidationObject } from 'src/utils/validation/validationHelpers';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { IFormData } from 'src/features/formData';
import type { ComponentValidation, GroupValidation, PropsFromGenericComponent } from 'src/layout';
import type { CompExternalExact } from 'src/layout/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationContext, IValidationObject, ValidationContextGenerator } from 'src/utils/validation/types';

export class RepeatingGroup extends RepeatingGroupDef implements GroupValidation, ComponentValidation {
  private _hierarchyGenerator = new GroupHierarchyGenerator();

  directRender(): boolean {
    return true;
  }

  render(props: PropsFromGenericComponent<'RepeatingGroup'>): JSX.Element | null {
    return <RepeatingGroupContainer {...props} />;
  }

  renderSummary({
    onChangeClick,
    changeText,
    summaryNode,
    targetNode,
    overrides,
  }: SummaryRendererProps<'RepeatingGroup'>): JSX.Element | null {
    return (
      <SummaryRepeatingGroup
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

  hierarchyGenerator(): ComponentHierarchyGenerator<'RepeatingGroup'> {
    return this._hierarchyGenerator;
  }

  runComponentValidation(
    node: LayoutNode<'RepeatingGroup'>,
    { langTools }: IValidationContext,
    _overrideFormData?: IFormData,
  ): IValidationObject[] {
    const validationObjects: IValidationObject[] = [];
    // check if minCount is less than visible rows
    const repeatingGroupComponent = node.item;
    const repeatingGroupMinCount = repeatingGroupComponent.minCount || 0;
    const repeatingGroupVisibleRows = repeatingGroupComponent.rows.filter(
      (row) => row && !row.groupExpressions?.hiddenRow,
    ).length;

    const repeatingGroupMinCountValid = repeatingGroupMinCount <= repeatingGroupVisibleRows;

    // if not valid, return appropriate error message
    if (!repeatingGroupMinCountValid) {
      const errorMessage = langTools.langAsNonProcessedString('validation_errors.minItems', [repeatingGroupMinCount]);

      validationObjects.push(buildValidationObject(node, 'errors', errorMessage, 'group'));
    }

    return validationObjects;
  }

  runGroupValidations(
    node: LayoutNode<'RepeatingGroup'>,
    validationCtxGenerator: ValidationContextGenerator,
    onlyInRowIndex?: number,
  ): IValidationObject[] {
    return runValidationOnNodes(node.flat(true, onlyInRowIndex), validationCtxGenerator);
  }

  isDataModelBindingsRequired(): boolean {
    return true;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'RepeatingGroup'>): string[] {
    const [errors, result] = this.validateDataModelBindingsAny(ctx, 'group', ['array']);
    if (errors) {
      return errors;
    }

    if (result) {
      const innerType = Array.isArray(result.items) ? result.items[0] : result.items;
      if (!innerType || typeof innerType !== 'object' || !innerType.type || innerType.type !== 'object') {
        return [`group-datamodellbindingen peker mot en ukjent type i datamodellen`];
      }
    }

    return [];
  }

  /**
   * Override layout validation to select a specific pointer depending on the type of group.
   */
  validateLayoutConfing(
    component: CompExternalExact<'RepeatingGroup'>,
    validatate: (pointer: string, data: unknown) => ErrorObject[] | undefined,
  ): ErrorObject[] | undefined {
    const schemaPointer = '#/definitions/CompGroupRepeating';

    return validatate(schemaPointer, component);
  }
}
