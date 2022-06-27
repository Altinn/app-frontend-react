import type { IIsLoadingState } from "src/shared/resources/isLoading/isLoadingSlice";
import type { IOptionsState } from "src/shared/resources/options/optionsReducer";
import type { IFormRuleState } from "src/features/form/rules/rulesReducer";
import type { IDataModelState } from "src/features/form/datamodel/datamodelSlice";
import type { ReactNode } from "react";
import type Ajv from "ajv/dist/core";
import type { IFormDataState } from "../features/form/data/formDataReducer";
import type { IFormDynamicState } from "../features/form/dynamics";
import type { ILayoutState } from "../features/form/layout/formLayoutSlice";
import type { IValidationState } from "../features/form/validation/validationSlice";
import type { IInstantiationState } from "../features/instantiate/instantiation/reducer";
import type { IApplicationMetadataState } from "../shared/resources/applicationMetadata/reducer";
import type { IAttachmentState } from "../shared/resources/attachments/attachmentReducer";
import type { IInstanceDataState } from "../shared/resources/instanceData/instanceDataReducers";
import type { ILanguageState } from "../shared/resources/language/languageSlice";
import type { IOrgsState } from "../shared/resources/orgs/orgsReducers";
import type { IPartyState } from "../shared/resources/party/partyReducers";
import type { IProcessState } from "../shared/resources/process/processReducer";
import type { IProfileState } from "../shared/resources/profile/profileReducers";
import type { IQueueState } from "../shared/resources/queue/queueSlice";
import type { ITextResourcesState } from "../shared/resources/textResources/textResourcesReducer";
import type { IApplicationSettingsState } from "src/shared/resources/applicationSettings/applicationSettingsSlice";
import type { IFormData } from "src/features/form/data/formDataReducer";

export interface IAltinnWindow extends Window {
  app: string;
  conditionalRuleHandlerHelper: IRules;
  instanceId: string;
  org: string;
  reportee: string;
}

export interface IComponentBindingValidation {
  errors?: (string | ReactNode)[];
  warnings?: (string | ReactNode)[];
  info?: (string | ReactNode)[];
  success?: (string | ReactNode)[];
  fixed?: (string | ReactNode)[];
}

export interface IComponentValidations {
  [id: string]: IComponentBindingValidation;
}

export { IDataModelBindings } from "../features/form/layout/index";

export interface IFormComponent {
  id: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
}

export interface IFormFileUploaderComponent extends IFormComponent {
  description: string;
  hasCustomFileEndings: boolean;
  maxFileSizeInMB: number;
  displayMode: string;
  maxNumberOfAttachments: number;
  minNumberOfAttachments: number;
  validFileEndings?: string;
}

export interface IFormFileUploaderWithTagComponent
  extends IFormFileUploaderComponent {
  options: IOption[];
  optionsId: string;
  mapping?: IMapping;
}

export interface IFormFileUploaderWithTag {
  chosenOptions: IOptionsChosen;
  editIndex: number;
}

export interface IOptionsChosen {
  [id: string]: string;
}

export interface IFileUploadersWithTag {
  [componentId: string]: IFormFileUploaderWithTag;
}

export interface ILayoutSets {
  sets: ILayoutSet[];
}

export interface ILayoutSet {
  id: string;
  dataType: string;
  tasks?: string[];
}

export interface ILayoutSettings {
  pages: IPagesSettings;
}

export interface IPagesSettings {
  order: string[];
  triggers?: Triggers[];
  hideCloseButton?: boolean;
  showProgress?: boolean;
  showLanguageSelector?: boolean;
}

export interface ILayoutNavigation {
  next?: string;
  previous?: string;
}

export interface INavigationConfig {
  [id: string]: ILayoutNavigation;
}

export interface IOption {
  label: string;
  value: any;
}

export interface IOptions {
  [key: string]: IOptionData;
}

export interface IOptionSource {
  group: string;
  label: string;
  value: string;
}

export interface IOptionsActualData {
  options?: IOption[];
}

export interface IOptionsMetaData {
  id: string;
  mapping?: IMapping;
  loading?: boolean;
  secure?: boolean;
}

