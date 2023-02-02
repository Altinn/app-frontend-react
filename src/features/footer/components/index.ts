import { FooterEmailComponent } from 'src/features/footer/components/Email';
import { FooterLinkComponent } from 'src/features/footer/components/Link';
import { FooterPhoneComponent } from 'src/features/footer/components/Phone';
import { FooterTextComponent } from 'src/features/footer/components/Text';
import type { IFooterComponent, IFooterComponentType } from 'src/features/footer/components/types';

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

type IFooterComponentMap = {
  [K in IFooterComponentType]: new (props: IFooterComponent<K>) => FooterComponent<IFooterComponent<K>>;
};

const FooterComponentMap: IFooterComponentMap = {
  Email: FooterEmailComponent,
  Link: FooterLinkComponent,
  Phone: FooterPhoneComponent,
  Text: FooterTextComponent,
};

export function createFooterComponent<T extends IFooterComponentType>(props: IFooterComponent<T>) {
  return new FooterComponentMap[props.type](props);
}
