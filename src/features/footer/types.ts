import type { IFooterEmailComponent } from 'src/features/footer/components/Email/types';
import type { IFooterLinkComponent } from 'src/features/footer/components/Link/types';
import type { IFooterPhoneComponent } from 'src/features/footer/components/Phone/types';
import type { IFooterTextComponent } from 'src/features/footer/components/Text/types';

export type IFooterIcon = 'information' | 'email' | 'phone';

export interface IFooterBaseComponent<T extends IFooterComponentType> {
  type: T;
}

interface IFooterComponentMap {
  Email: IFooterEmailComponent;
  Link: IFooterLinkComponent;
  Phone: IFooterPhoneComponent;
  Text: IFooterTextComponent;
}

export type IFooterComponentType = keyof IFooterComponentMap;
export type IFooterComponent<T extends IFooterComponentType> = IFooterComponentMap[T];

export interface IFooterLayout {
  footer: IFooterComponent<IFooterComponentType>[];
}
