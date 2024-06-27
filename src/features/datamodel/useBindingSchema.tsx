import { useMemo } from 'react';

import type { JSONSchema7 } from 'json-schema';

import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import {
  getCurrentDataTypeForApplication,
  getCurrentTaskDataElementId,
  getFirstDataElementId,
  useDataTypeByLayoutSetId,
} from 'src/features/applicationMetadata/appMetadataUtils';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useCurrentLayoutSetId } from 'src/features/form/layoutSets/useCurrentLayoutSetId';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';
import { useAllowAnonymous } from 'src/features/stateless/getAllowAnonymous';
import { useTaskStore } from 'src/layout/Summary2/taskIdStore';
import {
  getAnonymousStatelessDataModelUrl,
  getDataModelUrl,
  getStatelessDataModelUrl,
} from 'src/utils/urls/appUrlHelper';
import { useIsStatelessApp } from 'src/utils/useIsStatelessApp';
import type { IDataModelReference } from 'src/layout/common.generated';
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

  if (isStateless && isAnonymous && dataType) {
    return getAnonymousStatelessDataModelUrl(dataType, includeRowIds);
  }

  if (isStateless && !isAnonymous && dataType) {
    return getStatelessDataModelUrl(dataType, includeRowIds);
  }

  if (instance?.id && dataElementUuid) {
    return getDataModelUrl(instance.id, dataElementUuid, includeRowIds);
  }

  return undefined;
}

// We assume that the first data element of the correct type is the one we should use, same as isDataTypeWritable
export function useDataModelUrl(includeRowIds: boolean, dataType: string | undefined) {
  const isAnonymous = useAllowAnonymous();
  const isStateless = useIsStatelessApp();
  const instance = useLaxInstanceData();

  if (isStateless && isAnonymous && dataType) {
    return getAnonymousStatelessDataModelUrl(dataType, includeRowIds);
  }

  if (isStateless && !isAnonymous && dataType) {
    return getStatelessDataModelUrl(dataType, includeRowIds);
  }

  if (instance?.id && dataType) {
    const uuid = getFirstDataElementId(instance, dataType);
    if (uuid) {
      return getDataModelUrl(instance.id, uuid, includeRowIds);
    }
  }

  return undefined;
}

export function useCurrentDataModelName() {
  const { overriddenDataModelType } = useTaskStore(({ overriddenDataModelType }) => ({ overriddenDataModelType }));

  const application = useApplicationMetadata();
  const layoutSets = useLayoutSets();
  const taskId = useProcessTaskId();

  if (overriddenDataModelType) {
    return overriddenDataModelType;
  }

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
  const lookupBinding = DataModels.useLookupBinding();

  return useMemo(() => {
    const resolvedBindings = bindings && Object.values(bindings).length ? { ...bindings } : undefined;
    if (lookupBinding && resolvedBindings) {
      const out = {} as AsSchema<T>;
      for (const [key, reference] of Object.entries(resolvedBindings as Record<string, IDataModelReference>)) {
        const [schema] = lookupBinding(reference);
        out[key] = schema || null;
      }

      return out;
    }

    return undefined;
  }, [bindings, lookupBinding]);
}
