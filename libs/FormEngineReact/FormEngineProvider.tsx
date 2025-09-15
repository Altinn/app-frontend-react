import React, { createContext, useContext, ReactNode } from 'react';
import { FormEngine } from 'libs/FormEngine';

// Component map type
export type ComponentMap = Record<string, React.ComponentType<any>>;

// Context type
interface FormEngineContextType {
  engine: FormEngine;
  componentMap: ComponentMap;
}

// Create context
const FormEngineContext = createContext<FormEngineContextType | null>(null);

// Provider props
interface FormEngineProviderProps {
  engine: FormEngine;
  componentMap: ComponentMap;
  children: ReactNode;
}

// Provider component
export function FormEngineProvider({ engine, componentMap, children }: FormEngineProviderProps) {
  return (
    <FormEngineContext.Provider value={{ engine, componentMap }}>
      {children}
    </FormEngineContext.Provider>
  );
}

// Hook to use FormEngine context
export function useFormEngine(): FormEngineContextType {
  const context = useContext(FormEngineContext);
  if (!context) {
    throw new Error('useFormEngine must be used within a FormEngineProvider');
  }
  return context;
}

// Hook to get just the engine
export function useEngine(): FormEngine {
  const { engine } = useFormEngine();
  return engine;
}

// Hook to get component map
export function useComponentMap(): ComponentMap {
  const { componentMap } = useFormEngine();
  return componentMap;
}