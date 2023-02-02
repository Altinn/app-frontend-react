export type IFooterComponentType = 'Email' | 'Link' | 'Phone' | 'Text';

export interface IFooterComponent<T extends IFooterComponentType> {
  type: T;
}

export type IFooterLayout = IFooterComponent[];

export type IFooterIcon = 'information' | 'email' | 'phone';
