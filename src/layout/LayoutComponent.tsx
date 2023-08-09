import React from 'react';

import { DefaultNodeInspector } from 'src/features/devtools/components/NodeInspector/DefaultNodeInspector';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { ComponentCategory } from 'src/layout/common';
import { SummaryItemCompact } from 'src/layout/Summary/SummaryItemCompact';
import { getFieldName } from 'src/utils/formComponentUtils';
import { SimpleComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { buildValidationObject } from 'src/utils/validation/validationHelpers';
import type { IFormData } from 'src/features/formData';
import type {
  DisplayData,
  DisplayDataProps,
  EmptyFieldValidation,
  PropsFromGenericComponent,
  SchemaValidation,
} from 'src/layout/index';
import type { ComponentTypes, ITextResourceBindings } from 'src/layout/layout';
import type { ISummaryComponent } from 'src/layout/Summary/SummaryComponent';
import type { AnyItem, HierarchyDataSources } from 'src/utils/layout/hierarchy.types';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { ISchemaValidationError } from 'src/utils/validation/schemaValidation';
import type { IValidationContext, IValidationObject } from 'src/utils/validation/types';

const defaultGenerator = new SimpleComponentHierarchyGenerator();

export abstract class AnyComponent<Type extends ComponentTypes> {
  /**
   * Given properties from GenericComponent, render this layout component
   */
  abstract render(props: PropsFromGenericComponent<Type>): JSX.Element | null;

  /**
   * Given a node, a list of the node's data, for display in the devtools node inspector
   */
  renderDevToolsInspector(node: LayoutNode<Type>): JSX.Element | null {
    return <DefaultNodeInspector node={node} />;
  }

  /**
   * Direct render? Override this and return true if you want GenericComponent to omit rendering grid,
   * validation messages, etc.
   */
  directRender(_props: PropsFromGenericComponent<Type>): boolean {
    return false;
  }

  /**
   * Return false to prevent this component from being rendered in a table
   * Should be configured as a capability in the component configuration (config.ts)
   */
  abstract canRenderInTable(): boolean;

  /**
   * Return true to allow this component to be rendered in a ButtonGroup
   * Should be configured as a capability in the component configuration (config.ts)
   */
  abstract canRenderInButtonGroup(): boolean;

  /**
   * Return true to allow this component to be rendered in an Accordion
   */
  abstract canRenderInAccordion(): boolean;

  /**
   * Return true to allow this component to be rendered in an AccordionGroup
   */
  abstract canRenderInAccordionGroup(): boolean;

  /**
   * Should GenericComponent render validation messages for simpleBinding outside of this component?
   * This has no effect if:
   *  - Your component renders directly, using directRender()
   *  - Your component uses a different data binding (you should handle validations yourself)
   */
  renderDefaultValidations(): boolean {
    return true;
  }

  /**
   * Returns a new instance of a class to perform the component hierarchy generation process
   * @see HierarchyGenerator
   */
  hierarchyGenerator(): ComponentHierarchyGenerator<Type> {
    return defaultGenerator;
  }

  makeNode(
    item: AnyItem<Type>,
    parent: LayoutNode | LayoutPage,
    top: LayoutPage,
    dataSources: HierarchyDataSources,
    rowIndex?: number,
  ): LayoutNode<Type> {
    return new BaseLayoutNode(item, parent, top, dataSources, rowIndex) as LayoutNode<Type>;
  }
}

export abstract class PresentationComponent<Type extends ComponentTypes> extends AnyComponent<Type> {
  readonly type = ComponentCategory.Presentation;
}

export interface SummaryRendererProps<Type extends ComponentTypes> {
  summaryNode: LayoutNode<'Summary'>;
  targetNode: LayoutNode<Type>;
  onChangeClick: () => void;
  changeText: string | null;
  overrides?: ISummaryComponent['overrides'];
}

abstract class _FormComponent<Type extends ComponentTypes> extends AnyComponent<Type> implements DisplayData<Type> {
  /**
   * Given a node (with group-index-aware data model bindings), this method should return a proper 'value' for the
   * current component/node. This value will be used to display form data in a repeating group table, and when rendering
   * a Summary for the node inside a repeating group. It will probably also be useful when implementing renderSummary().
   * @see renderSummary
   * @see renderCompactSummary
   */
  abstract getDisplayData(node: LayoutNode<Type>, displayDataProps: DisplayDataProps): string;

  useDisplayData(node: LayoutNode<Type>): string {
    const formData = useAppSelector((state) => state.formData.formData);
    const attachments = useAppSelector((state) => state.attachments.attachments);
    const options = useAppSelector((state) => state.optionState.options);
    const uiConfig = useAppSelector((state) => state.formLayout.uiConfig);
    const langTools = useLanguage();
    return this.getDisplayData(node, { formData, attachments, options, uiConfig, langTools });
  }

  /**
   * Render a summary for this component. For most components, this will return a:
   * <SingleInputSummary formDataAsString={displayData} />
   */
  abstract renderSummary(props: SummaryRendererProps<Type>): JSX.Element | null;

  /**
   * Lets you control if the component renders something like <SummaryBoilerplate /> first, or if the Summary should
   * handle that for you.
   */
  renderSummaryBoilerplate(): boolean {
    return true;
  }

  /**
   * When rendering a summary of a repeating group with `largeGroup: false`, every FormComponent inside each row is
   * rendered in a compact way. The default
   */
  public renderCompactSummary({ targetNode }: SummaryRendererProps<Type>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return (
      <SummaryItemCompact
        targetNode={targetNode}
        displayData={displayData}
      />
    );
  }
}

export abstract class ActionComponent<Type extends ComponentTypes> extends AnyComponent<Type> {
  readonly type = ComponentCategory.Action;
}

export abstract class FormComponent<Type extends ComponentTypes>
  extends _FormComponent<Type>
  implements EmptyFieldValidation, SchemaValidation
{
  readonly type = ComponentCategory.Form;

  runEmptyFieldValidation(
    node: LayoutNode<Type>,
    { formData, langTools }: IValidationContext,
    overrideFormData?: IFormData,
  ): IValidationObject[] {
    if (!node.item.required) {
      return [];
    }

    const formDataToValidate = { ...formData, ...overrideFormData };
    const validationObjects: IValidationObject[] = [];

    const bindings = Object.entries(node.item.dataModelBindings ?? {});
    for (const [bindingKey, _field] of bindings) {
      const field = _field as string;
      const data = formDataToValidate[field];

      if (!data?.length) {
        const fieldName = getFieldName(node.item.textResourceBindings as ITextResourceBindings, langTools, bindingKey);

        validationObjects.push(
          buildValidationObject(
            node,
            'errors',
            langTools.langAsString('form_filler.error_required', [fieldName]),
            bindingKey,
          ),
        );
      }
    }
    return validationObjects;
  }

  runSchemaValidation(node: LayoutNode<Type>, schemaErrors: ISchemaValidationError[]): IValidationObject[] {
    const validationObjects: IValidationObject[] = [];
    for (const error of schemaErrors) {
      if (node.item.dataModelBindings) {
        const bindings = Object.entries(node.item.dataModelBindings);
        for (const [bindingKey, bindingField] of bindings) {
          if (bindingField === error.bindingField) {
            validationObjects.push(
              buildValidationObject(node, 'errors', error.message, bindingKey, error.invalidDataType),
            );
          }
        }
      }
    }
    return validationObjects;
  }
}

export abstract class ContainerComponent<Type extends ComponentTypes> extends _FormComponent<Type> {
  readonly type = ComponentCategory.Container;
}

export type LayoutComponent<Type extends ComponentTypes = ComponentTypes> =
  | PresentationComponent<Type>
  | FormComponent<Type>
  | ActionComponent<Type>
  | ContainerComponent<Type>;
