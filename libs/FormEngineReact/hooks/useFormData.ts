import { useState, useEffect, useCallback } from 'react';
import { useEngine } from '../FormEngineProvider';

/**
 * Hook for binding to form data with automatic updates
 */
export function useFormData(path: string): [any, (value: any) => void] {
  const engine = useEngine();
  const [value, setValue] = useState(() => engine.getData(path));

  // Subscribe to data changes for this path
  useEffect(() => {
    const unsubscribe = engine.data.subscribeToPath(path, (newValue) => {
      setValue(newValue);
    });

    return unsubscribe;
  }, [engine, path]);

  // Setter function
  const setData = useCallback((newValue: any) => {
    engine.updateData(path, newValue);
  }, [engine, path]);

  return [value, setData];
}

/**
 * Hook for component data binding with repeating group support
 */
export function useComponentData(component: any, parentBinding?: string, itemIndex?: number) {
  const engine = useEngine();
  
  // Early return if component is undefined or null
  if (!component) {
    const [value] = useState(undefined);
    const updateValue = useCallback(() => {}, []);
    return { value, updateValue };
  }
  
  // Check if component has data binding before attempting to get bound value
  const hasDataBinding = component.dataModelBindings && component.dataModelBindings.simpleBinding;
  
  const [value, setValue] = useState(() => 
    hasDataBinding ? engine.getBoundValue(component, parentBinding, itemIndex) : undefined
  );

  useEffect(() => {
    const binding = component.dataModelBindings?.simpleBinding;
    if (!binding) return;

    const effectivePath = parentBinding 
      ? `${parentBinding}[${itemIndex}].${binding.split('.').pop()}`
      : binding;

    const unsubscribe = engine.data.subscribeToPath(effectivePath, (newValue) => {
      setValue(newValue);
    });

    return unsubscribe;
  }, [engine, component, parentBinding, itemIndex]);

  const updateValue = useCallback(
    (newValue: any) => {
      if (!component) return;
      engine.setBoundValue(component, newValue, parentBinding, itemIndex);
    },
    [engine, component, parentBinding, itemIndex]
  );

  return {
    value,
    updateValue,
  };
}

/**
 * Hook for getting all form data
 */
export function useAllFormData(): [any, (data: any) => void] {
  const engine = useEngine();
  const [data, setDataState] = useState(() => engine.getData());

  // Subscribe to all data changes
  useEffect(() => {
    const unsubscribe = engine.subscribeToDataChanges((newData) => {
      setDataState(newData);
    });

    return unsubscribe;
  }, [engine]);

  // Setter function for entire data object
  const setData = useCallback((newData: any) => {
    engine.data.setData(newData);
  }, [engine]);

  return [data, setData];
}