# Updated FormEngine Architecture Specification

## Overview
Based on the provided dummy data, the FormEngine needs to handle:
- Multiple data models with JSON schemas
- Layout sets with task associations
- Complex component configurations with plugins
- Application metadata and settings
- User and party information
- Page ordering and navigation

## Core Stores Required

### 1. Data Store (✅ Already Implemented)
**Purpose**: Manage form data for all data models
**Location**: `libs/FormEngine/modules/data/`

```typescript
interface DataStore {
  data: DataObject | undefined;
  getData: () => DataObject | undefined;
  setData: (data: DataObject) => void;
  updateData: (updater: (data: DataObject) => DataObject) => void;
  clearData: () => void;
}
```

### 2. Layout Store
**Purpose**: Manage layouts, layout sets, and page ordering
**Location**: `libs/FormEngine/modules/layout/`

```typescript
interface LayoutStore {
  // Layout sets configuration
  layoutSetsConfig: LayoutSetsConfig;
  
  // Page ordering
  pageOrder: PageOrder;
  
  // All layouts keyed by page ID
  layouts: LayoutCollection;
  
  // Resolved layouts with component hierarchy
  resolvedLayouts: ResolvedLayoutCollection;
  
  // Component lookup map for fast access
  componentMap: Record<string, ResolvedComponent>;
  
  // Current page/layout set
  currentLayoutSet: string;
  currentPage: string;
  
  // Methods
  setLayoutSetsConfig: (config: LayoutSetsConfig) => void;
  setPageOrder: (order: PageOrder) => void;
  setLayouts: (layouts: LayoutCollection) => void;
  setCurrentLayoutSet: (layoutSetId: string) => void;
  setCurrentPage: (pageId: string) => void;
  getLayout: (pageId: string) => ResolvedComponent[];
  getComponent: (componentId: string) => ResolvedComponent | undefined;
  resolveLayouts: () => void;
}
```

### 3. Schema Store
**Purpose**: Manage data model schemas for validation
**Location**: `libs/FormEngine/modules/schema/`

```typescript
interface SchemaStore {
  // Data model schemas keyed by model name
  dataModelSchemas: Record<string, JSONSchema7>;
  
  // Methods
  setSchema: (modelName: string, schema: JSONSchema7) => void;
  getSchema: (modelName: string) => JSONSchema7 | undefined;
  getAllSchemas: () => Record<string, JSONSchema7>;
  clearSchemas: () => void;
}
```

### 4. Application Store
**Purpose**: Manage application metadata and configuration
**Location**: `libs/FormEngine/modules/application/`

```typescript
interface ApplicationStore {
  // Application metadata
  applicationMetadata: ApplicationMetadata;
  
  // Frontend settings
  frontEndSettings: FrontEndSettings;
  
  // Component configurations
  componentConfigs: ComponentConfigs;
  
  // Methods
  setApplicationMetadata: (metadata: ApplicationMetadata) => void;
  setFrontEndSettings: (settings: FrontEndSettings) => void;
  setComponentConfigs: (configs: ComponentConfigs) => void;
  getDataType: (dataTypeId: string) => DataType | undefined;
  getComponentConfig: (componentType: string) => ComponentConfig | undefined;
}
```

### 5. User Store
**Purpose**: Manage user and party information
**Location**: `libs/FormEngine/modules/user/`

```typescript
interface UserStore {
  // Current user
  user: User;
  
  // Valid parties for the user
  validParties: Party[];
  
  // Selected party
  selectedParty: Party | undefined;
  
  // Methods
  setUser: (user: User) => void;
  setValidParties: (parties: Party[]) => void;
  setSelectedParty: (partyId: number) => void;
  getSelectedParty: () => Party | undefined;
}
```

### 6. Options Store
**Purpose**: Manage options for dropdowns, checkboxes, etc.
**Location**: `libs/FormEngine/modules/options/`

```typescript
interface OptionsStore {
  // Options keyed by option ID or component ID
  options: Record<string, Option[]>;
  
  // Methods
  setOptions: (id: string, options: Option[]) => void;
  getOptions: (id: string) => Option[] | undefined;
  clearOptions: () => void;
}
```

