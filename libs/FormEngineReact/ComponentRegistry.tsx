import React from 'react';
import type { ComponentMap } from './FormEngineProvider';
import type { FormEngineComponentContext } from './components/FormEngineComponent';

/**
 * Component configuration interface
 */
export interface ComponentRegistration {
  type: string;
  component: React.ComponentType<any>;
  config?: {
    supportsData?: boolean;
    supportsValidation?: boolean;
    supportsChildren?: boolean;
    category?: 'Form' | 'Container' | 'Action' | 'Presentation';
  };
}

/**
 * Component registry for managing FormEngine components
 */
export class ComponentRegistry {
  private components: Map<string, ComponentRegistration> = new Map();

  /**
   * Register a component type
   */
  register(registration: ComponentRegistration): void {
    this.components.set(registration.type, registration);
  }

  /**
   * Register multiple components
   */
  registerMany(registrations: ComponentRegistration[]): void {
    registrations.forEach((reg) => this.register(reg));
  }

  /**
   * Get a component by type
   */
  getComponent(type: string): React.ComponentType<any> | undefined {
    return this.components.get(type)?.component;
  }

  /**
   * Get component registration
   */
  getRegistration(type: string): ComponentRegistration | undefined {
    return this.components.get(type);
  }

  /**
   * Check if component type is registered
   */
  hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  /**
   * Get all registered component types
   */
  getComponentTypes(): string[] {
    return Array.from(this.components.keys());
  }

  /**
   * Get component map for FormEngineProvider
   */
  getComponentMap(): ComponentMap {
    const map: ComponentMap = {};
    this.components.forEach((registration, type) => {
      map[type] = registration.component;
    });
    return map;
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.components.clear();
  }

  /**
   * Remove a specific component type
   */
  unregister(type: string): boolean {
    return this.components.delete(type);
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: string): ComponentRegistration[] {
    return Array.from(this.components.values()).filter(
      (reg) => reg.config?.category === category
    );
  }
}

// Global registry instance
export const globalComponentRegistry = new ComponentRegistry();

/**
 * Hook for accessing the component registry
 */
export function useComponentRegistry(): ComponentRegistry {
  return globalComponentRegistry;
}

/**
 * Helper function to create a component registration
 */
export function createComponentRegistration(
  type: string,
  component: React.ComponentType<any>,
  config?: ComponentRegistration['config']
): ComponentRegistration {
  return {
    type,
    component,
    config,
  };
}

/**
 * Decorator for registering components
 */
export function registerComponent(
  type: string,
  config?: ComponentRegistration['config']
) {
  return function <T extends React.ComponentType<any>>(component: T): T {
    globalComponentRegistry.register({
      type,
      component,
      config,
    });
    return component;
  };
}

/**
 * Built-in fallback components
 */
export const FallbackComponent: React.FC<{ config: any; formEngine?: FormEngineComponentContext }> = ({ 
  config, 
  formEngine 
}) => (
  <div 
    style={{ 
      padding: '8px', 
      border: '2px dashed #ccc', 
      borderRadius: '4px',
      backgroundColor: '#f9f9f9',
      color: '#666'
    }}
  >
    <strong>Unknown Component: {config.type}</strong>
    {config.id && <div>ID: {config.id}</div>}
    {formEngine?.value !== undefined && (
      <div>Value: {JSON.stringify(formEngine.value)}</div>
    )}
  </div>
);

export const ErrorComponent: React.FC<{ error: Error; config: any }> = ({ error, config }) => (
  <div 
    style={{ 
      padding: '8px', 
      border: '2px solid #f00', 
      borderRadius: '4px',
      backgroundColor: '#ffe6e6',
      color: '#d00'
    }}
  >
    <strong>Component Error: {config.type}</strong>
    {config.id && <div>ID: {config.id}</div>}
    <div>Error: {error.message}</div>
  </div>
);

// Register fallback components
globalComponentRegistry.register({
  type: '__fallback__',
  component: FallbackComponent,
  config: { category: 'Presentation' },
});

globalComponentRegistry.register({
  type: '__error__',
  component: ErrorComponent,
  config: { category: 'Presentation' },
});