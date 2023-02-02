import { FooterEmailComponent } from 'src/features/footer/components/Email';
import { FooterLinkComponent } from 'src/features/footer/components/Link';
import { FooterPhoneComponent } from 'src/features/footer/components/Phone';
import { FooterTextComponent } from 'src/features/footer/components/Text';
import type { FooterComponent } from 'src/features/footer/components';
import type { IFooterComponent } from 'src/features/footer/components/types';
import type { IFooterComponentType } from 'src/features/footer/types';

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
