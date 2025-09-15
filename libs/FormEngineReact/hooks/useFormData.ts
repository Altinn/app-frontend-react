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