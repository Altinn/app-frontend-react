import { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import Ajv from 'ajv';
import type { DefinedError, ErrorObject } from 'ajv';

import { useCurrentLayoutSetId } from 'src/features/layout/useLayouts';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  groupIsNonRepeatingExt,
  groupIsNonRepeatingPanelExt,
  groupIsRepeatingExt,
  groupIsRepeatingLikertExt,
} from 'src/layout/Group/tools';
import { httpGet } from 'src/utils/network/networking';
import { duplicateStringFilter } from 'src/utils/stringHelper';
import type { CompOrGroupExternal } from 'src/layout/layout';

// Hacky (and only) way to get the correct CDN url
const SCHEMA_BASE_URL = document
  .querySelector('script[src$="altinn-app-frontend.js"]')
  ?.getAttribute('src')
  ?.replace('altinn-app-frontend.js', 'schemas/json/layout/');
const LAYOUT_SCHEMA_NAME = 'layout.schema.v1.json';
const EXPRESSION_SCHEMA_NAME = 'expression.schema.v1.json';

const COMPONENT_POINTER = '#/definitions/AnyComponent';
const NON_REPEATING_GROUP_POINTER = '#/definitions/CompGroupNonRepeating';
const NON_REPEATING_GROUP_PANEL_POINTER = '#/definitions/CompGroupNonRepeatingPanel';
const REPEATING_GROUP_POINTER = '#/definitions/CompGroupRepeating';
const REPEATING_GROUP_LIKERT_POINTER = '#/definitions/CompGroupRepeatingLikert';

async function fetchSchemas() {
  const [layoutSchema, expressionSchema] = await Promise.all([
    httpGet(`${SCHEMA_BASE_URL}${LAYOUT_SCHEMA_NAME}`),
    httpGet(`${SCHEMA_BASE_URL}${EXPRESSION_SCHEMA_NAME}`),
  ]);
  return { layoutSchema, expressionSchema };
}

export function useLayoutValidation(enabled: boolean) {
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const layoutSetId = useCurrentLayoutSetId();

  const { data: schemas, isSuccess } = useQuery(['fetchSchemas'], fetchSchemas, {
    enabled: enabled && Boolean(SCHEMA_BASE_URL?.length),
  });

  const validator = useMemo(() => {
    if (isSuccess) {
      const { layoutSchema, expressionSchema } = schemas;
      const ajv = new Ajv({
        strict: false,
        strictTypes: false,
        strictTuples: false,
        verbose: true,
      });
      ajv.addSchema(expressionSchema, EXPRESSION_SCHEMA_NAME);
      ajv.addSchema(layoutSchema, LAYOUT_SCHEMA_NAME);
      return ajv;
    } else {
      return null;
    }
  }, [isSuccess, schemas]);

  useEffect(() => {
    if (enabled && layouts && validator) {
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
              window.logError(
                `Component ${layoutSetId}/${layoutName}.json/${component.id} (${type}) has errors in its configuration:\n-`,
                errorMessages.join('\n- '),
              );
            }
          }
        }
      }
    }
  }, [enabled, layouts, validator, layoutSetId]);
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

function getPropertyString(error: ErrorObject): string {
  const instancePaths = error.instancePath.split('/').slice(1);

  if (instancePaths.length === 0) {
    return '';
  }

  return `'${instancePaths
    .map((path, i) => {
      if (!isNaN(parseInt(path))) {
        return `[${path}]`;
      }
      return `${i != 0 ? '.' : ''}${path}`;
    })
    .join('')}'`;
}

function formatError(error: DefinedError): string | null {
  const propertyString = getPropertyString(error);
  const propertyReference = propertyString.length ? ` in ${propertyString}` : '';

  switch (error.keyword) {
    case 'additionalProperties':
      return `Property '${error.params.additionalProperty}' is not allowed${propertyReference}`;
    // case 'const':
    //   return `Invalid property value ${property}, expected value: ${error.params.allowedValue}`;
    case 'required':
      return `Property '${error.params.missingProperty}' is required${propertyReference}`;
    case 'pattern':
      return `Invalid property value for ${propertyString}\n  Value '${error.data}' does not match the pattern '${error.params.pattern}'`;
    case 'enum':
      return `Invalid property value for ${propertyString}\n  Value '${
        error.data
      }' is not one of the allowed values: [${error.params.allowedValues.map((v) => `'${v}'`).join(', ')}]`;
    case 'if':
    case 'anyOf':
    case 'const':
    case 'oneOf':
      // Ignore these keywords as they are mostly useless feedback and caused by other errors that are easier to identify.
      return null;
    default:
      // Leaving this here in case we discover other keywords that we want to either properly report or ignore.
      return JSON.stringify(error);
  }
  return `${propertyString.length} ${JSON.stringify(error)}`;
}
