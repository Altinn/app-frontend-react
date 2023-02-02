import type { IFooterComponent } from 'src/features/footer/components/types';
import type { IFooterComponentType } from 'src/features/footer/types';

export abstract class FooterComponent<T extends IFooterComponent<IFooterComponentType>> {
  private props: T;

  protected abstract renderComponent: (props: T) => JSX.Element | null;

  public constructor(props: T) {
    this.props = props;
  }

  public render() {
    return this.renderComponent(this.props);
  }
}
