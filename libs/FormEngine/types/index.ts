/**
 * Core FormEngine Type Definitions
 * These types define the structure of data used throughout the FormEngine
 */

// ============================================
// Data Types
// ============================================

export interface DataObject {
  [key: string]: string | number | boolean | null | object | DataObject | undefined;
}

// ============================================
// Layout Types
// ============================================

export interface LayoutSetsConfig {
  $schema?: string;
  sets: LayoutSet[];
  uiSettings?: Record<string, any>;
}

export interface LayoutSet {
  id: string;
  dataType: string;
  tasks: string[];
}

export interface PageOrder {
  $schema?: string;
  pages: {
    order: string[];
  };
}

export interface LayoutFile {
  $schema?: string;
  data: {
    layout: BaseComponent[];
    hidden?: boolean | Expression;
    expandedWidth?: boolean;
  };
}

export type LayoutCollection = Record<string, LayoutFile>;

// ============================================
// Component Types
// ============================================

export interface BaseComponent {
  id: string;
  type: string;
  dataModelBindings?: DataModelBindings;
  textResourceBindings?: TextResourceBindings;
  hidden?: boolean | Expression;
  required?: boolean | Expression;
  readOnly?: boolean | Expression;
  grid?: GridSettings;
  size?: string;
  target?: TargetConfig;
  showPageInAccordion?: boolean;
  [key: string]: any; // Component-specific props
}

export interface ResolvedComponent extends BaseComponent {
  children?: ResolvedComponent[];
  parent?: string;
  pageId: string;
  layoutSetId?: string;
}

export interface DataModelBindings {
  simpleBinding?: string;
  [key: string]: string | undefined;
}

export interface TextResourceBindings {
  title?: string;
  description?: string;
  help?: string;
  [key: string]: string | undefined;
}

