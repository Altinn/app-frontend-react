import JsonPointer from 'jsonpointer';

export const getRootElementPath = (schema: any) => {
  if (![null, undefined].includes(schema.info?.rootNode)) {
    // If rootNode is defined in the schema
    return schema.info.rootNode;
  } else if (schema.info?.meldingsnavn && schema.properties) {
    // SERES workaround
    return schema.properties[schema.info.meldingsnavn]?.$ref || '';
  } else if (schema.properties) {
    const props = Object.keys(schema.properties);
    const firstProp = props[0] ? schema.properties[props[0]] : undefined;
    if (props.length === 1 && firstProp && firstProp.$ref) {
      // While not really compliant with the json schema standard, we have some schemas that expect the root element
      // to be a single property with a $ref to a definition. Typically, this root element is called 'Skjema', but
      // not all schemas follow this convention. A good way to test this, is running this function against schemas
      // in existing apps, and comparing it to the data model bindings used in the app.
      return firstProp.$ref;
    }
  }

  return '';
};

/**
 * Gets a json schema part by a schema patch
 * @param schemaPath the path, format #/properties/model/properties/person/properties/name/maxLength
 * @param jsonSchema the json schema to get part from
 * @returns the part, or null if not found
 */
export function getSchemaPart(schemaPath: string, jsonSchema: object): any {
  try {
    // want to transform path example format to to /properties/model/properties/person/properties/name
    const pointer = schemaPath.substr(1).split('/').slice(0, -1).join('/');
    return JsonPointer.compile(pointer).get(jsonSchema);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Wrapper method around getSchemaPart for schemas made with our old generator tool
 * @param schemaPath the path, format #/properties/model/properties/person/properties/name/maxLength
 * @param mainSchema the main schema to get part from
 * @param rootElementPath the subschema to get part from
 * @returns the part, or null if not found
 */
export function getSchemaPartOldGenerator(schemaPath: string, mainSchema: object, rootElementPath: string): any {
  // for old generators we can have a ref to a definition that is placed outside of the subSchema we validate against.
  // if we are looking for #/definitons/x we search in main schema

  if (/^#\/(definitions|\$defs)\//.test(schemaPath)) {
    return getSchemaPart(schemaPath, mainSchema);
  }
  // all other in sub schema
  return getSchemaPart(schemaPath, getSchemaPart(`${rootElementPath}/#`, mainSchema));
}

export function processInstancePath(path: string): string {
  let result = path.startsWith('.') ? path.slice(1) : path;
  result = result
    .replace(/"]\["|']\['/g, '.')
    .replace(/\["|\['/g, '')
    .replace(/"]|']/g, '');
  return result;
}
