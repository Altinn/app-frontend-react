import { useEffect } from 'react';

import { skipToken, useQuery } from '@tanstack/react-query';
import type { JSONSchema7 } from 'json-schema';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { dotNotationToPointer } from 'src/features/datamodel/notations';
import { lookupBindingInSchema, lookupPathInSchema } from 'src/features/datamodel/SimpleSchemaTraversal';
import type { QueryDefinition } from 'src/core/queries/usePrefetchQuery';
import type { SchemaLookupResult } from 'src/features/datamodel/SimpleSchemaTraversal';

// Also used for prefetching @see formPrefetcher.ts
export function useDataModelSchemaQueryDef(enabled: boolean, dataTypeId?: string): QueryDefinition<JSONSchema7> {
  const { fetchDataModelSchema } = useAppQueries();
  return {
    queryKey: ['fetchDataModelSchemas', dataTypeId],
    queryFn: dataTypeId ? () => fetchDataModelSchema(dataTypeId) : skipToken,
    enabled: enabled && !!dataTypeId,
  };
}

export const useDataModelSchemaQuery = (enabled: boolean, dataTypeId: string) => {
  const queryDef = useDataModelSchemaQueryDef(enabled, dataTypeId);
  const utils = useQuery({
    ...queryDef,
  });

  useEffect(() => {
    utils.error && window.logError('Fetching data model schema failed:\n', utils.error);
  }, [utils.error]);

  return { ...utils, enabled: queryDef.enabled };
};

export interface DataModelSchemaContext {
  schema: JSONSchema7 | undefined;
  lookupTool: SchemaLookupTool;
}

/**
 * Simple caching lookup tool for finding the schema for a given binding/path
 */
export class SchemaLookupTool {
  private schemaCache: Record<string, SchemaLookupResult> = {};
  private schemaPathCache: Record<string, string | null> = {};

  constructor(
    private schema: JSONSchema7,
    private rootElementPath: string,
  ) {}

  public getSchemaForPath(path: string): SchemaLookupResult {
    if (path in this.schemaCache) {
      return this.schemaCache[path];
    }

    const targetPointer = dotNotationToPointer(path);
    const result = lookupBindingInSchema({
      schema: this.schema,
      rootElementPath: this.rootElementPath,
      targetPointer,
    });

    this.schemaCache[path] = result;
    return result;
  }

  public getSchemaPathForDataModelPath(path: string): string | null {
    if (path in this.schemaPathCache) {
      return this.schemaPathCache[path];
    }

    const targetPointer = dotNotationToPointer(path);
    const schemaPath = lookupPathInSchema({
      schema: this.schema,
      rootElementPath: this.rootElementPath,
      targetPointer,
    });

    this.schemaPathCache[path] = schemaPath;
    return schemaPath;
  }
}
