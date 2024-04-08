import React from 'react';
import type { JSX } from 'react';

import dot from 'dot-object';
import type { ErrorObject } from 'ajv';
import type { JSONSchema7 } from 'json-schema';

import { lookupErrorAsText } from 'src/features/datamodel/lookupErrorAsText';
import { DefaultNodeInspector } from 'src/features/devtools/components/NodeInspector/DefaultNodeInspector';
import { useDisplayDataProps } from 'src/features/displayData/useDisplayData';
import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { CompCategory } from 'src/layout/common';
import { getComponentCapabilities } from 'src/layout/index';
import { SummaryItemCompact } from 'src/layout/Summary/SummaryItemCompact';
import { getFieldNameKey } from 'src/utils/formComponentUtils';
import { DefaultNodeGenerator } from 'src/utils/layout/DefaultNodeGenerator';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayData, DisplayDataProps } from 'src/features/displayData';
import type { SimpleEval } from 'src/features/expressions';
import type { ExprResolved, ExprVal } from 'src/features/expressions/types';
import type { ComponentValidation, ValidationDataSources } from 'src/features/validation';
import type { ComponentBase, FormComponentProps, SummarizableComponentProps } from 'src/layout/common.generated';
import type {
  CompDef,
  FormDataSelector,
  NodeRef,
  PropsFromGenericComponent,
  ValidateEmptyField,
} from 'src/layout/index';
import type {
  CompExternal,
  CompExternalExact,
  CompInternal,
  CompTypes,
  IsContainerComp,
  ITextResourceBindings,
  ITextResourceBindingsExternal,
} from 'src/layout/layout';
import type { ISummaryComponent } from 'src/layout/Summary/SummaryComponent';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { ItemStore, StateFactoryProps } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface BasicNodeGeneratorProps {
  baseId: string;
}

export interface ContainerGeneratorProps extends BasicNodeGeneratorProps {
  childIds: string[];
}

export type NodeGeneratorProps<Type extends CompTypes> =
  IsContainerComp<Type> extends true ? ContainerGeneratorProps : BasicNodeGeneratorProps;

export interface ExprResolver<Type extends CompTypes> {
  item: CompExternalExact<Type>;
  formDataSelector: FormDataSelector;
  evalBase: () => ExprResolved<Omit<ComponentBase, 'hidden'>>;
  evalFormProps: () => ExprResolved<FormComponentProps>;
  evalSummarizable: () => ExprResolved<SummarizableComponentProps>;
  evalStr: SimpleEval<ExprVal.String>;
  evalNum: SimpleEval<ExprVal.Number>;
  evalBool: SimpleEval<ExprVal.Boolean>;
  evalAny: SimpleEval<ExprVal.Any>;
  evalTrb: () => {
    textResourceBindings: ExprResolved<ITextResourceBindingsExternal<Type>>;
  };
}

export abstract class AnyComponent<Type extends CompTypes> {
  protected readonly type: Type;

  /**
   * Given properties from GenericComponent, render this layout component
   */
  abstract render:
    | ReturnType<typeof React.forwardRef<HTMLElement, PropsFromGenericComponent<Type>>>
    | ((props: PropsFromGenericComponent<Type>) => JSX.Element | null);

  /**
   * Render a node generator for this component. This can be overridden if you want to extend
   * the default node generator with additional functionality.
   */
  renderNodeGenerator(props: NodeGeneratorProps<Type>): JSX.Element | null {
    return <DefaultNodeGenerator {...props} />;
  }

  /**
   * Creates the zustand store default state for a node of this component type. Usually this is implemented
   * automatically by code generation, but you can override it if you need to add additional properties to the state.
   */
  abstract stateFactory(props: StateFactoryProps<Type>): unknown;

  /**
   * Picks a (direct) child state from the nodes store, returning the item store for that child. This must be
   * implemented for every component type that can adopt children.
   */
  public pickChild<C extends CompTypes>(
    _state: ItemStore<Type>,
    _childId: string,
    _parentPath: string[],
  ): ItemStore<C> {
    throw new Error(
      `pickChild() is not implemented yet for '${this.type}'. ` +
        `You have to implement this if the component type supports children.`,
    );
  }

  /**
   * Picks all direct children of a node, returning an array of item stores for each child. This must be implemented for
   * every component type that can adopt children.
   */
  public pickDirectChildren(_state: ItemStore<Type>, _restriction?: ChildLookupRestriction): NodeRef[] {
    return [];
  }

  /**
   * Adds a child node to the parent node. This must be implemented for every component type that can adopt children.
   */
  public addChild(_state: ItemStore<Type>, _childNode: LayoutNode, _childStore: ItemStore): void {
    throw new Error(
      `addChild() is not implemented yet for '${this.type}'. ` +
        `You have to implement this if the component type supports children.`,
    );
  }

