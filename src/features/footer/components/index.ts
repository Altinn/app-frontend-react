import { FooterEmailComponent } from 'src/features/footer/components/Email';
import { FooterLinkComponent } from 'src/features/footer/components/Link';
import { FooterPhoneComponent } from 'src/features/footer/components/Phone';
import { FooterTextComponent } from 'src/features/footer/components/Text';
import type { IFooterComponent, IFooterComponentType } from 'src/features/footer/types.d';

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

export function createFooterComponent(props: IFooterComponent<IFooterComponentType>) {
  switch (props.type) {
    case 'Email':
      return new FooterEmailComponent(props);
    case 'Link':
      return new FooterLinkComponent(props);
    case 'Phone':
      return new FooterPhoneComponent(props);
    case 'Text':
      return new FooterTextComponent(props);
    default:
      return null;
  }
}