export interface GridSettings {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface TargetConfig {
  type: 'component' | 'page' | 'layoutSet';
  id?: string;
  taskId?: string;
}

// ============================================
// Schema Types
// ============================================

export interface JSONSchema7 {
  $schema?: string;
  $id?: string;
  type?: string;
  properties?: Record<string, any>;
  required?: string[];
  $defs?: Record<string, any>;
  info?: {
    rootNode?: string;
  };
  '@xsdNamespaces'?: Record<string, string>;
  '@xsdSchemaAttributes'?: Record<string, string>;
  '@xsdRootElement'?: string;
  items?: any;
  maximum?: number;
  minimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  format?: string;
  title?: string;
  [key: string]: any;
}

// ============================================
// Application Types
// ============================================

export interface ApplicationMetadata {
  id: string;
  org: string;
  title: Record<string, string>;
  dataTypes: DataType[];
  features?: ApplicationFeatures;
  logo?: LogoConfig;
  altinnNugetVersion?: string;
  externalApiIds?: string[];
  versionId?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  processId?: string | null;
  partyTypesAllowed?: PartyTypesAllowed;
  autoDeleteOnProcessEnd?: boolean;
  created?: string;
  createdBy?: string;
  lastChanged?: string;
  lastChangedBy?: string;
  [key: string]: any;
}

export interface ApplicationFeatures {
  footer?: boolean;
  processActions?: boolean;
  jsonObjectInDataResponse?: boolean;
  [key: string]: any;
}

export interface LogoConfig {
  displayAppOwnerNameInHeader?: boolean;
  source?: string;
  size?: string;
}

export interface DataType {
  id: string;
  allowedContentTypes?: string[] | null;
  maxSize?: number | null;
  maxCount?: number;
  minCount?: number;
  taskId?: string | null;
  appLogic?: AppLogicConfig | null;
  description?: string | null;
  enablePdfCreation?: boolean;
  enableFileScan?: boolean;
  validationErrorOnPendingFileScan?: boolean;
  enabledFileAnalysers?: string[];
  enabledFileValidators?: string[];
  allowedContributers?: string[] | null;
  allowedContributors?: string[] | null;
  [key: string]: any;
}

export interface AppLogicConfig {
  autoCreate?: boolean;
  classRef?: string;
  schemaRef?: string | null;
  allowAnonymousOnStateless?: boolean;
  autoDeleteOnProcessEnd?: boolean;
  disallowUserCreate?: boolean;
  disallowUserDelete?: boolean;
  allowInSubform?: boolean;
  shadowFields?: any;
}

export interface PartyTypesAllowed {
  bankruptcyEstate?: boolean;
  organisation?: boolean;
  person?: boolean;
  subUnit?: boolean;
}

export interface FrontEndSettings {
  [key: string]: any;
}

// ============================================
// Component Configuration Types
// ============================================

export interface ComponentConfig {
  def: ComponentDefinition;
  capabilities: ComponentCapabilities;
  behaviors: ComponentBehaviors;
}

export interface ComponentDefinition {
  plugins?: Record<string, PluginConfig>;
  category: 'Container' | 'Form' | 'Action' | 'Presentation';
  type: string;
  render: Record<string, any>;
}

export interface PluginConfig {
  import?: {
    internal?: {
      jsonSchema?: {
        examples?: any[];
      };
      typeScript?: Record<string, any>;
      optional?: boolean;
      frozen?: boolean;
    };
    val?: {
      import: string;
      from: string;
    };
  };
  settings?: {
    supportsPreselection?: boolean;
    type?: 'single' | 'multi';
    allowsEffects?: boolean;
  };
}

export interface ComponentCapabilities {
  renderInTable: boolean;
  renderInButtonGroup: boolean;
  renderInAccordion: boolean;
  renderInAccordionGroup: boolean;
  renderInCards: boolean;
  renderInCardsMedia: boolean;
  renderInTabs: boolean;
}

export interface ComponentBehaviors {
  isSummarizable: boolean;
  canHaveLabel: boolean;
  canHaveOptions: boolean;
  canHaveAttachments: boolean;
}

export type ComponentConfigs = Record<string, ComponentConfig>;

// ============================================
// User & Party Types
// ============================================

export interface User {
  userId: number;
  userUuid?: string | null;
  userName: string;
  externalIdentity?: string | null;
  isReserved?: boolean;
  phoneNumber?: string;
  email?: string;
  partyId: number;
  party?: Party;
  userType?: number;
  profileSettingPreference?: ProfileSettings;
}

export interface ProfileSettings {
  language?: string;
  preSelectedPartyId?: number;
  doNotPromptForParty?: boolean;
}

export interface Party {
  partyId: number;
  partyUuid: string;
  partyTypeName: number;
  orgNumber?: string | null;
  ssn?: string | null;
  unitType?: string | null;
  name: string;
  isDeleted: boolean;
  onlyHierarchyElementWithNoAccess?: boolean;
  person?: Person | null;
  organization?: Organization | null;
  childParties?: Party[] | null;
}

export interface Person {
  ssn: string;
  name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  telephoneNumber?: string;
  mobileNumber?: string;
  mailingAddress?: string;
  mailingPostalCode?: string;
  mailingPostalCity?: string;
  addressMunicipalNumber?: string;
  addressMunicipalName?: string;
  addressStreetName?: string;
  addressHouseNumber?: string;
  addressHouseLetter?: string | null;
  addressPostalCode?: string;
  addressCity?: string;
  dateOfDeath?: string | null;
}

export interface Organization {
  orgNumber?: string;
  name?: string;
  unitType?: string;
  telephoneNumber?: string;
  mobileNumber?: string;
  faxNumber?: string;
  emailAddress?: string;
  internetAddress?: string;
  mailingAddress?: string;
  mailingPostalCode?: string;
  mailingPostalCity?: string;
  businessAddress?: string;
  businessPostalCode?: string;
  businessPostalCity?: string;
}

// ============================================
// Options Types
// ============================================

export interface Option {
  value: string;
  label: string;
  description?: string;
  helpText?: string;
}

// ============================================
// Expression & Validation Types
// ============================================

// Altinn DSL Expression type - can be nested arrays with strings, numbers, booleans
export type Expression = any[] | string | number | boolean;

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  code?: string;
}

// ============================================
// Store State Types
// ============================================

export type ResolvedLayoutCollection = Record<string, ResolvedComponent[]>;

// ============================================
// FormEngine Configuration
// ============================================

export interface FormEngineConfig {
  // Data
  data: DataObject;
  dataModelSchemas: Record<string, JSONSchema7>;
  
  // Layouts
  layoutSetsConfig: LayoutSetsConfig;
  pageOrder: PageOrder;
  layouts: LayoutCollection;
  componentMap?: Record<string, ResolvedComponent>;
  
  // Application
  applicationMetadata: ApplicationMetadata;
  frontEndSettings: FrontEndSettings;
  componentConfigs: ComponentConfigs;
  
  // User
  user: User;
  validParties: Party[];
}

// ============================================
// Service Response Types
// ============================================

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}