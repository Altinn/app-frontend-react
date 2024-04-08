import { useMemo } from 'react';

import type { JSONSchema7 } from 'json-schema';

import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import {
  getCurrentDataTypeForApplication,
  getCurrentTaskDataElementId,
  getFirstDataElementId,
  useDataTypeByLayoutSetId,
} from 'src/features/applicationMetadata/appMetadataUtils';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useCurrentLayoutSetId } from 'src/features/form/layoutSets/useCurrentLayoutSetId';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useAllowAnonymous } from 'src/features/stateless/getAllowAnonymous';
import {
  getAnonymousStatelessDataModelUrl,
  getDataElementUrl,
  getStatelessDataModelUrl,
} from 'src/utils/urls/appUrlHelper';
import { useIsStatelessApp } from 'src/utils/useIsStatelessApp';
import type { IDataModelBindings } from 'src/layout/layout';

export type AsSchema<T> = {
  [P in keyof T]: JSONSchema7 | null;
};

export function useCurrentDataModelGuid() {
  const instance = useLaxInstanceData();
  const application = useApplicationMetadata();
  const layoutSets = useLayoutSets();
  const taskId = useProcessTaskId();

  return getCurrentTaskDataElementId({ application, instance, taskId, layoutSets });
}

export function useCurrentDataModelUrl(includeRowIds: boolean) {
  const isAnonymous = useAllowAnonymous();
  const instance = useLaxInstanceData();
  const layoutSetId = useCurrentLayoutSetId();
  const dataType = useDataTypeByLayoutSetId(layoutSetId);
  const dataElementUuid = useCurrentDataModelGuid();
  const isStateless = useIsStatelessApp();
  const language = useCurrentLanguage();

  if (isStateless && isAnonymous && dataType) {
    return getAnonymousStatelessDataModelUrl(dataType, includeRowIds);
  }

  if (isStateless && !isAnonymous && dataType) {
    return getStatelessDataModelUrl(dataType, includeRowIds);
  }

  if (instance?.id && dataElementUuid) {
    return getDataElementUrl(instance.id, dataElementUuid, language, includeRowIds);
  }

  return undefined;
}

export function useDataModelUrl(includeRowIds: boolean, dataType: string | undefined) {
  const isAnonymous = useAllowAnonymous();
  const isStateless = useIsStatelessApp();
  const instance = useLaxInstanceData();
  const language = useCurrentLanguage();

  if (isStateless && isAnonymous && dataType) {
    return getAnonymousStatelessDataModelUrl(dataType, includeRowIds);
  }

  if (isStateless && !isAnonymous && dataType) {
    return getStatelessDataModelUrl(dataType, includeRowIds);
  }

  if (instance?.id && dataType) {
    const uuid = getFirstDataElementId(instance, dataType);
    if (uuid) {
      return getDataElementUrl(instance.id, uuid, language, includeRowIds);
    }
  }

  return undefined;
}

export function useCurrentDataModelName() {
  const application = useApplicationMetadata();
  const layoutSets = useLayoutSets();
  const taskId = useProcessTaskId();

  return getCurrentDataTypeForApplication({
    application,
    layoutSets,
    taskId,
  });
}

export function useCurrentDataModelType() {
  const name = useCurrentDataModelName();
  const application = useApplicationMetadata();

  return application.dataTypes.find((dt) => dt.id === name);
}

export function useDataModelType(dataType: string) {
  const application = useApplicationMetadata();

  return application.dataTypes.find((dt) => dt.id === dataType);
}

export function useBindingSchema<T extends IDataModelBindings | undefined>(bindings: T): AsSchema<T> | undefined {
  const lookup = useLaxCurrentDataModelSchemaLookup();

  return useMemo(() => {
    const resolvedBindings = bindings && Object.values(bindings).length ? { ...bindings } : undefined;
    if (resolvedBindings && lookup) {
      const out = {} as AsSchema<T>;
      for (const [key, _value] of Object.entries(resolvedBindings)) {
        const value = _value as string;
        const [schema] = lookup.getSchemaForPath(value);
        out[key] = schema || null;
      }

      return out;
    }

    return undefined;
  }, [bindings, lookup]);
}
