import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { createLayoutValidator, validateLayoutSet } from 'src/features/devtools/utils/layoutValidation';
import { useCurrentLayoutSetId } from 'src/features/layout/useLayouts';
import { useAppSelector } from 'src/hooks/useAppSelector';
import type { LayoutValidationErrors } from 'src/features/devtools/layoutValidation/types';

export function useLayoutSchemaValidation(enabled: boolean): LayoutValidationErrors | undefined {
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const layoutSetId = useCurrentLayoutSetId() || 'default';

  const { fetchLayoutSchema } = useAppQueries();
  const { data: layoutSchema, isSuccess } = useQuery(['fetchLayoutSchema'], () => fetchLayoutSchema(), { enabled });

  const validator = useMemo(() => {
    if (isSuccess && layoutSchema) {
      return createLayoutValidator(layoutSchema);
    } else {
      return null;
    }
  }, [isSuccess, layoutSchema]);

  return useMemo(() => {
    if (enabled && layouts && validator && layoutSetId) {
      const validationMessages = validateLayoutSet(layoutSetId, layouts, validator);
      for (const layoutSet of Object.values(validationMessages)) {
        for (const layout of Object.values(layoutSet)) {
          for (const components of Object.values(layout)) {
            for (const message of components) {
              window.logErrorOnce(message);
            }
          }
        }
      }

      return validationMessages;
    }

    return undefined;
  }, [enabled, layouts, validator, layoutSetId]);
}
