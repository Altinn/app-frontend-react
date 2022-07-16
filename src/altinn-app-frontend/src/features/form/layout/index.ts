import type { GridSize, GridJustification } from '@material-ui/core';
import type {
  IMapping,
  IOption,
  IOptionSource,
  Triggers,
  LayoutStyle,
} from '../../../types';
import type { NumberFormatProps } from 'react-number-format';
import type { IComponentFormData } from 'src/utils/formComponentUtils';

export interface ILayouts {
  [id: string]: ILayout;
}

export interface ILayoutEntry<T extends ComponentTypes = ComponentTypes> {
  id: string;
  baseComponentId?: string;
  type: T;
  triggers?: Triggers[];
}

export interface ILayoutGroup extends ILayoutCompBase<'Group'> {
  children: string[];
  maxCount?: number;
  tableHeaders?: string[];
  edit?: IGroupEditProperties;
  panel?: IGroupPanel;
}

export interface IGroupPanel {
  variant?: string;
  showIcon?: boolean;
  iconUrl?: string;
  iconAlt?: string;
  groupReference?: IGroupReference;
}

export interface IGroupReference {
  group: string;
}

export interface ILayoutCompBase<Type extends ComponentTypes = ComponentTypes>
  extends ILayoutEntry<Type> {
  dataModelBindings?: IDataModelBindings;
  isValid?: boolean;
  readOnly?: boolean;
  optionsId?: string;
  options?: IOption[];
  disabled?: boolean;
  required?: boolean;
  textResourceBindings?: ITextResourceBindings;
  formData?: IComponentFormData;
  grid?: IGrid;
}
interface ILayoutCompWillBeSavedWhileTyping {
  saveWhileTyping?: boolean | number;
}

export interface ILayoutCompAddress
  extends ILayoutCompBase<'AddressComponent'>,
    ILayoutCompWillBeSavedWhileTyping {
  simplified?: boolean;
}

export interface ILayoutCompAttachmentList
  extends ILayoutCompBase<'AttachmentList'> {
  dataTypeIds?: string[];
}

export type ILayoutCompButton = ILayoutCompBase<'Button'>;

interface ISelectionComponent {
  options?: IOption[];
  optionsId?: string;
  mapping?: IMapping;
  secure?: boolean;
  source?: IOptionSource;
  preselectedOptionIndex?: number;
}

export interface IComponentRadioOrCheckbox<
  T extends Extract<ComponentTypes, 'RadioButtons' | 'Checkboxes' | 'Likert'>,
> extends ILayoutCompBase<T>,
    ISelectionComponent {
  layout?: LayoutStyle;
}

export type ILayoutCompCheckboxes = IComponentRadioOrCheckbox<'Checkboxes'>;
export type ILayoutCompRadioButtons = IComponentRadioOrCheckbox<'RadioButtons'>;
export type ILayoutCompLikert = IComponentRadioOrCheckbox<'Likert'>;

export interface ILayoutCompDatePicker extends ILayoutCompBase<'DatePicker'> {
  minDate?: string | 'today';
  maxDate?: string | 'today';
  timeStamp?: boolean;
  format?: string;
}

export type ILayoutCompDropdown = ILayoutCompBase<'Dropdown'> &
  ISelectionComponent;

export interface ILayoutCompFileUploadBase<
  T extends Extract<ComponentTypes, 'FileUpload' | 'FileUploadWithTag'>,
> extends ILayoutCompBase<T> {
  maxFileSizeInMB: number;
  maxNumberOfAttachments: number;
  minNumberOfAttachments: number;
  displayMode: 'simple' | 'list';
  hasCustomFileEndings?: boolean;
  validFileEndings?: string[] | string;
}

export type ILayoutCompFileUpload = ILayoutCompFileUploadBase<'FileUpload'>;

export interface ILayoutCompFileUploadWithTag
  extends ILayoutCompFileUploadBase<'FileUploadWithTag'> {
  optionsId: string;
  mapping?: IMapping;
}

export interface ILayoutCompHeader extends ILayoutCompBase<'Header'> {
  size: 'L' | 'M' | 'S' | 'h2' | 'h3' | 'h4';
}

export interface IInputFormatting {
  number?: NumberFormatProps;
  align?: 'right' | 'center' | 'left';
}

export interface ILayoutCompInput
  extends ILayoutCompBase<'Input'>,
    ILayoutCompWillBeSavedWhileTyping {
  formatting?: IInputFormatting;
}

export interface ILayoutCompNavButtons
  extends ILayoutCompBase<'NavigationButtons'> {
  showBackButton?: boolean;
}

export interface ILayoutCompInstantiationButton
  extends ILayoutCompBase<'InstantiationButton'> {
  mapping?: IMapping;
}

export type ILayoutCompParagraph = ILayoutCompBase<'Paragraph'>;

export interface IImage {
  src: IImageSrc;
  width: string;
  align: GridJustification;
}

