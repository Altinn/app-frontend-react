import { applicationStore } from './application.store';
import type {
  ApplicationMetadata,
  ComponentConfig,
  ComponentConfigs,
  DataType,
  FrontEndSettings,
} from '../../types';

export class ApplicationService {
  private store = applicationStore;

  /**
   * Initialize application configuration
   */
  initialize(config: {
    applicationMetadata: ApplicationMetadata;
    frontEndSettings: FrontEndSettings;
    componentConfigs: ComponentConfigs;
  }): void {
    this.store.getState().setApplicationMetadata(config.applicationMetadata);
    this.store.getState().setFrontEndSettings(config.frontEndSettings);
    this.store.getState().setComponentConfigs(config.componentConfigs);
  }

  /**
   * Get component configuration
   */
  getComponentConfig(componentType: string): ComponentConfig | undefined {
    return this.store.getState().getComponentConfig(componentType);
  }

  /**
   * Check component capabilities
   */
  canRenderInContext(componentType: string, context: string): boolean {
    const config = this.getComponentConfig(componentType);
    if (!config) return false;

    const capabilities = config.capabilities;
    switch (context) {
      case 'table':
        return capabilities.renderInTable;
      case 'buttonGroup':
        return capabilities.renderInButtonGroup;
      case 'accordion':
        return capabilities.renderInAccordion;
      case 'accordionGroup':
        return capabilities.renderInAccordionGroup;
      case 'cards':
        return capabilities.renderInCards;
      case 'cardsMedia':
        return capabilities.renderInCardsMedia;
      case 'tabs':
        return capabilities.renderInTabs;
      default:
        return true; // Default context allows all components
    }
  }

  /**
   * Check if component can have options
   */
  canHaveOptions(componentType: string): boolean {
    const config = this.getComponentConfig(componentType);
    return config?.behaviors.canHaveOptions || false;
  }

  /**
   * Check if component can have attachments
   */
  canHaveAttachments(componentType: string): boolean {
    const config = this.getComponentConfig(componentType);
    return config?.behaviors.canHaveAttachments || false;
  }

  /**
   * Check if component can have label
   */
  canHaveLabel(componentType: string): boolean {
    const config = this.getComponentConfig(componentType);
    return config?.behaviors.canHaveLabel || false;
  }

  /**
   * Check if component is summarizable
   */
  isSummarizable(componentType: string): boolean {
    const config = this.getComponentConfig(componentType);
    return config?.behaviors.isSummarizable || false;
  }

  /**
   * Get data type configuration
   */
  getDataType(dataTypeId: string): DataType | undefined {
    return this.store.getState().getDataType(dataTypeId);
  }

  /**
   * Get all data types
   */
  getAllDataTypes(): DataType[] {
    return this.store.getState().getAllDataTypes();
  }

  /**
   * Get data types for a specific task
   */
  getDataTypesForTask(taskId: string): DataType[] {
    const allDataTypes = this.getAllDataTypes();
    return allDataTypes.filter((dt) => dt.taskId === taskId);
  }

  /**
   * Get organization name
   */
  getOrganization(): string {
    return this.store.getState().getOrganization();
  }

  /**
   * Get application ID
   */
  getApplicationId(): string {
    return this.store.getState().getApplicationId();
  }

  /**
   * Get application title
   */
  getApplicationTitle(language?: string): string {
    return this.store.getState().getApplicationTitle(language);
  }

  /**
   * Check if application has a specific feature
   */
  hasFeature(featureName: string): boolean {
    return this.store.getState().hasFeature(featureName);
  }

  /**
   * Get frontend settings
   */
  getFrontEndSettings(): FrontEndSettings {
    return this.store.getState().frontEndSettings;
  }

  /**
   * Get application metadata
   */
  getApplicationMetadata(): ApplicationMetadata | undefined {
    return this.store.getState().applicationMetadata;
  }

  /**
   * Get component category
   */
  getComponentCategory(componentType: string): string {
    const config = this.getComponentConfig(componentType);
    return config?.def.category || 'Unknown';
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: string): string[] {
    const configs = this.store.getState().componentConfigs;
    return Object.keys(configs).filter((type) => configs[type].def.category === category);
  }

  /**
   * Check if component has plugin
   */
  hasPlugin(componentType: string, pluginName: string): boolean {
    const config = this.getComponentConfig(componentType);
    return Boolean(config?.def.plugins?.[pluginName]);
  }

  /**
   * Get component plugin settings
   */
  getPluginSettings(componentType: string, pluginName: string): any {
    const config = this.getComponentConfig(componentType);
    return config?.def.plugins?.[pluginName]?.settings;
  }

  /**
   * Subscribe to application changes
   */
  subscribe(listener: (state: any) => void): () => void {
    return this.store.subscribe(listener);
  }

  /**
   * Reset the application store
   */
  reset(): void {
    this.store.getState().reset();
  }

  /**
   * Get all component types
   */
  getAllComponentTypes(): string[] {
    const configs = this.store.getState().componentConfigs;
    return Object.keys(configs);
  }

  /**
   * Get form components (components that can have data bindings)
   */
  getFormComponentTypes(): string[] {
    const configs = this.store.getState().componentConfigs;
    return Object.keys(configs).filter((type) => {
      const config = configs[type];
      return config.def.category === 'Form';
    });
  }

  /**
   * Get container components
   */
  getContainerComponentTypes(): string[] {
    const configs = this.store.getState().componentConfigs;
    return Object.keys(configs).filter((type) => {
      const config = configs[type];
      return config.def.category === 'Container';
    });
  }

  /**
   * Check if component supports validation
   */
  supportsValidation(componentType: string): boolean {
    return this.hasPlugin(componentType, 'ValidationPlugin');
  }

  /**
   * Check if component supports options
   */
  supportsOptions(componentType: string): boolean {
    return this.hasPlugin(componentType, 'OptionsPlugin');
  }
}

// Export singleton instance
export const applicationService = new ApplicationService();