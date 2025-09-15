// Export all types
export * from './types';

// Export services
export { dataService } from './modules/data/data.service';
export { layoutService } from './modules/layout/layout.service';
export { applicationService } from './modules/application/application.service';
export { expressionService } from './modules/expression/expression.service';
export { validationService } from './modules/validation/validation.service';

// Export stores (for advanced usage)
export { dataStore } from './modules/data/data.store';
export { layoutStore } from './modules/layout/layout.store';
export { applicationStore } from './modules/application/application.store';

// Import services for FormEngine
import { applicationService } from 'libs/FormEngine/modules/application/application.service';
import { dataService } from 'libs/FormEngine/modules/data/data.service';
import { expressionService } from 'libs/FormEngine/modules/expression/expression.service';
import { layoutService } from 'libs/FormEngine/modules/layout/layout.service';
import { validationService } from 'libs/FormEngine/modules/validation/validation.service';
import type { FormEngineConfig } from 'libs/FormEngine/types';

/**
 * Main FormEngine class that orchestrates all services
 */
export class FormEngine {
  // Public services API
  public data = dataService;
  public layout = layoutService;
  public application = applicationService;
  public expression = expressionService;
  public validation = validationService;

  // Event emitter for form events
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    // Initialize with default state
    this.reset();
  }

  /**
   * Initialize FormEngine with configuration
   */
  initialize(config: FormEngineConfig): void {
    try {
      console.log('FormEngine: Initializing with config');

      // Set application metadata and configurations
      this.application.initialize({
        applicationMetadata: config.applicationMetadata,
        frontEndSettings: config.frontEndSettings,
        componentConfigs: config.componentConfigs,
      });

      // Set layout data
      this.layout.setLayoutData({
        layoutSetsConfig: config.layoutSetsConfig,
        pageOrder: config.pageOrder,
        layouts: config.layouts,
      });

      // Set form data
      this.data.setData(config.data);

      // Store schemas in data service for now (will move to schema service later)
      // TODO: Implement schema service
      console.log('FormEngine: Schemas available:', Object.keys(config.dataModelSchemas));

      // Emit initialization event
      this.emit('initialized', config);

      console.log('FormEngine: Initialization complete');
      console.log('- Current page:', this.layout.getCurrentPage());
      console.log('- Available pages:', this.layout.getPageList());
      console.log('- Component count:', Object.keys(this.layout.getAllResolvedLayouts()).length);
    } catch (error) {
      console.error('FormEngine: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get current state snapshot
   */
  getState(): any {
    return {
      currentPage: this.layout.getCurrentPage(),
      currentLayoutSet: this.layout.getCurrentLayoutSet(),
      data: this.data.getData(),
      pageList: this.layout.getPageList(),
      applicationId: this.application.getApplicationId(),
    };
  }

  /**
   * Navigate to a specific page
   */
  navigateToPage(pageId: string): boolean {
    try {
      this.layout.navigateToPage(pageId);
      this.emit('pageChanged', { pageId, previousPage: this.layout.getCurrentPage() });
      return true;
    } catch (error) {
      console.error('Navigation failed:', error);
      return false;
    }
  }

  /**
   * Get components for current page
   */
  getCurrentPageComponents() {
    return this.layout.getCurrentPageComponents();
  }

  /**
   * Get visible components for a page
   */
  getVisibleComponents(pageId?: string) {
    const targetPage = pageId || this.layout.getCurrentPage();
    return this.layout.getVisibleComponents(targetPage);
  }

  /**
   * Update form data
   */
  updateData(path: string, value: any): void {
    const oldValue = this.data.getValue(path);
    this.data.setValue(path, value);

    this.emit('dataChanged', { path, value, oldValue });
  }

  /**
   * Get form data value
   */
  getData(path?: string): any {
    return path ? this.data.getValue(path) : this.data.getData();
  }

  /**
   * Validate current form data
   */
  validate(): boolean {
    // TODO: Implement comprehensive validation
    console.log('FormEngine: Validating form data...');
    return true;
  }

  /**
   * Reset FormEngine to initial state
   */
  reset(): void {
    this.data.clearData();
    this.layout.reset();
    this.application.reset();
    this.eventListeners.clear();

    this.emit('reset');
  }

  /**
   * Event system
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: string, listener: Function): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  emit(event: string, payload?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to data changes
   */
  subscribeToDataChanges(listener: (data: any) => void): () => void {
    return this.data.subscribe(listener);
  }

  /**
   * Subscribe to page changes
   */
  subscribeToPageChanges(listener: (pageId: string) => void): () => void {
    return this.layout.subscribeToPageChanges(listener);
  }

  /**
   * Get component by ID
   */
  getComponent(componentId: string) {
    return this.layout.getComponentById(componentId);
  }

  /**
   * Check if component is visible
   */
  isComponentVisible(componentId: string): boolean {
    const component = this.getComponent(componentId);
    if (!component) {
      return false;
    }

    // Evaluate visibility using expression service
    if (typeof component.hidden === 'boolean') {
      return !component.hidden;
    }

    if (Array.isArray(component.hidden)) {
      return this.expression.evaluateVisibility(component.hidden, {
        data: this.data.getData(),
        componentMap: this.layout.getComponentMap()
      });
    }

    return true; // Default to visible
  }

  /**
   * Get application information
   */
  getApplicationInfo() {
    return {
      id: this.application.getApplicationId(),
      organization: this.application.getOrganization(),
      title: this.application.getApplicationTitle(),
    };
  }

  /**
   * Debug helper - get all internal state
   */
  debug() {
    return {
      state: this.getState(),
      layouts: this.layout.getAllResolvedLayouts(),
      components: Object.keys(this.layout.getAllResolvedLayouts()).reduce((acc, pageId) => {
        acc[pageId] = this.layout.getVisibleComponents(pageId).map((c) => ({ id: c.id, type: c.type }));
        return acc;
      }, {} as any),
      data: this.data.getData(),
      applicationInfo: this.getApplicationInfo(),
    };
  }
}

// Export default instance for convenience
export const formEngine = new FormEngine();

// Keep the old greeting function for backward compatibility
export function GreetingsFormEngine() {
  console.log('g day from FormEngine!');
}
