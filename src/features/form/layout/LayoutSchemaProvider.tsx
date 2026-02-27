import React, { useRef } from 'react';
import type { PropsWithChildren } from 'react';

import { useQuery } from '@tanstack/react-query';
import type { ErrorObject } from 'ajv';
import type Ajv from 'ajv';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { createContext } from 'src/core/contexts/context';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import {
  createLayoutValidator,
  EMPTY_SCHEMA_NAME,
  LAYOUT_SCHEMA_NAME,
} from 'src/features/devtools/utils/layoutSchemaValidation';
import { isDev } from 'src/utils/isDev';

type ValidateFunc = ReturnType<typeof makeValidateFunc>;

const { Provider, useCtx } = createContext<ValidateFunc | null>({ name: 'LayoutSchemaProvider', required: true });

export function LayoutSchemaProvider({ children }: PropsWithChildren) {
  const enabled = useIsLayoutValidationEnabled();

  const { fetchLayoutSchema } = useAppQueries();
  const { data } = useQuery({
    enabled,
    queryKey: ['fetchLayoutSchema'],
    queryFn: async () => {
      const schema = await fetchLayoutSchema();
      if (!schema) {
        return null;
      }
      return makeValidateFunc(createLayoutValidator(schema));
    },
  });

  return <Provider value={data ?? null}>{children}</Provider>;
}

export const useLayoutSchemaValidator = useCtx;

function useIsLayoutValidationEnabled() {
  const hasBeenEnabledBefore = useRef(false);
  const panelOpen = useDevToolsStore((s) => s.isOpen);
  const enabled = isDev() || panelOpen || hasBeenEnabledBefore.current;
  hasBeenEnabledBefore.current = enabled;

  if (window.forceNodePropertiesValidation === 'on') {
    return true;
  }

  if (window.forceNodePropertiesValidation === 'off') {
    return false;
  }

  return enabled;
}

/**
 * Validation function passed to component classes.
 * Component class decides which schema pointer to use and what data to validate.
 * If pointer is null, it will validate against an empty schema with additionalProperties=false,
 * to indicate that everything is invalid. Useful for grid cells where the type cannot be decided.
 * Component classes can choose to modify the output errors before returning.
 */
function makeValidateFunc(validator: Ajv) {
  function validate(pointer: string | null, data: unknown): ErrorObject[] | undefined {
    const isValid = pointer?.length
      ? validator.validate(`${LAYOUT_SCHEMA_NAME}${pointer}`, data)
      : validator.validate(EMPTY_SCHEMA_NAME, data);

    if (!isValid && validator.errors) {
      return validator.errors;
    }
    return undefined;
  }

  return validate;
}
