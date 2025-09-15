import dot from 'dot-object';
import { dataStore } from 'libs/FormEngine/modules/data/data.store';
import type { DataObject } from 'libs/FormEngine/modules/data/data.store';

export class DataService {
  private store = dataStore;

  /**
   * Get the current data object
   */
  getData(): DataObject | undefined {
    return this.store.getState().getData();
  }

  /**
   * Set the entire data object
   */
  setData(data: DataObject): void {
    this.store.getState().setData(data);
  }

  /**
   * Get a specific value from the data object using dot notation
   */
  getValue(path: string): any {
    const data = this.getData();
    if (!data) {
      return undefined;
    }

    return dot.pick(path, data);
  }

  /**
   * Set a specific value in the data object using dot notation
   */
  setValue(path: string, value: any): void {
    this.store.getState().updateData((data) => {
      const newData = { ...data };
      dot.set(path, value, newData);
      return newData;
    });
  }

  /**
   * Delete a value from the data object using dot notation
   */
  deleteValue(path: string): void {
    this.store.getState().updateData((data) => {
      const newData = { ...data };
      dot.delete(path, newData);
      return newData;
    });
  }

  /**
   * Merge partial data into the existing data object
   */
  mergeData(partialData: Partial<DataObject>): void {
    this.store.getState().updateData((data) => ({
      ...data,
      ...partialData,
    }));
  }

  /**
   * Clear all data
   */
  clearData(): void {
    this.store.getState().clearData();
  }

  /**
   * Subscribe to data changes
   */
  subscribe(listener: (data: DataObject | undefined) => void): () => void {
    return this.store.subscribe((state) => state.data, listener);
  }

  /**
   * Subscribe to a specific path in the data
   */
  subscribeToPath(path: string, listener: (value: any) => void): () => void {
    let previousValue = this.getValue(path);

    return this.store.subscribe(
      (state) => state.data,
      () => {
        const currentValue = this.getValue(path);
        if (currentValue !== previousValue) {
          previousValue = currentValue;
          listener(currentValue);
        }
      },
    );
  }

  /**
   * Check if a path exists in the data
   */
  hasValue(path: string): boolean {
    const data = this.getData();
    if (!data) {
      return false;
    }

    return dot.pick(path, data) !== undefined;
  }

  /**
   * Get all keys at a specific path
   */
  getKeys(path?: string): string[] {
    const target = path ? this.getValue(path) : this.getData();

    if (!target || typeof target !== 'object') {
      return [];
    }

    return Object.keys(target);
  }

  /**
   * Move a value from one path to another
   */
  moveValue(fromPath: string, toPath: string): void {
    const value = this.getValue(fromPath);
    if (value !== undefined) {
      this.store.getState().updateData((data) => {
        const newData = { ...data };
        dot.move(fromPath, toPath, newData);
        return newData;
      });
    }
  }

  /**
   * Copy a value from one path to another
   */
  copyValue(fromPath: string, toPath: string): void {
    const value = this.getValue(fromPath);
    if (value !== undefined) {
      this.setValue(toPath, value);
    }
  }

  /**
   * Transform data to dot notation
   */
  toDotNotation(): Record<string, any> | undefined {
    const data = this.getData();
    if (!data) {
      return undefined;
    }

    return dot.dot(data);
  }

  /**
   * Set data from dot notation
   */
  fromDotNotation(dotData: Record<string, any>): void {
    const data = dot.object(dotData);
    this.setData(data as DataObject);
  }

  /**
   * Validate that data matches expected structure
   */
  validateStructure(schema: Record<string, any>): boolean {
    const data = this.getData();
    if (!data) {
      return false;
    }

    const validate = (obj: any, schemaObj: any): boolean => {
      for (const key in schemaObj) {
        if (!(key in obj)) {
          return false;
        }

        if (typeof schemaObj[key] === 'object' && schemaObj[key] !== null) {
          if (typeof obj[key] !== 'object' || obj[key] === null) {
            return false;
          }

          if (!validate(obj[key], schemaObj[key])) {
            return false;
          }
        }
      }

      return true;
    };

    return validate(data, schema);
  }

  /**
   * Create a snapshot of current data
   */
  createSnapshot(): DataObject | undefined {
    const data = this.getData();
    return data ? JSON.parse(JSON.stringify(data)) : undefined;
  }

  /**
   * Restore data from a snapshot
   */
  restoreSnapshot(snapshot: DataObject): void {
    this.setData(JSON.parse(JSON.stringify(snapshot)));
  }

  /**
   * Get value with default if undefined
   */
  getValueOrDefault<T = any>(path: string, defaultValue: T): T {
    const value = this.getValue(path);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Set value only if path doesn't exist
   */
  setValueIfNotExists(path: string, value: any): boolean {
    if (!this.hasValue(path)) {
      this.setValue(path, value);
      return true;
    }
    return false;
  }

  /**
   * Batch update multiple values
   */
  batchUpdate(updates: Record<string, any>): void {
    this.store.getState().updateData((data) => {
      const newData = { ...data };

      for (const [path, value] of Object.entries(updates)) {
        dot.set(path, value, newData);
      }

      return newData;
    });
  }
}

// Export singleton instance
export const dataService = new DataService();
