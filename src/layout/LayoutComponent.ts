import type { PropsFromGenericComponent } from 'src/layout/index';
import type { ComponentExceptGroupAndSummary } from 'src/layout/layout';

export abstract class LayoutComponent<Type extends ComponentExceptGroupAndSummary> {
  public abstract render(props: PropsFromGenericComponent<Type>): JSX.Element | null;
}
