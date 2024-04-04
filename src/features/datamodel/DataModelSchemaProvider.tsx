import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import type { JSONSchema7 } from 'json-schema';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { dotNotationToPointer } from 'src/features/datamodel/notations';
import { lookupBindingInSchema } from 'src/features/datamodel/SimpleSchemaTraversal';
import { useDataModelType } from 'src/features/datamodel/useBindingSchema';
import { getRootElementPath } from 'src/utils/schemaUtils';
import type { SchemaLookupResult } from 'src/features/datamodel/SimpleSchemaTraversal';

export const useDataModelSchemaQuery = (dataModelName: string) => {
  const { fetchDataModelSchema } = useAppQueries();
  const dataType = useDataModelType(dataModelName);
  const enabled = !!dataModelName;

  const utils = useQuery({
    enabled,
    queryKey: ['fetchDataModelSchemas', dataModelName],
    queryFn: () => fetchDataModelSchema(dataModelName!),
    select: (schema) => {
      const rootElementPath = getRootElementPath(schema, dataType);
      const lookupTool = new SchemaLookupTool(schema, rootElementPath);
      return { schema, lookupTool };
    },
  });

  useEffect(() => {
    utils.error && window.logError('Fetching data model schema failed:\n', utils.error);
  }, [utils.error]);

  return { ...utils, enabled };
};

export interface DataModelSchemaContext {
  schema: JSONSchema7 | undefined;
  lookupTool: SchemaLookupTool;
}

/**
 * Simple caching lookup tool for finding the schema for a given binding/path
 */
export class SchemaLookupTool {
  private cache: Record<string, SchemaLookupResult> = {};

  constructor(
    private schema: JSONSchema7,
    private rootElementPath: string,
  ) {}

  public getSchemaForPath(path: string): SchemaLookupResult {
    if (path in this.cache) {
      return this.cache[path];
    }

    const targetPointer = dotNotationToPointer(path);
    const result = lookupBindingInSchema({
      schema: this.schema,
      rootElementPath: this.rootElementPath,
      targetPointer,
    });

    this.cache[path] = result;
    return result;
  }
}
