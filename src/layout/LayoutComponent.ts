import type { PropsFromGenericComponent } from 'src/layout/index';
import type { ComponentExceptGroupAndSummary } from 'src/layout/layout';

export abstract class LayoutComponent<Type extends ComponentExceptGroupAndSummary> {
  /**
   * Given properties from GenericComponent, render this layout component
   */
  public abstract render(props: PropsFromGenericComponent<Type>): JSX.Element | null;

  /**
   * Direct render? Override this and return true if you want GenericComponent to omit rendering grid,
   * validation messages, etc.
   */
  public directRender(_props: PropsFromGenericComponent<Type>): boolean {
    return false;
  }
}
