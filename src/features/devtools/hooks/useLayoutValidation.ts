import { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  createLayoutValidator,
  LAYOUT_SCHEMA_NAME,
  validateLayoutSet,
} from 'src/features/devtools/utils/layoutValidation';
import { useCurrentLayoutSetId } from 'src/features/layout/useLayouts';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { httpGet } from 'src/utils/network/networking';

// Hacky (and only) way to get the correct CDN url
const schemaBaseUrl = document
  .querySelector('script[src$="altinn-app-frontend.js"]')
  ?.getAttribute('src')
  ?.replace('altinn-app-frontend.js', 'schemas/json/layout/');

export function useLayoutValidation(enabled: boolean) {
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const layoutSetId = useCurrentLayoutSetId();

  const { data: layoutSchema, isSuccess } = useQuery(
    ['fetchLayoutSchema'],
    () => httpGet(`${schemaBaseUrl}${LAYOUT_SCHEMA_NAME}`),
    {
      enabled: enabled && Boolean(schemaBaseUrl?.length),
    },
  );

  const validator = useMemo(() => {
    if (isSuccess) {
      return createLayoutValidator(layoutSchema);
    } else {
      return null;
    }
  }, [isSuccess, layoutSchema]);

  useEffect(() => {
    if (enabled && layouts && validator && layoutSetId) {
      const validationMessages = validateLayoutSet(layoutSetId, layouts, validator);
      for (const message of validationMessages) {
        window.logErrorOnce(message);
      }
    }
  }, [enabled, layouts, validator, layoutSetId]);
}
