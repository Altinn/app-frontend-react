export type IFooterComponentType = 'Email' | 'Link' | 'Phone' | 'Text';
export type IFooterIcon = 'information' | 'email' | 'phone';

interface IFooterBaseComponent<T extends IFooterComponentType> {
  type: T;
}

export interface IFooterEmailComponent extends IFooterBaseComponent<'Email'> {
  title: string;
  target: string;
  icon?: IFooterIcon;
}

export interface IFooterLinkComponent extends IFooterBaseComponent<'Link'> {
  title: string;
  target: string;
  icon?: IFooterIcon;
}

export interface IFooterPhoneComponent extends IFooterBaseComponent<'Phone'> {
  title: string;
  target: string;
  icon?: IFooterIcon;
}

export interface IFooterTextComponent extends IFooterBaseComponent<'Text'> {
  title: string;
}

interface IFooterComponents {
  Email: IFooterEmailComponent;
  Link: IFooterLinkComponent;
  Phone: IFooterPhoneComponent;
  Text: IFooterTextComponent;
}

export type IFooterComponent<T> = IFooterComponents[T];

export type IFooterLayout = IFooterBaseComponent[];