  /**
   * Removes a child node from the parent node. This must be implemented for every component
   * type that can adopt children.
   */
  public removeChild(_state: ItemStore<Type>, _childNode: LayoutNode): void {
    throw new Error(
      `removeChild() is not implemented yet for '${this.type}'. ` +
        `You have to implement this if the component type supports children.`,
    );
  }

  /**
   * The default expression evaluator, implemented by code generation. Do not try to override this yourself. If you
   * need custom expression support, set that in your component configuration.
   */
  abstract evalDefaultExpressions(props: ExprResolver<Type>): unknown;

  /**
   * Resolves all expressions in the layout configuration, and returns a new layout configuration
   * with expressions resolved. Will either be implemented using code generation (if your component has no custom
   * expressions), or must be implemented manually.
   */
  abstract evalExpressions(props: ExprResolver<Type>): unknown;

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

  shouldRenderInAutomaticPDF(node: LayoutNode<Type>): boolean {
    if (!('renderAsSummary' in node.item)) {
      return true;
    }

    return !node.item.renderAsSummary;
  }

  /**
   * Return false to prevent this component from being rendered in a table
   * Should be configured as a capability in the component configuration (config.ts)
   */
  canRenderInTable() {
    return getComponentCapabilities(this.type).renderInTable;
  }

  /**
   * Return true to allow this component to be rendered in a ButtonGroup
   * Should be configured as a capability in the component configuration (config.ts)
   */
  canRenderInButtonGroup() {
    return getComponentCapabilities(this.type).renderInButtonGroup;
  }

  /**
   * Return true to allow this component to be rendered in an Accordion
   */
  canRenderInAccordion() {
    return getComponentCapabilities(this.type).renderInAccordion;
  }

  /**
   * Return true to allow this component to be rendered in an AccordionGroup
   */
  canRenderInAccordionGroup() {
    return getComponentCapabilities(this.type).renderInAccordionGroup;
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
   * Base implementation of validateLayoutConfing.
   * Override this if you need to use a more specific pointer
   * or modify/filter errors before returning them.
   */
  validateLayoutConfing(
    component: CompExternalExact<Type>,
    validatate: (pointer: string | null, data: unknown) => ErrorObject[] | undefined,
  ): ErrorObject[] | undefined {
    const schemaPointer = '#/definitions/AnyComponent';
    return validatate(schemaPointer, component);
  }
}

export abstract class PresentationComponent<Type extends CompTypes> extends AnyComponent<Type> {
  readonly category = CompCategory.Presentation;
}

export interface SummaryRendererProps<Type extends CompTypes> {
  summaryNode: LayoutNode<'Summary'>;
  targetNode: LayoutNode<Type>;
  formDataSelector: FormDataSelector;
  onChangeClick: () => void;
  changeText: string | null;
  overrides?: ISummaryComponent['overrides'];
}

abstract class _FormComponent<Type extends CompTypes> extends AnyComponent<Type> implements DisplayData<Type> {
  /**
   * Given a node (with group-index-aware data model bindings), this method should return a proper 'value' for the
   * current component/node. This value will be used to display form data in a repeating group table, and when rendering
   * a Summary for the node inside a repeating group. It will probably also be useful when implementing renderSummary().
   * @see renderSummary
   * @see renderCompactSummary
   */
  abstract getDisplayData(node: LayoutNode<Type>, item: CompInternal<Type>, displayDataProps: DisplayDataProps): string;