export interface IImageSrc {
  nb: string;
  nn?: string;
  en?: string;
  [language: string]: string;
}

export interface ILayoutCompImage extends ILayoutCompBase<'Image'> {
  image?: IImage;
}

export interface ILayoutCompSummary extends ILayoutCompBase<'Summary'> {
  componentRef?: string;
  pageRef?: string;
}

export type ILayoutCompTextArea = ILayoutCompBase<'TextArea'> &
  ILayoutCompWillBeSavedWhileTyping;

export type ILayoutCompNavBar = ILayoutCompBase<'NavigationBar'>;

export type ILayoutCompPrintButton = ILayoutCompBase<'PrintButton'>;

export interface ILayoutCompPanel extends ILayoutCompBase<'Panel'> {
  variant?: 'info' | 'warning' | 'success';
  showIcon?: boolean;
}

export interface ILayoutCompCustom extends ILayoutCompBase<'Custom'> {
  tagName: string;
}

/**
 * This interface type defines all the possible components, along with their 'type' key and associated layout
 * definition. If you want to reference a particular component layout type you can either reference the individual
 * type (ex. ILayoutCompTextArea), or ILayoutComponent<'TextArea'>.
 */
interface Map {
  Group: ILayoutGroup;
  AddressComponent: ILayoutCompAddress;
  AttachmentList: ILayoutCompAttachmentList;
  Button: ILayoutCompButton;
  Checkboxes: ILayoutCompCheckboxes;
  DatePicker: ILayoutCompDatePicker;
  Dropdown: ILayoutCompDropdown;
  FileUpload: ILayoutCompFileUpload;
  FileUploadWithTag: ILayoutCompFileUploadWithTag;
  Header: ILayoutCompHeader;
  Input: ILayoutCompInput;
  NavigationButtons: ILayoutCompNavButtons;
  InstantiationButton: ILayoutCompInstantiationButton;
  Paragraph: ILayoutCompParagraph;
  Image: ILayoutCompImage;
  RadioButtons: ILayoutCompRadioButtons;
  Summary: ILayoutCompSummary;
  TextArea: ILayoutCompTextArea;
  NavigationBar: ILayoutCompNavBar;
  Likert: ILayoutCompLikert;
  PrintButton: ILayoutCompPrintButton;
  Panel: ILayoutCompPanel;
  Custom: ILayoutCompCustom;
}

type ComponentTypes = keyof Map;
type AllComponents = Map[ComponentTypes];

export type ComponentExceptGroup = Exclude<ComponentTypes, 'Group'>;

/**
 * This type can be used to reference the layout declaration for a component. You can either use it to specify
 * any valid component:
 *
 *  const myComponent:ILayoutComponent = ...
 *
 * Or a component of a specific known type (gives you more valid options):
 *
 *  const myImageComponent:ILayoutComponent<ComponentTypes.Image> = ...
 *
 */
export type ILayoutComponent<
  Type extends ComponentExceptGroup = ComponentExceptGroup,
> = Extract<AllComponents, { type: Type }>;

export type ILayoutComponentOrGroup<
  Type extends ComponentTypes = ComponentTypes,
> = Type extends 'Group'
  ? ILayoutGroup
  : Extract<AllComponents, { type: Type }>;

export interface IDataModelBindingsSimple {
  simpleBinding: string;
}

export interface IDataModelBindingsForGroup {
  group: string;
}

/**
 * A middle ground between group and simple bindings, a list binding can be used to
 * store a list of primitive values, like string[].
 */
export interface IDataModelBindingsList {
  list: string;
}

export interface IDataModelBindingsForAddress {
  address: string;
  zipCode: string;
  postPlace: string;
  careOf?: string;
  houseNumber?: string;
}

export type IDataModelBindings = Partial<IDataModelBindingsSimple> &
  Partial<IDataModelBindingsList> &
  Partial<IDataModelBindingsForGroup> &
  Partial<IDataModelBindingsForAddress>;

export interface ITextResourceBindings {
  [id: string]: string;
}

export type ILayout = Array<ILayoutComponentOrGroup>;

export type ISelectionComponentProps =
  | ILayoutCompRadioButtons
  | ILayoutCompCheckboxes
  | ILayoutCompLikert
  | ILayoutCompDropdown;

export interface IGrid extends IGridStyling {
  labelGrid?: IGridStyling;
  innerGrid?: IGridStyling;
}

export interface IGridStyling {
  xs?: GridSize;
  sm?: GridSize;
  md?: GridSize;
  lg?: GridSize;
  xl?: GridSize;
}

export interface IGroupEditProperties {
  mode?: 'hideTable' | 'showTable' | 'showAll' | 'likert';
  filter?: IGroupFilter[];
  addButton?: boolean;
  saveButton?: boolean;
  deleteButton?: boolean;
  multiPage?: boolean;
  openByDefault?: boolean;
}

export interface IGroupFilter {
  key: string;
  value: string;
}
