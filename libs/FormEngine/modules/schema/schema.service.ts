import dot from 'dot-object';
import type { JSONSchema7 } from 'json-schema';

export class SchemaService {
  private schemas: Record<string, JSONSchema7> = {};

  /**
   * Set a data model schema
   */
  setSchema(dataModelName: string, schema: JSONSchema7): void {
    this.schemas[dataModelName] = schema;
  }

  /**
   * Get a data model schema
   */
  getSchema(dataModelName: string): JSONSchema7 | undefined {
    return this.schemas[dataModelName];
  }

  /**
   * Get all schemas
   */
  getAllSchemas(): Record<string, JSONSchema7> {
    return { ...this.schemas };
  }

  /**
   * Clear all schemas
   */
  clearSchemas(): void {
    this.schemas = {};
  }

  /**
   * Get schema properties for a specific path in repeating groups
   */
  getPropertiesForPath(
    dataModelBinding: string,
    parentBinding?: string,
    dataModelName: string = 'model',
  ): Record<string, any> | undefined {
    const schema = this.getSchema(dataModelName);
    if (!schema) {
      return undefined;
    }

    let path = '';

    if (parentBinding) {
      // Handle nested repeating groups
      path = `properties.${dataModelBinding.replace('.', '.items.properties.')}.items.properties`;
    } else {
      // Handle top-level repeating groups
      path = `properties.${dataModelBinding}.items.properties`;
    }

    return dot.pick(path, schema);
  }

  /**
   * Create empty row object based on schema properties
   */
  createEmptyRow(properties: Record<string, any>): Record<string, any> {
    const newRow: Record<string, any> = {};
    
    for (const key of Object.keys(properties)) {
      newRow[key] = null;
    }

    return newRow;
  }

  /**
   * Check if a path exists in schema
   */
  hasPath(path: string, dataModelName: string = 'model'): boolean {
    const schema = this.getSchema(dataModelName);
    if (!schema) {
      return false;
    }

    return dot.pick(path, schema) !== undefined;
  }

  /**
   * Get schema for a specific property
   */
  getPropertySchema(propertyPath: string, dataModelName: string = 'model'): any {
    const schema = this.getSchema(dataModelName);
    if (!schema) {
      return undefined;
    }

    const path = `properties.${propertyPath.replace(/\./g, '.properties.')}`;
    return dot.pick(path, schema);
  }

  /**
   * Validate data against schema
   */
  validateData(data: any, dataModelName: string = 'model'): { valid: boolean; errors: string[] } {
    const schema = this.getSchema(dataModelName);
    if (!schema) {
      return { valid: false, errors: ['Schema not found'] };
    }

    // Basic validation - can be enhanced with a full JSON Schema validator
    const errors: string[] = [];
    
    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredField of schema.required) {
        if (data[requiredField] === undefined || data[requiredField] === null) {
          errors.push(`Required field '${requiredField}' is missing`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get default value for a property based on schema type
   */
  getDefaultValue(propertySchema: any): any {
    if (!propertySchema) {
      return null;
    }

    if (propertySchema.default !== undefined) {
      return propertySchema.default;
    }

    switch (propertySchema.type) {
      case 'string':
        return '';
      case 'number':
      case 'integer':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return null;
    }
  }

  /**
   * Check if a property is an array type (repeating group)
   */
  isArrayProperty(propertyPath: string, dataModelName: string = 'model'): boolean {
    const propertySchema = this.getPropertySchema(propertyPath, dataModelName);
    return propertySchema?.type === 'array';
  }

  /**
   * Get items schema for array properties
   */
  getArrayItemsSchema(propertyPath: string, dataModelName: string = 'model'): any {
    const propertySchema = this.getPropertySchema(propertyPath, dataModelName);
    return propertySchema?.items;
  }
}

// Export singleton instance
export const schemaService = new SchemaService();