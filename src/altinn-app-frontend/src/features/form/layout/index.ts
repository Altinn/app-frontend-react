import type { GridSize, GridJustification } from '@material-ui/core';
import type {
  IMapping,
  IOption,
  IOptionSource,
  Triggers,
} from '../../../types';
import type { NumberFormatProps } from 'react-number-format';

export interface ILayouts {
  [id: string]: ILayout;
}

export interface ILayoutEntry<T extends ComponentTypes> {
  id: string;
  baseComponentId?: string;
  type: T;
  triggers?: Triggers[];
}

export interface ILayoutGroup extends IBaseComp<'Group'> {
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

interface IBaseComp<Type extends ComponentTypes> extends ILayoutEntry<Type> {
  dataModelBindings?: IDataModelBindings;
  isValid?: boolean;
  readOnly?: boolean;
  optionsId?: string;
  options?: IOption[];
  disabled?: boolean;
  required?: boolean;
  textResourceBindings?: ITextResourceBindings;
  formData?: any;
  grid?: IGrid;
}
interface ILayoutCompWillBeSavedWhileTyping {
  saveWhileTyping?: boolean | number;
}

export interface ILayoutCompAddress
  extends IBaseComp<'AddressComponent'>,
    ILayoutCompWillBeSavedWhileTyping {
  simplified?: boolean;
}

export interface ILayoutCompAttachmentList extends IBaseComp<'AttachmentList'> {
  dataTypeIds?: string[];
}

export type ILayoutCompButton = IBaseComp<'Button'>;

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
> extends IBaseComp<T>,
    ISelectionComponent {
  layout?: 'column' | 'row' | 'table';
}

export type ILayoutCompCheckboxes = IComponentRadioOrCheckbox<'Checkboxes'>;
export type ILayoutCompRadioButtons = IComponentRadioOrCheckbox<'RadioButtons'>;
export type ILayoutCompLikert = IComponentRadioOrCheckbox<'Likert'>;

export interface ILayoutCompDatePicker extends IBaseComp<'DatePicker'> {
  minDate?: string | 'today';
  maxDate?: string | 'today';
  timeStamp?: boolean;
  format?: string;
}

export type ILayoutCompDropdown = IBaseComp<'Dropdown'> & ISelectionComponent;

export interface ILayoutCompFileUploadBase<
  T extends Extract<ComponentTypes, 'FileUpload' | 'FileUploadWithTag'>,
> extends IBaseComp<T> {
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

export interface ILayoutCompHeader extends IBaseComp<'Header'> {
  size: 'L' | 'M' | 'S' | 'h2' | 'h3' | 'h4';
}

export interface IInputFormatting {
  number?: NumberFormatProps;
  align?: 'right' | 'center' | 'left';
}

export interface ILayoutCompInput
  extends IBaseComp<'Input'>,
    ILayoutCompWillBeSavedWhileTyping {
  formatting?: IInputFormatting;
}

export type ILayoutCompNavButtons = IBaseComp<'NavigationButtons'>;

export interface ILayoutCompInstantiationButton
  extends IBaseComp<'InstantiationButton'> {
  mapping?: IMapping;
}

export type ILayoutCompParagraph = IBaseComp<'Paragraph'>;

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

export interface ILayoutCompImage extends IBaseComp<'Image'> {
  image?: IImage;
}

export interface ILayoutCompSummary extends IBaseComp<'Summary'> {
  componentRef?: string;
  pageRef?: string;
}

export type ILayoutCompTextArea = IBaseComp<'TextArea'> &
  ILayoutCompWillBeSavedWhileTyping;

export type ILayoutCompNavBar = IBaseComp<'NavigationBar'>;

export interface ILayoutCompPanel extends IBaseComp<'Panel'> {
  variant?: 'info' | 'warning' | 'success';
  showIcon?: boolean;
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
  Panel: ILayoutCompPanel;
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