export type IOptionData = IOptionsActualData & IOptionsMetaData;

export interface IRepeatingGroup {
  index: number;
  baseGroupId?: string;
  dataModelBinding?: string;
  editIndex?: number;
  deletingIndex?: number[];
}

export interface IRepeatingGroups {
  [id: string]: IRepeatingGroup;
}

export interface IRules {
  [id: string]: any;
}

export interface IRuntimeStore {
  attachments: IAttachmentState;
  formData: IFormDataState;
  formDataModel: IDataModelState;
  formDynamics: IFormDynamicState;
  formLayout: ILayoutState;
  language: ILanguageState;
}

export interface IRuntimeState {
  applicationMetadata: IApplicationMetadataState;
  applicationSettings: IApplicationSettingsState;
  attachments: IAttachmentState;
  formData: IFormDataState;
  formDataModel: IDataModelState;
  formDynamics: IFormDynamicState;
  formLayout: ILayoutState;
  formRules: IFormRuleState;
  formValidations: IValidationState;
  instanceData: IInstanceDataState;
  instantiation: IInstantiationState;
  isLoading: IIsLoadingState;
  language: ILanguageState;
  optionState: IOptionsState;
  organisationMetaData: IOrgsState;
  party: IPartyState;
  process: IProcessState;
  profile: IProfileState;
  queue: IQueueState;
  textResources: ITextResourcesState;
}

export interface ISchemaValidator {
  rootElementPath: string;
  schema: any;
  validator: Ajv;
}

export interface ISimpleInstance {
  id: string;
  lastChanged: string;
  lastChangedBy: string;
}

export interface ITextResource {
  id: string;
  value: string;
  unparsedValue?: string;
  variables?: IVariable[];
}

export interface ITextResourceBindings {
  [id: string]: string;
}

export interface IValidationIssue {
  code: string;
  description: string;
  field: string;
  scope: string;
  severity: Severity;
  targetId: string;
}

export interface IUiConfig {
  autoSave: boolean;
  currentView: string;
  currentViewCacheKey?: string;
  returnToView?: string;
  focus: string;
  hiddenFields: string[];
  repeatingGroups?: IRepeatingGroups;
  fileUploadersWithTag?: IFileUploadersWithTag;
  navigationConfig?: INavigationConfig;
  layoutOrder: string[];
  pageTriggers?: Triggers[];
  hideCloseButton?: boolean;
  showLanguageSelector?: boolean;
  showProgress?: boolean;
}

export interface IValidationResult {
  invalidDataTypes: boolean;
  validations: IValidations;
}

export interface IValidations {
  [id: string]: ILayoutValidations;
}

export interface ILayoutValidations {
  [id: string]: IComponentValidations;
}

export interface ICurrentSingleFieldValidation {
  dataModelBinding?: string;
  componentId?: string;
  layoutId?: string;
}

export interface IVariable {
  dataSource: string;
  key: string;
}

export enum ProcessTaskType {
  Unknown = "unknown",
  Data = "data",
  Archived = "ended",
  Confirm = "confirmation",
  Feedback = "feedback",
}

export enum PresentationType {
  Stateless = "stateless",
}

export enum LayoutStyle {
  Column = "column",
  Row = "row",
  Table = "table",
}

export enum Severity {
  Unspecified = 0,
  Error = 1,
  Warning = 2,
  Informational = 3,
  Fixed = 4,
  Success = 5,
}

export enum Triggers {
  Validation = "validation",
  CalculatePageOrder = "calculatePageOrder",
  ValidatePage = "validatePage",
  ValidateAllPages = "validateAllPages",
}

export interface ILabelSettings {
  optionalIndicator?: boolean;
}

export enum DateFlags {
  Today = "today",
}

// source, target dict
export interface IMapping {
  [source: string]: string;
}

export interface IFetchSpecificOptionSaga {
  optionsId: string;
  formData?: IFormData;
  language?: string;
  dataMapping?: IMapping;
  secure?: boolean;
  instanceId?: string;
}
