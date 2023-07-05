import type { ILayoutCompBase, ILayoutCompWillBeSavedWhileTyping } from 'src/layout/layout';

type ValidTexts = undefined;
export interface ILayoutCompAddress
  extends ILayoutCompBase<'AddressComponent', IDataModelBindingsForAddress, ValidTexts>,
    ILayoutCompWillBeSavedWhileTyping {
  simplified?: boolean;
}

export interface IDataModelBindingsForAddress {
  // Usually required, but we need to check
  address?: string;
  zipCode?: string;
  postPlace?: string;

  // Optional fields
  careOf?: string;
  houseNumber?: string;
}
