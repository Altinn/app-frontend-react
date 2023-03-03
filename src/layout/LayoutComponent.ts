import { ComponentType } from 'src/layout/index';
import type { SummaryLookups } from 'src/components/summary/SummaryContext';
import type { PropsFromGenericComponent } from 'src/layout/index';
import type { ComponentExceptGroupAndSummary, ComponentTypes } from 'src/layout/layout';
import type { MaybeSpecificNodeFromType } from 'src/utils/layout/hierarchy.types';

abstract class AnyComponent<Type extends ComponentExceptGroupAndSummary> {
  /**
   * Given properties from GenericComponent, render this layout component
   */
  abstract render(props: PropsFromGenericComponent<Type>): JSX.Element | null;

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
   * Should GenericComponent render validation messages for simpleBinding outside of this component?
   * This has no effect if:
   *  - Your component renders directly, using directRender()
   *  - Your component uses a different data binding (you should handle validations yourself)
   */
  renderDefaultValidations(): boolean {
    return true;
  }

  /**
   * Is this a form component that has formData and should be displayed differently in summary/pdf?
   * Purely presentational components with no interaction should override and return ComponentType.Presentation.
   */
  abstract getComponentType(): ComponentType;
}

export abstract class PresentationComponent<Type extends ComponentExceptGroupAndSummary> extends AnyComponent<Type> {
  readonly getComponentType = (): ComponentType => {
    return ComponentType.Presentation;
  };
}

export interface SummaryRendererProps<Type extends ComponentTypes> {
  targetNode: MaybeSpecificNodeFromType<Type>;
  lookups: SummaryLookups; // PRIORITY: Get this from the context, not directly from props?
}

export abstract class FormComponent<Type extends ComponentExceptGroupAndSummary> extends AnyComponent<Type> {
  readonly getComponentType = (): ComponentType => {
    return ComponentType.Form;
  };

  /**
   * Given a node (with group-index-aware data model bindings) and some form data, this method should return
   * a proper 'value' for the current component/node. This is the same value as is passed to renderSummary().
   * PRIORITY: This will be used primarily from repeating groups table overview, not summary. Change it to match that.
   */
  abstract getDisplayData(props: SummaryRendererProps<Type>): string;

  /**
   * Given some SummaryData, render a summary for this component. For most components, this will either:
   *  1. Return a null (indicating that it's not possible to summarize the value in this component, or that it cannot
   *     possibly have a value attached to it). This is used for static components such as Header, Paragraph, Button.
   *     Hint: Your component is probably a PresentationLayoutComponent. Inherit that instead to avoid having to
   *     implement this.
   *  2. Return a <StringSummary node={node} data={data} />, for when the summary can be simply rendered as a string.
   */
  abstract renderSummary(props: SummaryRendererProps<Type>): JSX.Element | null;
}

export abstract class ActionComponent<Type extends ComponentExceptGroupAndSummary> extends AnyComponent<Type> {
  readonly getComponentType = (): ComponentType => {
    return ComponentType.Action;
  };
}

export type LayoutComponent<Type extends ComponentExceptGroupAndSummary> =
  | PresentationComponent<Type>
  | FormComponent<Type>
  | ActionComponent<Type>;
