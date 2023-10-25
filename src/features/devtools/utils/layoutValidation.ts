/* eslint-disable no-case-declarations */
import Ajv from 'ajv';
import type { DefinedError, ErrorObject } from 'ajv';
import type { JSONSchema7 } from 'json-schema';

import {
  groupIsNonRepeatingExt,
  groupIsNonRepeatingPanelExt,
  groupIsRepeatingExt,
  groupIsRepeatingLikertExt,
} from 'src/layout/Group/tools';
import { duplicateStringFilter } from 'src/utils/stringHelper';
import type { CompOrGroupExternal, ILayouts } from 'src/layout/layout';

export const LAYOUT_SCHEMA_NAME = 'layout.schema.v1.json';

const COMPONENT_POINTER = '#/definitions/AnyComponent';
const NON_REPEATING_GROUP_POINTER = '#/definitions/CompGroupNonRepeating';
const NON_REPEATING_GROUP_PANEL_POINTER = '#/definitions/CompGroupNonRepeatingPanel';
const REPEATING_GROUP_POINTER = '#/definitions/CompGroupRepeating';
const REPEATING_GROUP_LIKERT_POINTER = '#/definitions/CompGroupRepeatingLikert';

/**
 * Create a validator for the layout schema.
 */
export function createLayoutValidator(layoutSchema: JSONSchema7) {
  const ajv = new Ajv({
    messages: false,
    strict: false,
    strictTypes: false,
    strictTuples: false,
    verbose: true,
  });
  ajv.addSchema(removeExpressionRefs(layoutSchema), LAYOUT_SCHEMA_NAME);
  return ajv;
}

/**
 * Validate a layout set against the layout schema.
 * @returns an array of human readable validation messages
 */
export function validateLayoutSet(layoutSetId: string, layouts: ILayouts, validator: Ajv) {
  const validationMessages: string[] = [];
  for (const [layoutName, layout] of Object.entries(layouts)) {
    for (const component of layout || []) {
      const { type, pointer } = getComponentTypeAndPointer(component);
      const isValid = validator.validate(`${LAYOUT_SCHEMA_NAME}${pointer}`, component);

      if (!isValid && validator.errors) {
        const errorMessages = validator.errors
          .map(formatError)
          .filter((m) => m != null)
          .filter(duplicateStringFilter);

        if (errorMessages.length) {
          validationMessages.push(
            `Component ${layoutSetId}/${layoutName}.json/${
              component.id
            } (${type}) has errors in its configuration:\n- ${errorMessages.join('\n- ')}`,
          );
        }
      }
    }
  }
  return validationMessages;
}

/**
 * Replace references to expression schema with anyOf[<type>, array].
 * Add comment to signal that the value can be an expression or <type>.
 * Add comment to ignore the array case to avoid duplicate errors.
 */
function removeExpressionRefs(schema: JSONSchema7): JSONSchema7 {
  const processedSchema = structuredClone(schema);
  removeExpressionRefsRecursive(processedSchema);
  return processedSchema;
}

function removeExpressionRefsRecursive(schema: object) {
  if (Array.isArray(schema)) {
    for (const item of schema) {
      if (typeof item === 'object' && item !== null) {
        removeExpressionRefsRecursive(item);
      }
    }
  }
  if (typeof schema === 'object') {
    for (const [key, value] of Object.entries(schema)) {
      if (key === '$ref' && typeof value === 'string' && value.startsWith('expression.schema.v1.json#/definitions/')) {
        const type = value.replace('expression.schema.v1.json#/definitions/', '');
        delete schema['$ref'];
        schema['anyOf'] = [
          { type, comment: 'expression' },
          { type: 'array', comment: 'ignore' },
        ];
      }
      if (typeof value === 'object' && value !== null) {
        removeExpressionRefsRecursive(value);
      }
    }
  }
}

/**
 * Workaround to only validate against one type of group component at a time.
 */
function getComponentTypeAndPointer(component: CompOrGroupExternal): { type: string; pointer: string } {
  if (component.type === 'Group') {
    if (groupIsNonRepeatingExt(component)) {
      return { type: 'Group', pointer: NON_REPEATING_GROUP_POINTER };
    }
    if (groupIsNonRepeatingPanelExt(component)) {
      return { type: 'Panel Group', pointer: NON_REPEATING_GROUP_PANEL_POINTER };
    }
    if (groupIsRepeatingLikertExt(component)) {
      return { type: 'Likert group', pointer: REPEATING_GROUP_LIKERT_POINTER };
    }
    if (groupIsRepeatingExt(component)) {
      return { type: 'Repeating group', pointer: REPEATING_GROUP_POINTER };
    }
  }
  return { type: component.type, pointer: COMPONENT_POINTER };
}

/**
 * Get the property path for the error. Empty means it is in the root of the component.
 */
function getProperty(error: ErrorObject): string | undefined {
  const instancePaths = error.instancePath.split('/').slice(1);

  if (instancePaths.length === 0) {
    return undefined;
  }

  return instancePaths
    .map((path, i) => {
      if (!isNaN(parseInt(path))) {
        return `[${path}]`;
      }
      return `${i != 0 ? '.' : ''}${path}`;
    })
    .join('');
}

/**
 * Format an AJV validation error into a human readable string.
 * @param error the AJV validation error object
 * @returns a human readable string describing the error
 */
function formatError(error: DefinedError): string | null {
  if (error.parentSchema?.comment === 'ignore') {
    return null;
  }

  const canBeExpression = error.parentSchema?.comment === 'expression';

  const property = getProperty(error);
  const propertyString = property?.length ? `'${property}'` : '';
  const propertyReference = property?.length ? ` in '${property}'` : '';

  switch (error.keyword) {
    case 'additionalProperties':
      return `Property '${error.params.additionalProperty}' is not allowed${propertyReference}`;
    case 'required':
      return `Property '${error.params.missingProperty}' is required${propertyReference}`;
    case 'pattern':
      return `Invalid property value for ${propertyString}, value '${error.data}' does not match the pattern '${error.params.pattern}'`;
    case 'enum':
      const allowedValues = error.params.allowedValues.map((v) => `'${v}'`).join(', ');
      return `Invalid property value for ${propertyString}, value '${error.data}' is not one of the allowed values: [${allowedValues}]`;
    case 'type':
      return `Invalid property value for ${propertyString}, value '${error.data}' is not of type '${
        error.params.type
      }' ${canBeExpression ? 'or an expression' : ''}`;
    case 'if':
    case 'anyOf':
    case 'oneOf':
    case 'const':
    case 'additionalItems':
      // Ignore these keywords as they are mostly useless feedback and caused by other errors that are easier to identify.
      return null;
    default:
      // Leaving this here in case we discover other keywords that we want to either properly report or ignore.
      return JSON.stringify(error);
  }
}
