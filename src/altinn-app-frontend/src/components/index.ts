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
import type { IGrid } from 'src/features/form/layout';
import { createContext } from 'react';
import { LikertComponent } from 'src/components/base/LikertComponent';
import { PrintButtonComponent } from './base/PrintButtonComponent';
import CustomComponent from './custom/CustomWebComponent';

export interface IComponent {
  name: string;
  Tag: (props: IComponentProps) => JSX.Element;
  Type: ComponentTypes;
  customProperties?: any;
}

// The order here should be the same as
// the exported 'components' list (drag and drop)
export enum ComponentTypes {
  Header = 'Header',
  Paragraph = 'Paragraph',
  Image = 'Image',
  Input = 'Input',
  Datepicker = 'Datepicker',
  DropDown = 'Dropdown',
  CheckBox = 'Checkboxes',
  RadioButton = 'RadioButtons',
  TextArea = 'TextArea',
  FileUpload = 'FileUpload',
  FileUploadWithTag = 'FileUploadWithTag',
  Button = 'Button',
  Group = 'Group',
  AddressComponent = 'AddressComponent',
  NavigationButtons = 'NavigationButtons',
  InstantiationButton = 'InstantiationButton',
  AttachmentList = 'AttachmentList',
  NavigationBar = 'NavigationBar',
  Likert = 'Likert',
  Panel = 'Panel',
  Custom = 'Custom',
  PrintButton = 'PrintButton',
  Summary = 'Summary',
}

export const textComponents: IComponent[] = [
  {
    name: 'Header',
    Tag: HeaderComponent,
    Type: ComponentTypes.Header,
  },
  {
    name: 'Paragraph',
    Tag: ParagraphComponent,
    Type: ComponentTypes.Paragraph,
  },
];

export const schemaComponents: IComponent[] = [
  {
    name: 'Image',
    Tag: ImageComponent,
    Type: ComponentTypes.Image,
  },
  {
    name: 'Input',
    Tag: InputComponent,
    Type: ComponentTypes.Input,
    customProperties: {
      required: false,
      readOnly: false,
    },
  },
  {
    name: 'Datepicker',
    Tag: DatepickerComponent,
    Type: ComponentTypes.Datepicker,
    customProperties: {
      readOnly: false,
      minDate: '1900-01-01T12:00:00.000Z',
      maxDate: '2100-01-01T12:00:00.000Z',
    },
  },
  {
    name: 'Dropdown',
    Tag: DropdownComponent,
    Type: ComponentTypes.DropDown,
    customProperties: {
      options: [],
    },
  },
  {
    name: 'Checkboxes',
    Tag: CheckboxContainerComponent,
    Type: ComponentTypes.CheckBox,
    customProperties: {
      options: [],
      required: false,
      readOnly: false,
    },
  },
  {
    name: 'RadioButtons',
    Tag: RadioButtonContainerComponent,
    Type: ComponentTypes.RadioButton,
    customProperties: {
      options: [],
      required: false,
      readOnly: false,
    },
  },
  {
    name: 'TextArea',
    Tag: TextAreaComponent,
    Type: ComponentTypes.TextArea,
    customProperties: {
      required: false,
      readOnly: false,
    },
  },
  {
    name: 'FileUpload',
    Tag: FileUploadComponent,
    Type: ComponentTypes.FileUpload,
  },
  {
    name: 'FileUploadWithTag',
    Tag: FileUploadWithTagComponent,
    Type: ComponentTypes.FileUploadWithTag,
  },
  {
    name: 'Button',
    Tag: ButtonComponent,
    Type: ComponentTypes.Button,
  },
  {
    name: 'NavigationButtons',
    Tag: NavigationButtonsComponent,
    Type: ComponentTypes.NavigationButtons,
  },
  {
    name: 'InstantiationButton',
    Tag: InstantiationButtonComponent,
    Type: ComponentTypes.InstantiationButton,
  },
  {
    name: 'AttachmentList',
    Tag: AttachmentListComponent,
    Type: ComponentTypes.AttachmentList,
  },
  {
    name: 'NavigationBar',
    Tag: NavigationBarComponent,
    Type: ComponentTypes.NavigationBar,
  },
  {
    name: 'Likert',
    Tag: LikertComponent,
    Type: ComponentTypes.Likert,
  },
  {
    name: 'Panel',
    Tag: PanelComponent,
    Type: ComponentTypes.Panel,
  },
  {
    name: 'PrintButton',
    Tag: PrintButtonComponent,
    Type: ComponentTypes.PrintButton,
  },
];

export const advancedComponents: IComponent[] = [
  {
    name: 'AddressComponent',
    Tag: Address,
    Type: ComponentTypes.AddressComponent,
    customProperties: {
      simplified: true,
      readOnly: false,
    },
  },
  {
    name: 'Custom',
    Tag: CustomComponent,
    Type: ComponentTypes.Custom,
  },
];

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

export interface IAutoSavedComponentProps extends IComponentProps {
  saveWhileTyping?: number | boolean;
}

const components: IComponent[] = textComponents.concat(
  schemaComponents,
  advancedComponents,
);

export interface IFormComponentContext {
  grid?: IGrid;
  baseComponentId?: string;
}

export const FormComponentContext = createContext<IFormComponentContext>({
  grid: undefined,
  baseComponentId: undefined,
});

export default components;