  useDisplayData(node: LayoutNode<Type>): string {
    const displayDataProps = useDisplayDataProps();
    const item = useNodeItem(node);
    return this.getDisplayData(node, item as any, displayDataProps);
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

  /**
   * Return true if this component requires data model bindings to be configured
   */
  public isDataModelBindingsRequired(_node: LayoutNode<Type>): boolean {
    return true;
  }

  /**
   * Runs validation on data model bindings. Returns an array of error messages.
   */
  public abstract validateDataModelBindings(ctx: LayoutValidationCtx<Type>): string[];

  protected validateDataModelBindingsAny(
    ctx: LayoutValidationCtx<Type>,
    key: string,
    validTypes: string[],
    isRequired = this.isDataModelBindingsRequired(ctx.node),
    name = key,
  ): [string[], undefined] | [undefined, JSONSchema7] {
    const { item, lookupBinding } = ctx;
    const value = ((item.dataModelBindings as any) || {})[key] || '';

    if (!value) {
      if (isRequired) {
        return [
          [`En ${name} datamodell-binding er påkrevd for denne komponenten, men mangler i layout-konfigurasjonen.`],
          undefined,
        ];
      }
      return [[], undefined];
    }

    const [result, error] = lookupBinding(value);
    if (error) {
      return [[lookupErrorAsText(error)], undefined];
    }

    const { type } = result;
    if (typeof type !== 'string') {
      return [[`${name}-datamodellbindingen peker mot en ukjent type i datamodellen`], undefined];
    }

    if (!validTypes.includes(type)) {
      return [
        [
          `${name}-datamodellbindingen peker mot en type definert som ${type} i datamodellen, ` +
            `men burde være en av ${validTypes.join(', ')}`,
        ],
        undefined,
      ];
    }

    return [undefined, result];
  }

  protected validateDataModelBindingsSimple(
    ctx: LayoutValidationCtx<Type>,
    isRequired = this.isDataModelBindingsRequired(ctx.node),
  ): string[] {
    const [errors] = this.validateDataModelBindingsAny(
      ctx,
      'simpleBinding',
      ['string', 'number', 'integer', 'boolean'],
      isRequired,
      'simple',
    );

    return errors || [];
  }

  protected validateDataModelBindingsList(
    ctx: LayoutValidationCtx<Type>,
    isRequired = this.isDataModelBindingsRequired(ctx.node),
  ): string[] {
    const [errors, result] = this.validateDataModelBindingsAny(ctx, 'list', ['array'], isRequired);
    if (errors) {
      return errors;
    }

    if (
      !result.items ||
      typeof result.items !== 'object' ||
      Array.isArray(result.items) ||
      !result.items.type ||
      result.items.type !== 'string'
    ) {
      return [`list-datamodellbindingen peker mot en ukjent type i datamodellen`];
    }

    return [];
  }
}

export abstract class ActionComponent<Type extends CompTypes> extends AnyComponent<Type> {
  readonly category = CompCategory.Action;

  shouldRenderInAutomaticPDF() {
    return false;
  }
}

export abstract class FormComponent<Type extends CompTypes>
  extends _FormComponent<Type>
  implements ValidateEmptyField<Type>
{
  readonly category = CompCategory.Form;

  runEmptyFieldValidation(
    node: LayoutNode<Type>,
    item: CompInternal<Type>,
    { formData, invalidData }: ValidationDataSources,
  ): ComponentValidation[] {
    if (!('required' in item) || !item.required || !item.dataModelBindings) {
      return [];
    }

    const validations: ComponentValidation[] = [];

    for (const [bindingKey, field] of Object.entries(item.dataModelBindings) as [string, string][]) {
      const data = dot.pick(field, formData) ?? dot.pick(field, invalidData);
      const asString =
        typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' ? String(data) : '';
      const trb: ITextResourceBindings = 'textResourceBindings' in item ? item.textResourceBindings : {};

      if (asString.length === 0) {
        const key =
          trb && 'requiredValidation' in trb && trb.requiredValidation
            ? trb.requiredValidation
            : 'form_filler.error_required';
        const fieldReference = { key: getFieldNameKey(trb, bindingKey), makeLowerCase: true };

        validations.push({
          componentId: node.getId(),
          source: FrontendValidationSource.EmptyField,
          bindingKey,
          message: { key, params: [fieldReference] },
          severity: 'error',
          category: ValidationMask.Required,
        });
      }
    }
    return validations;
  }
}

export interface ComponentProto {
  type: CompTypes;
  def: CompDef;
}

export interface ChildClaimerProps<Type extends CompTypes> {
  item: CompExternal<Type>;
  claimChild: (id: string) => void;
  getProto: (id: string) => ComponentProto | undefined;
}

export abstract class ContainerComponent<Type extends CompTypes> extends _FormComponent<Type> {
  readonly category = CompCategory.Container;

  isDataModelBindingsRequired(_node: LayoutNode<Type>): boolean {
    return false;
  }

  abstract claimChildren(props: ChildClaimerProps<Type>): void;

  abstract pickChild<C extends CompTypes>(state: ItemStore<Type>, childId: string, parentPath: string[]): ItemStore<C>;

  abstract pickDirectChildren(state: ItemStore<Type>, restriction?: ChildLookupRestriction): NodeRef[];

  abstract addChild(state: ItemStore<Type>, childNode: LayoutNode, childStore: ItemStore): void;

  abstract removeChild(state: ItemStore<Type>, childNode: LayoutNode): void;
}

export type LayoutComponent<Type extends CompTypes = CompTypes> =
  | PresentationComponent<Type>
  | FormComponent<Type>
  | ActionComponent<Type>
  | ContainerComponent<Type>;
