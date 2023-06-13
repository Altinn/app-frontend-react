import React from 'react';

import { DefaultNodeInspector } from 'src/features/devtools/components/NodeInspector/DefaultNodeInspector';
import { SummaryItemCompact } from 'src/layout/Summary/SummaryItemCompact';
import { appLanguageStateSelector } from 'src/selectors/appLanguageStateSelector';
import { getCurrentDataTypeForApplication } from 'src/utils/appMetadata';
import { convertDataBindingToModel } from 'src/utils/databindings';
import { SimpleComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import {
  getValidator,
  validateEmptyField,
  validateFormComponentsForNodes,
  validateFormDataForLayout,
} from 'src/utils/validation/validation';
import type { ComponentTypeConfigs } from 'src/layout/components';
import type { PropsFromGenericComponent } from 'src/layout/index';
import type { ComponentTypes } from 'src/layout/layout';
import type { ISummaryComponent } from 'src/layout/Summary/SummaryComponent';
import type { IComponentValidations, IRuntimeState } from 'src/types';
import type { AnyItem, HierarchyDataSources, LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

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

abstract class AnyComponent<Type extends ComponentTypes> {
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

  /**
   * Validation
   */
  runEmptyFieldValidation(node: LayoutNodeFromType<Type>): IComponentValidations {
    return {};
  }
  runComponentValidation(node: LayoutNodeFromType<Type>): IComponentValidations {
    return {};
  }
  runSchemaValidation(node: LayoutNodeFromType<Type>): IComponentValidations {
    return {};
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

export abstract class FormComponent<Type extends ComponentTypes> extends _FormComponent<Type> {
  readonly type = ComponentType.Form;

  // TODO: This actually returns ILayoutValidations, the signature must be changed
  runComponentValidation(node: LayoutNodeFromType<Type>): IComponentValidations {
    const state: IRuntimeState = window.reduxStore.getState();

    const attachments = state.attachments.attachments;
    const language = state.language.language ?? {};
    const profileLanguage = appLanguageStateSelector(state);
    return validateFormComponentsForNodes(attachments, node, language, profileLanguage);
  }

  runEmptyFieldValidation(node: LayoutNodeFromType<Type>): IComponentValidations {
    const state: IRuntimeState = window.reduxStore.getState();

    const formData = node.getFormData();
    const language = state.language.language ?? {};
    const textResources = state.textResources.resources;
    return validateEmptyField(formData, node, textResources, language) ?? {};
  }

  // TODO: This actually returns IValidations, the signature must be changed and function fixed
  runSchemaValidation(node: LayoutNodeFromType<Type>): IComponentValidations {
    const state: IRuntimeState = window.reduxStore.getState();

    const jsonFormData = convertDataBindingToModel(node.getFormData());
    const layoutKey = node.top.top.myKey;
    const language = state.language.language ?? {};
    const textResources = state.textResources.resources;
    const currentDataTaskDataTypeId = getCurrentDataTypeForApplication({
      application: state.applicationMetadata.applicationMetadata,
      instance: state.instanceData.instance,
      layoutSets: state.formLayout.layoutsets,
    });
    const validator = getValidator(currentDataTaskDataTypeId, state.formDataModel.schemas);

    return validateFormDataForLayout(jsonFormData, node, layoutKey, validator, language, textResources).validations;
  }
}

export abstract class ContainerComponent<Type extends ComponentTypes> extends _FormComponent<Type> {
  readonly type = ComponentType.Container;

  // TODO: This actually returns ILayoutValidations, the signature must be changed
  runEmptyFieldValidation(node: LayoutNodeFromType<Type>): IComponentValidations {
    const validations = {};
    for (const child of node.children()) {
      validations[child.item.id] = child.runEmptyFieldValidation();
    }
    return validations;
  }

  // TODO: This actually returns ILayoutValidations, the signature must be changed
  runComponentValidation(node: LayoutNodeFromType<Type>): IComponentValidations {
    const validations = {};
    for (const child of node.children()) {
      validations[child.item.id] = child.runComponentValidation();
    }
    return validations;
  }

  // TODO: This actually returns ILayoutValidations, the signature must be changed
  runSchemaValidation(node: LayoutNodeFromType<Type>): IComponentValidations {
    const validations = {};
    for (const child of node.children()) {
      validations[child.item.id] = child.runSchemaValidation();
    }
    return validations;
  }
}

export type LayoutComponent<Type extends ComponentTypes = ComponentTypes> =
  | PresentationComponent<Type>
  | FormComponent<Type>
  | ActionComponent<Type>
  | ContainerComponent<Type>;
