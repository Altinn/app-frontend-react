import { useState, useEffect, useCallback } from 'react';
import { useEngine } from '../FormEngineProvider';

/**
 * Hook for managing repeating groups
 */
export function useRepeatingGroup(dataModelBinding: string, parentBinding?: string, itemIndex?: number) {
  const engine = useEngine();
  
  const [items, setItems] = useState<any[]>(() => {
    const data = engine.data.getData();
    if (!data) return [];
    
    const path = parentBinding 
      ? `${parentBinding}[${itemIndex}].${dataModelBinding.split('.').pop()}`
      : dataModelBinding;
    
    const value = engine.data.getValue(path);
    return Array.isArray(value) ? value : [];
  });

  // Subscribe to changes in the repeating group data
  useEffect(() => {
    const path = parentBinding 
      ? `${parentBinding}[${itemIndex}].${dataModelBinding.split('.').pop()}`
      : dataModelBinding;

    const unsubscribe = engine.data.subscribeToPath(path, (newValue) => {
      setItems(Array.isArray(newValue) ? newValue : []);
    });

    return unsubscribe;
  }, [engine, dataModelBinding, parentBinding, itemIndex]);

  const addRow = useCallback(() => {
    try {
      engine.addRow(dataModelBinding, parentBinding, itemIndex);
    } catch (error) {
      console.error('Failed to add row:', error);
    }
  }, [engine, dataModelBinding, parentBinding, itemIndex]);

  const removeRow = useCallback((rowIndex: number) => {
    const path = parentBinding 
      ? `${parentBinding}[${itemIndex}].${dataModelBinding.split('.').pop()}`
      : dataModelBinding;
    
    const currentItems = [...items];
    currentItems.splice(rowIndex, 1);
    
    engine.data.setValue(path, currentItems);
  }, [engine, items, dataModelBinding, parentBinding, itemIndex]);

  const moveRow = useCallback((fromIndex: number, toIndex: number) => {
    const path = parentBinding 
      ? `${parentBinding}[${itemIndex}].${dataModelBinding.split('.').pop()}`
      : dataModelBinding;
    
    const currentItems = [...items];
    const [movedItem] = currentItems.splice(fromIndex, 1);
    currentItems.splice(toIndex, 0, movedItem);
    
    engine.data.setValue(path, currentItems);
  }, [engine, items, dataModelBinding, parentBinding, itemIndex]);

  const updateRowItem = useCallback((rowIndex: number, field: string, value: any) => {
    const path = parentBinding 
      ? `${parentBinding}[${itemIndex}].${dataModelBinding.split('.').pop()}[${rowIndex}].${field}`
      : `${dataModelBinding}[${rowIndex}].${field}`;
    
    engine.data.setValue(path, value);
  }, [engine, dataModelBinding, parentBinding, itemIndex]);

  const getRowItem = useCallback((rowIndex: number, field: string) => {
    const path = parentBinding 
      ? `${parentBinding}[${itemIndex}].${dataModelBinding.split('.').pop()}[${rowIndex}].${field}`
      : `${dataModelBinding}[${rowIndex}].${field}`;
    
    return engine.data.getValue(path);
  }, [engine, dataModelBinding, parentBinding, itemIndex]);

  return {
    items,
    count: items.length,
    addRow,
    removeRow,
    moveRow,
    updateRowItem,
    getRowItem,
  };
}

/**
 * Hook for repeating group item context
 */
export function useRepeatingGroupItem(
  parentBinding: string,
  itemIndex: number,
  component?: any
) {
  const engine = useEngine();

  const getValue = useCallback((field: string) => {
    const path = `${parentBinding}[${itemIndex}].${field}`;
    return engine.data.getValue(path);
  }, [engine, parentBinding, itemIndex]);

  const setValue = useCallback((field: string, value: any) => {
    const path = `${parentBinding}[${itemIndex}].${field}`;
    engine.data.setValue(path, value);
  }, [engine, parentBinding, itemIndex]);

  const getBoundValue = useCallback(() => {
    if (!component?.dataModelBindings?.simpleBinding) return undefined;
    return engine.getBoundValue(component, parentBinding, itemIndex);
  }, [engine, component, parentBinding, itemIndex]);

  const setBoundValue = useCallback((value: any) => {
    if (!component?.dataModelBindings?.simpleBinding) return;
    engine.setBoundValue(component, value, parentBinding, itemIndex);
  }, [engine, component, parentBinding, itemIndex]);

  return {
    parentBinding,
    itemIndex,
    getValue,
    setValue,
    getBoundValue,
    setBoundValue,
  };
}