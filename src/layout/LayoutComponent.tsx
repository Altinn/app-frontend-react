import React from 'react';

import { DefaultNodeInspector } from 'src/features/devtools/components/NodeInspector/DefaultNodeInspector';
import { staticUseLanguageFromState } from 'src/hooks/useLanguage';
import { SummaryItemCompact } from 'src/layout/Summary/SummaryItemCompact';
import { getFieldName } from 'src/utils/formComponentUtils';
import { SimpleComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import {
  buildValidationObject,
  createComponentValidationResult,
  emptyValidation,
  getSchemaValidationErrors,
} from 'src/utils/validation/validationHelpers';
import type { IFormData } from 'src/features/formData';
import type { ComponentTypeConfigs } from 'src/layout/components';
import type { NodeValidation, PropsFromGenericComponent } from 'src/layout/index';
import type { ComponentTypes } from 'src/layout/layout';
import type { ISummaryComponent } from 'src/layout/Summary/SummaryComponent';
import type { IComponentValidationResult, IRuntimeState } from 'src/types';
import type { AnyItem, HierarchyDataSources, LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { IValidationObject } from 'src/utils/validation/types';

/**
 * This enum is used to distinguish purely presentational components
 * from interactive form components that can have formData etc.
 */
export enum ComponentType {
  Presentation = 'presentation',
  Form = 'form',
  Action = 'action',
  Container = 'container',
}

const defaultGenerator = new SimpleComponentHierarchyGenerator();

export abstract class AnyComponent<Type extends ComponentTypes> {
  /**
   * Given properties from GenericComponent, render this layout component
   */
  abstract render(props: PropsFromGenericComponent<Type>): JSX.Element | null;

  /**
   * Given a node, a list of the node's data, for display in the devtools node inspector
   */
  renderDevToolsInspector(node: LayoutNodeFromType<Type>): JSX.Element | null {
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
   * Return false to render this component without the label (in GenericComponent.tsx)
   */
  renderWithLabel(): boolean {
    return true;
  }

  /**
   * Return false to prevent this component from being rendered in a table
   */
  canRenderInTable(): boolean {
    return true;
  }

  /**
   * Return true to allow this component to be rendered in a ButtonGroup
   */
  canRenderInButtonGroup(): boolean {
    return false;
  }

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
  ): ComponentTypeConfigs[Type]['nodeObj'] {
    return new LayoutNode(item, parent, top, dataSources, rowIndex);
  }
}

export abstract class PresentationComponent<Type extends ComponentTypes> extends AnyComponent<Type> {
  readonly type = ComponentType.Presentation;
}

export interface SummaryRendererProps<Type extends ComponentTypes> {
  summaryNode: LayoutNodeFromType<'Summary'>;
  targetNode: LayoutNodeFromType<Type>;
  onChangeClick: () => void;
  changeText: string | null;
  overrides?: ISummaryComponent['overrides'];
}

abstract class _FormComponent<Type extends ComponentTypes> extends AnyComponent<Type> {
  /**
   * Given a node (with group-index-aware data model bindings), this method should return a proper 'value' for the
   * current component/node. This value will be used to display form data in a repeating group table, and when rendering
   * a Summary for the node inside a repeating group. It will probably also be useful when implementing renderSummary().
   * @see renderSummary
   * @see renderCompactSummary
   */
  abstract useDisplayData(node: LayoutNodeFromType<Type>): string;

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
  readonly type = ComponentType.Action;
}

export abstract class FormComponent<Type extends ComponentTypes>
  extends _FormComponent<Type>
  implements NodeValidation
{
  readonly type = ComponentType.Form;

  runComponentValidation(_node: LayoutNodeFromType<Type>, _overrideFormData?: IFormData): IValidationObject[] {
    return [];
  }

  runEmptyFieldValidation(node: LayoutNodeFromType<Type>, overrideFormData?: IFormData): IValidationObject[] {
    if (node.isHidden() || node.item.renderAsSummary || !node.item.required) {
      return [];
    }

    const state: IRuntimeState = window.reduxStore.getState();

    const formData = { ...state.formData.formData, ...overrideFormData };
    const langTools = staticUseLanguageFromState(state);
    const validationObjects: IValidationObject[] = [];

    const bindings = Object.entries(node.item.dataModelBindings ?? {});
    for (const [bindingKey, field] of bindings) {
      const data = formData[field];

      if (!data?.length) {
        const fieldName = getFieldName(node.item.textResourceBindings, langTools, bindingKey);

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

  runSchemaValidation(node: LayoutNodeFromType<Type>, overrideFormData?: IFormData): IValidationObject[] {
    if (node.isHidden() || node.item.renderAsSummary) {
      return [];
    }

    const schemaErrors = getSchemaValidationErrors(overrideFormData);
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

  runValidations(node: LayoutNodeFromType<Type>, overrideFormData?: IFormData): IValidationObject[] {
    const componentValidations = this.runComponentValidation(node, overrideFormData);
    const emptyFieldValidations = this.runEmptyFieldValidation(node, overrideFormData);
    const schemaValidations = this.runSchemaValidation(node, overrideFormData);

    const nodeValidationObjects = [...componentValidations, ...emptyFieldValidations, ...schemaValidations];
    return nodeValidationObjects.length ? nodeValidationObjects : [emptyValidation(node)];
  }

  validateComponent(node: LayoutNodeFromType<Type>, overrideFormData?: IFormData): IComponentValidationResult {
    const validationObjects = this.runValidations(node, overrideFormData);
    return createComponentValidationResult(validationObjects);
  }
}

export abstract class ContainerComponent<Type extends ComponentTypes> extends _FormComponent<Type> {
  readonly type = ComponentType.Container;
}

export type LayoutComponent<Type extends ComponentTypes = ComponentTypes> =
  | PresentationComponent<Type>
  | FormComponent<Type>
  | ActionComponent<Type>
  | ContainerComponent<Type>;
