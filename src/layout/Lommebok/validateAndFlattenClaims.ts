import { getCredentialConfig } from 'src/layout/Lommebok/api';
import type { SchemaLookupResult } from 'src/features/datamodel/SimpleSchemaTraversal';
import type { FDLeafValue } from 'src/features/formData/FormDataWrite';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { VerificationResultResponse } from 'src/layout/Lommebok/api';
import type { RequestedDocument } from 'src/layout/Lommebok/config.generated';

export interface ValidationError {
  field: string;
  message: string;
}

export interface FlattenedClaim {
  reference: IDataModelReference;
  newValue: FDLeafValue;
}

/**
 * Flattens a nested object into dot-notation paths with their values.
 * Only returns leaf values (primitives and arrays of primitives).
 *
 * @param obj - The object to flatten
 * @param prefix - The current path prefix (used in recursion)
 * @returns Array of [path, value] tuples
 */
function flattenObject(obj: unknown, prefix = ''): Array<[string, FDLeafValue]> {
  const result: Array<[string, FDLeafValue]> = [];

  if (obj === null || obj === undefined) {
    return [[prefix, null]];
  }

  // Handle primitive leaf values
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return [[prefix, obj]];
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    // Check if it's an array of primitives (valid leaf value)
    if (obj.every((item) => typeof item === 'string')) {
      return [[prefix, obj as string[]]];
    }

    // Otherwise, flatten each array element
    for (let i = 0; i < obj.length; i++) {
      const itemPath = `${prefix}[${i}]`;
      result.push(...flattenObject(obj[i], itemPath));
    }
    return result;
  }

  // Handle objects
  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = prefix ? `${prefix}.${key}` : key;
      result.push(...flattenObject(value, newPath));
    }
    return result;
  }

  // Unknown type, skip
  return [];
}

/**
 * Validates claims against the data type schema and flattens them for FormData.
 *
 * @param claims - The claims object received from the wallet
 * @param dataType - The data type ID to validate against
 * @param docType - The document type (for error messages)
 * @param lookupBinding - The schema lookup function from DataModels
 * @returns Object containing either flattened claims or validation errors
 */
export function validateAndFlattenClaims(
  claims: VerificationResultResponse['claims'],
  dataType: string,
  docType: RequestedDocument['type'],
  lookupBinding: ((reference: IDataModelReference) => SchemaLookupResult) | undefined,
): { claims?: FlattenedClaim[]; errors?: ValidationError[] } {
  const errors: ValidationError[] = [];
  const flattenedClaims: FlattenedClaim[] = [];

  // Check if schema lookup is available
  if (!lookupBinding) {
    errors.push({
      field: '_general',
      message: `Schema lookup not available for data type: ${dataType}`,
    });
    return { errors };
  }

  // Get the credential configuration to know which claims are expected
  const credentialConfig = getCredentialConfig(docType);
  if (!credentialConfig) {
    errors.push({
      field: '_general',
      message: `Could not find credential configuration for document type: ${docType}`,
    });
    return { errors };
  }

  const [, config] = credentialConfig;

  // Flatten the claims object
  const flattened = flattenObject(claims);

  // Build a map of expected claim paths from the credential configuration
  const expectedPaths = new Set<string>();
  for (const claim of config.claims) {
    // Extract field name from the claim path
    const fieldName = claim.path[claim.path.length - 1];
    expectedPaths.add(fieldName);
  }

  // Validate each flattened claim against the schema
  for (const [path, value] of flattened) {
    // Skip null/undefined values
    if (value === null || value === undefined) {
      continue;
    }

    // Check if this field is expected in the credential configuration
    const topLevelField = path.split('.')[0].split('[')[0];
    if (!expectedPaths.has(topLevelField)) {
      errors.push({
        field: path,
        message: `Field '${path}' is not expected in the credential configuration for ${docType}`,
      });
      continue;
    }

    // Look up the field in the data type schema
    const [schema, lookupError] = lookupBinding({ dataType, field: path });

    if (lookupError) {
      errors.push({
        field: path,
        message: `Field '${path}' not found in data type '${dataType}': ${JSON.stringify(lookupError)}`,
      });
      continue;
    }

    if (!schema) {
      errors.push({
        field: path,
        message: `Field '${path}' not found in data type '${dataType}' schema`,
      });
      continue;
    }

    // If we got here, the field is valid - add it to the result
    flattenedClaims.push({
      reference: { dataType, field: path },
      newValue: value,
    });
  }

  // Check for mandatory fields that are missing
  for (const claim of config.claims) {
    if (claim.mandatory) {
      const fieldName = claim.path[claim.path.length - 1];
      const hasField = flattened.some(
        ([path]) => path === fieldName || path.startsWith(`${fieldName}.`) || path.startsWith(`${fieldName}[`),
      );

      if (!hasField) {
        errors.push({
          field: fieldName,
          message: `Mandatory field '${fieldName}' is missing from wallet response`,
        });
      }
    }
  }

  // Return errors if any were found (strict validation)
  if (errors.length > 0) {
    return { errors };
  }

  return { claims: flattenedClaims };
}
