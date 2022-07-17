import { AddressComponent as Address } from './advanced/AddressComponent';
import { AttachmentListComponent } from './base/AttachmentListComponent';
import { ButtonComponent } from './base/ButtonComponent';
import { CheckboxContainerComponent } from './base/CheckboxesContainerComponent';
import DatepickerComponent from './base/DatepickerComponent';
import DropdownComponent from './base/DropdownComponent';
import { FileUploadComponent } from './base/FileUpload/FileUploadComponent';
import { FileUploadWithTagComponent } from './base/FileUpload/FileUploadWithTag/FileUploadWithTagComponent';
import { HeaderComponent } from './base/HeaderComponent';
import { InputComponent } from './base/InputComponent';
import { ParagraphComponent } from './base/ParagraphComponent';
import { RadioButtonContainerComponent } from './base/RadioButtons/RadioButtonsContainerComponent';
import { TextAreaComponent } from './base/TextAreaComponent';
import { ImageComponent } from './base/ImageComponent';
import { NavigationButtons as NavigationButtonsComponent } from './presentation/NavigationButtons';
import { NavigationBar as NavigationBarComponent } from './base/NavigationBar';
import { PanelComponent } from './base/PanelComponent';
import { InstantiationButtonComponent } from './base/InstantiationButtonComponent';
import type { IGenericComponentProps } from './GenericComponent';
import type { ILanguage } from 'altinn-shared/types';
import type {
  IGrid,
  ComponentExceptGroupAndSummary,
} from 'src/features/form/layout';
import { createContext } from 'react';
import { LikertComponent } from 'src/components/base/LikertComponent';
import { PrintButtonComponent } from './base/PrintButtonComponent';
import CustomComponent from './custom/CustomWebComponent';

export interface IComponent<Props> {
  Tag: (props: Props) => JSX.Element;
  customProperties?: Partial<Props>;
}

/**
 * This function only returns the component definition, but by inferring the Props type, it will give you
 * auto-completion for the customProperties argument.
 */
function using<Props>(
  tag: IComponent<Props>['Tag'],
  customProperties?: IComponent<Props>['customProperties'],
): IComponent<Props> {
  return {
    Tag: tag,
    customProperties: customProperties,
  };
}

const components: {
  [Type in ComponentExceptGroupAndSummary]: IComponent<any>;
} = {
  Header: using(HeaderComponent),
  Paragraph: using(ParagraphComponent),
  Image: using(ImageComponent),
  Input: using(InputComponent, {
    required: false,
    readOnly: false,
  }),
  DatePicker: using(DatepickerComponent, {
    readOnly: false,
    minDate: '1900-01-01T12:00:00.000Z',
    maxDate: '2100-01-01T12:00:00.000Z',
  }),
  Dropdown: using(DropdownComponent, {
    options: [],
  }),
  Checkboxes: using(CheckboxContainerComponent, {
    options: [],
    required: false,
    readOnly: false,
  }),
  RadioButtons: using(RadioButtonContainerComponent, {
    options: [],
    required: false,
    readOnly: false,
  }),
  TextArea: using(TextAreaComponent, {
    required: false,
    readOnly: false,
  }),
  FileUpload: using(FileUploadComponent),
  FileUploadWithTag: using(FileUploadWithTagComponent),
  Button: using(ButtonComponent),
  NavigationButtons: using(NavigationButtonsComponent),
  InstantiationButton: using(InstantiationButtonComponent),
  AttachmentList: using(AttachmentListComponent),
  NavigationBar: using(NavigationBarComponent),
  Likert: using(LikertComponent),
  Panel: using(PanelComponent),
  PrintButton: using(PrintButtonComponent),
  AddressComponent: using(Address, {
    simplified: true,
    readOnly: false,
  }),
  Custom: using(CustomComponent),
};

export interface IComponentProps extends IGenericComponentProps {
  handleDataChange: (
    value: string,
    key?: string,
    skipValidation?: boolean,
    checkIfRequired?: boolean,
  ) => void;
  handleFocusUpdate: (componentId: string, step?: number) => void;
  getTextResource: (key: string) => React.ReactNode;
  getTextResourceAsString: (key: string) => string;
  language: ILanguage;
  shouldFocus: boolean;
  text: React.ReactNode;
  label: () => JSX.Element;
  legend: () => JSX.Element;
}

export interface IFormComponentContext {
  grid?: IGrid;
  baseComponentId?: string;
}

export const FormComponentContext = createContext<IFormComponentContext>({
  grid: undefined,
  baseComponentId: undefined,
});

export default components;