## Type Definitions

### Core Types
**Location**: `libs/FormEngine/types/`

```typescript
// Data types
export interface DataObject {
  [key: string]: string | number | boolean | null | object | DataObject | undefined;
}

// Layout types
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
    hidden?: boolean | string[];
    expandedWidth?: boolean;
  };
}

export type LayoutCollection = Record<string, LayoutFile>;

// Component types
export interface BaseComponent {
  id: string;
  type: string;
  dataModelBindings?: DataModelBindings;
  textResourceBindings?: TextResourceBindings;
  hidden?: boolean | Expression;
  required?: boolean | Expression;
  readOnly?: boolean | Expression;
  grid?: GridSettings;
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

// Schema types
export interface JSONSchema7 {
  $schema?: string;
  $id?: string;
  type?: string;
  properties?: Record<string, any>;
  required?: string[];
  $defs?: Record<string, any>;
  [key: string]: any;
}

// Application types
export interface ApplicationMetadata {
  id: string;
  org: string;
  title: Record<string, string>;
  dataTypes: DataType[];
  features?: ApplicationFeatures;
  logo?: LogoConfig;
  [key: string]: any;
}

export interface DataType {
  id: string;
  allowedContentTypes?: string[];
  maxSize?: number;
  maxCount?: number;
  minCount?: number;
  taskId?: string;
  appLogic?: AppLogicConfig;
  [key: string]: any;
}

export interface ComponentConfig {
  def: {
    plugins?: Record<string, PluginConfig>;
    category: string;
    type: string;
    render: Record<string, any>;
  };
  capabilities: ComponentCapabilities;
  behaviors: ComponentBehaviors;
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

// User types
export interface User {
  userId: number;
  userName: string;
  email?: string;
  phoneNumber?: string;
  partyId: number;
  party?: Party;
  profileSettingPreference?: ProfileSettings;
}

export interface Party {
  partyId: number;
  partyUuid: string;
  partyTypeName: number;
  orgNumber?: string;
  ssn?: string;
  name: string;
  unitType?: string;
  isDeleted: boolean;
  person?: Person;
  organization?: Organization;
  childParties?: Party[];
}

// Options types
export interface Option {
  value: string;
  label: string;
  description?: string;
  helpText?: string;
}

// Expression types
export type Expression = string[] | boolean;

export interface GridSettings {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export type ComponentConfigs = Record<string, ComponentConfig>;
export type ResolvedLayoutCollection = Record<string, ResolvedComponent[]>;
```

## Service Layers

### 1. Data Service (✅ Already Implemented)
- Get/set values using dot notation
- Subscribe to data changes
- Batch updates

### 2. Layout Service
```typescript
class LayoutService {
  // Set all layout data at once
  setLayoutData(data: {
    layoutSetsConfig: LayoutSetsConfig;
    pageOrder: PageOrder;
    layouts: LayoutCollection;
  }): void;
  
  // Get current page components
  getCurrentPageComponents(): ResolvedComponent[];
  
  // Get visible components (applying hidden expressions)
  getVisibleComponents(pageId: string): ResolvedComponent[];
  
  // Navigate between pages
  navigateToPage(pageId: string): void;
  
  // Get component by ID
  getComponentById(componentId: string): ResolvedComponent | undefined;
}
```

### 3. Schema Service
```typescript
class SchemaService {
  // Set schemas from data
  setSchemas(schemas: Record<string, JSONSchema7>): void;
  
  // Validate data against schema
  validateData(data: any, schemaName: string): ValidationResult;
  
  // Get property schema
  getPropertySchema(schemaName: string, propertyPath: string): any;
}
```

### 4. Application Service
```typescript
class ApplicationService {
  // Initialize application configuration
  initialize(config: {
    applicationMetadata: ApplicationMetadata;
    frontEndSettings: FrontEndSettings;
    componentConfigs: ComponentConfigs;
  }): void;
  
  // Get component configuration
  getComponentConfig(componentType: string): ComponentConfig | undefined;
  
  // Check component capabilities
  canRenderInContext(componentType: string, context: string): boolean;
}
```

