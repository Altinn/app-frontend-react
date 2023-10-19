import { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import Ajv from 'ajv';
import type { DefinedError, ErrorObject } from 'ajv';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { httpGet } from 'src/utils/network/networking';
import { duplicateStringFilter } from 'src/utils/stringHelper';
import type { CompOrGroupExternal, ILayout } from 'src/layout/layout';

// Hacky way to get the correct CDN url
const SCHEMA_BASE_URL = document
  .querySelector('script[src$="altinn-app-frontend.js"]')
  ?.getAttribute('src')
  ?.replace('altinn-app-frontend.js', 'schemas/json/layout/');

const LAYOUT_POINTER = '#/definitions/ILayoutFile/properties/data/properties/layout';
const LAYOUT_SCHEMA_NAME = 'layout.schema.v1.json';
const EXPRESSION_SCHEMA_NAME = 'expression.schema.v1.json';

async function fetchSchemas() {
  const [layoutSchema, expressionSchema] = await Promise.all([
    httpGet(`${SCHEMA_BASE_URL}${LAYOUT_SCHEMA_NAME}`),
    httpGet(`${SCHEMA_BASE_URL}${EXPRESSION_SCHEMA_NAME}`),
  ]);
  return { layoutSchema, expressionSchema };
}

export function useLayoutValidation(enabled: boolean) {
  const layouts = useAppSelector((state) => state.formLayout.layouts);

  const { data: schemas, isSuccess } = useQuery(['fetchSchemas'], fetchSchemas, {
    enabled: enabled && Boolean(SCHEMA_BASE_URL?.length),
  });

  const validator = useMemo(() => {
    if (isSuccess) {
      const { layoutSchema, expressionSchema } = schemas;
      const ajv = new Ajv({
        allErrors: true,
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
        const isValid = validator.validate(`${LAYOUT_SCHEMA_NAME}${LAYOUT_POINTER}`, layout);

        if (!isValid && validator.errors) {
          const componentErrors: { [k in string]: { component: CompOrGroupExternal; errors: ErrorObject[] } } = {};

          for (const error of validator.errors) {
            const component = getComponent(error, layout!);

            if (!componentErrors[component.id]) {
              componentErrors[component.id] = { component, errors: [] };
            }
            componentErrors[component.id].errors.push(error);
          }

          for (const { component, errors } of Object.values(componentErrors)) {
            const errorMessages = errors
              .map(formatError)
              .filter((m) => m != null)
              .filter(duplicateStringFilter);

            if (errorMessages.length) {
              window.logError(
                `Component ${layoutName}/${component.id} (${component.type}) has errors in its configuration:\n-`,
                errorMessages.join('\n- '),
              );
            }
          }
        }
      }
    }
  }, [enabled, layouts, validator]);
}

function getComponent(error: ErrorObject, layout: ILayout): CompOrGroupExternal {
  const instancePaths = error.instancePath.split('/');
  const componentIndex = parseInt(instancePaths[1]);
  return layout[componentIndex];
}

function getPropertyString(error: ErrorObject): string {
  const instancePaths = error.instancePath.split('/').slice(2);

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
      return `Invalid property value for ${propertyString}. '${error.data}' does not match the pattern '${error.params.pattern}'`;
    case 'enum':
      return `Invalid property value for ${propertyString}. '${
        error.data
      }' is not one of the allowed values: [${error.params.allowedValues.map((v) => `'${v}'`).join(', ')}]`;
    case 'if':
    case 'anyOf':
    case 'oneOf':
      // case 'const':
      return null;
    default:
      return JSON.stringify(error);
  }
  return `${propertyString.length} ${JSON.stringify(error)}`;
}
