import type { PropsFromGenericComponent } from 'src/layout/index';
import type { ComponentExceptGroupAndSummary } from 'src/layout/layout';

export abstract class LayoutComponent<Type extends ComponentExceptGroupAndSummary> {
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
}