### 5. User Service
```typescript
class UserService {
  // Set user data
  setUserData(data: {
    user: User;
    validParties: Party[];
  }): void;
  
  // Get current user
  getCurrentUser(): User;
  
  // Get selected party
  getSelectedParty(): Party | undefined;
  
  // Change selected party
  selectParty(partyId: number): void;
}
```

### 6. Options Service
```typescript
class OptionsService {
  // Set options for a component/ID
  setOptions(id: string, options: Option[]): void;
  
  // Get options for a component
  getOptions(id: string): Option[] | undefined;
  
  // Find option by value
  findOption(id: string, value: string): Option | undefined;
}
```

## FormEngine Core Class

```typescript
export class FormEngine {
  // Services
  public data: DataService;
  public layout: LayoutService;
  public schema: SchemaService;
  public application: ApplicationService;
  public user: UserService;
  public options: OptionsService;
  
  // Initialize with dummy data
  initialize(config: FormEngineConfig): void {
    // Set application metadata
    this.application.initialize({
      applicationMetadata: config.applicationMetadata,
      frontEndSettings: config.frontEndSettings,
      componentConfigs: config.componentConfigs
    });
    
    // Set user data
    this.user.setUserData({
      user: config.user,
      validParties: config.validParties
    });
    
    // Set schemas
    this.schema.setSchemas(config.dataModelSchemas);
    
    // Set layout data
    this.layout.setLayoutData({
      layoutSetsConfig: config.layoutSetsConfig,
      pageOrder: config.pageOrder,
      layouts: config.layouts
    });
    
    // Set form data
    this.data.setData(config.data);
  }
}

export interface FormEngineConfig {
  // Data
  data: DataObject;
  dataModelSchemas: Record<string, JSONSchema7>;
  
  // Layouts
  layoutSetsConfig: LayoutSetsConfig;
  pageOrder: PageOrder;
  layouts: LayoutCollection;
  
  // Application
  applicationMetadata: ApplicationMetadata;
  frontEndSettings: FrontEndSettings;
  componentConfigs: ComponentConfigs;
  
  // User
  user: User;
  validParties: Party[];
}
```

## Implementation Plan

### Phase 1: Type Definitions and Store Structure
1. Create comprehensive type definitions in `libs/FormEngine/types/`
2. Bundle types with their corresponding stores

### Phase 2: Store Implementations
1. Layout Store with component resolution
2. Schema Store with validation support
3. Application Store with metadata management
4. User Store with party selection
5. Options Store for dynamic options

### Phase 3: Service Layers
1. Implement service classes that wrap stores
2. Add business logic and data transformation
3. Create subscriptions and event handling

### Phase 4: FormEngine Integration
1. Wire up all services in FormEngine class
2. Create initialization method
3. Test with dummy data

### Phase 5: React Integration
1. Update FormEngineReact to use new stores
2. Create hooks for each service
3. Test component rendering with real data structure

## Key Features to Support

1. **Multiple Data Models**: Support for 'model' and 'model2' with different schemas
2. **Layout Sets**: Different layouts for different tasks
3. **Component Configurations**: Rich component metadata with plugins and capabilities
4. **Navigation**: Page ordering and navigation between layouts
5. **User Context**: User and party selection affecting form behavior
6. **Dynamic Options**: Options that can be loaded and updated dynamically
7. **Validation**: Schema-based validation with JSONSchema7
8. **Expressions**: Support for hidden/required/readOnly expressions

## Testing Strategy

1. Load dummy data directly into stores
2. Verify component resolution and hierarchy
3. Test data binding with dot notation
4. Validate schema validation
5. Test navigation between pages
6. Verify user/party context switching

---

**Next Steps:**
1. Review and approve this specification
2. Create type definitions
3. Implement stores with bundled types
4. Create service layers
5. Wire up FormEngine
6. Test with provided dummy data