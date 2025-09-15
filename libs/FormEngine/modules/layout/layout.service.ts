import { layoutStore } from './layout.store';
import type {
  Expression,
  LayoutCollection,
  LayoutSetsConfig,
  PageOrder,
  ResolvedComponent,
} from '../../types';

export class LayoutService {
  private store = layoutStore;

  /**
   * Set all layout data at once
   */
  setLayoutData(data: {
    layoutSetsConfig: LayoutSetsConfig;
    pageOrder: PageOrder;
    layouts: LayoutCollection;
  }): void {
    this.store.getState().setLayoutSetsConfig(data.layoutSetsConfig);
    this.store.getState().setPageOrder(data.pageOrder);
    this.store.getState().setLayouts(data.layouts);
  }

  /**
   * Get current page components
   */
  getCurrentPageComponents(): ResolvedComponent[] {
    const state = this.store.getState();
    const currentPage = state.currentPage;
    if (!currentPage) return [];
    return state.getLayout(currentPage);
  }

  /**
   * Get visible components (applying hidden expressions)
   * For now, this returns all components that are not explicitly hidden
   * Expression evaluation will be added when Expression Service is implemented
   */
  getVisibleComponents(pageId: string): ResolvedComponent[] {
    const components = this.store.getState().getLayout(pageId);
    return this.filterVisibleComponents(components);
  }

  /**
   * Filter components based on visibility using expression evaluation
   */
  private filterVisibleComponents(components: ResolvedComponent[]): ResolvedComponent[] {
    // Import here to avoid circular dependency
    const { expressionService } = require('../expression/expression.service');
    
    return components.filter((component) => {
      try {
        // Use expression service to evaluate visibility
        return expressionService.evaluateVisibility(component.hidden, {
          componentMap: this.getComponentMap()
        });
      } catch (error) {
        console.error(`Error evaluating visibility for component ${component.id}:`, error);
        // Default to visible on error
        return true;
      }
    });
  }

  /**
   * Navigate to a specific page
   */
  navigateToPage(pageId: string): void {
    const pageList = this.store.getState().getPageList();
    if (pageList.includes(pageId)) {
      this.store.getState().setCurrentPage(pageId);
    } else {
      console.warn(`Page ${pageId} not found in page order`);
    }
  }

  /**
   * Navigate to next page
   */
  navigateToNextPage(): boolean {
    const state = this.store.getState();
    const pageList = state.getPageList();
    const currentIndex = pageList.indexOf(state.currentPage);

    if (currentIndex < pageList.length - 1) {
      state.setCurrentPage(pageList[currentIndex + 1]);
      return true;
    }
    return false;
  }

  /**
   * Navigate to previous page
   */
  navigateToPreviousPage(): boolean {
    const state = this.store.getState();
    const pageList = state.getPageList();
    const currentIndex = pageList.indexOf(state.currentPage);

    if (currentIndex > 0) {
      state.setCurrentPage(pageList[currentIndex - 1]);
      return true;
    }
    return false;
  }

  /**
   * Get component by ID
   */
  getComponentById(componentId: string): ResolvedComponent | undefined {
    return this.store.getState().getComponent(componentId);
  }

  /**
   * Get all components for a specific layout set
   */
  getLayoutSetComponents(layoutSetId: string): ResolvedComponent[] {
    const state = this.store.getState();
    const layoutSet = state.getLayoutSet(layoutSetId);
    if (!layoutSet) return [];

    // Get all components from all pages
    const allComponents: ResolvedComponent[] = [];
    const pageList = state.getPageList();

    pageList.forEach((pageId) => {
      const components = state.getLayout(pageId);
      // Filter components that belong to this layout set
      const layoutSetComponents = components.filter(
        (comp) => comp.layoutSetId === layoutSetId,
      );
      allComponents.push(...layoutSetComponents);
    });

    return allComponents;
  }

  /**
   * Get current layout set ID
   */
  getCurrentLayoutSet(): string {
    return this.store.getState().currentLayoutSet;
  }

  /**
   * Get current page ID
   */
  getCurrentPage(): string {
    return this.store.getState().currentPage;
  }

  /**
   * Set current layout set
   */
  setCurrentLayoutSet(layoutSetId: string): void {
    const layoutSet = this.store.getState().getLayoutSet(layoutSetId);
    if (layoutSet) {
      this.store.getState().setCurrentLayoutSet(layoutSetId);
    } else {
      console.warn(`Layout set ${layoutSetId} not found`);
    }
  }

  /**
   * Get page list
   */
  getPageList(): string[] {
    return this.store.getState().getPageList();
  }

  /**
   * Check if a page exists
   */
  hasPage(pageId: string): boolean {
    return this.getPageList().includes(pageId);
  }

  /**
   * Get all resolved layouts
   */
  getAllResolvedLayouts(): Record<string, ResolvedComponent[]> {
    return this.store.getState().resolvedLayouts;
  }

  /**
   * Update component visibility
   */
  updateComponentVisibility(componentId: string, hidden: boolean): void {
    this.store.getState().updateComponentVisibility(componentId, hidden);
  }

  /**
   * Subscribe to layout changes
   */
  subscribe(listener: (state: any) => void): () => void {
    return this.store.subscribe(listener);
  }

  /**
   * Subscribe to current page changes
   */
  subscribeToPageChanges(listener: (pageId: string) => void): () => void {
    return this.store.subscribe(
      (state) => state.currentPage,
      listener,
    );
  }

  /**
   * Reset the layout store
   */
  reset(): void {
    this.store.getState().reset();
  }

  /**
   * Get components by type
   */
  getComponentsByType(componentType: string, pageId?: string): ResolvedComponent[] {
    const state = this.store.getState();
    let components: ResolvedComponent[] = [];

    if (pageId) {
      components = state.getLayout(pageId);
    } else {
      // Get all components from all pages
      const pageList = state.getPageList();
      pageList.forEach((pid) => {
        components.push(...state.getLayout(pid));
      });
    }

    return components.filter((comp) => comp.type === componentType);
  }

  /**
   * Find parent component
   */
  getParentComponent(componentId: string): ResolvedComponent | undefined {
    const component = this.getComponentById(componentId);
    if (!component || !component.parent) return undefined;
    return this.getComponentById(component.parent);
  }

  /**
   * Get child components
   */
  getChildComponents(componentId: string): ResolvedComponent[] {
    const component = this.getComponentById(componentId);
    return component?.children || [];
  }

  /**
   * Get component map for expression evaluation
   */
  getComponentMap(): Record<string, ResolvedComponent> {
    return this.store.getState().componentMap;
  }
}

// Export singleton instance
export const layoutService = new LayoutService();