import { useMemo } from 'react';

import type { JSONSchema7 } from 'json-schema';

import { useTaskStore } from 'src/core/contexts/taskStoreContext';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import {
  getCurrentDataTypeForApplication,
  getCurrentTaskDataElementId,
} from 'src/features/applicationMetadata/appMetadataUtils';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useInstanceDataQuery } from 'src/features/instance/InstanceContext';
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { IDataModelBindings } from 'src/layout/layout';

export type AsSchema<T> = {
  [P in keyof T]: JSONSchema7 | null;
};

export function useCurrentDataModelDataElementId() {
  const application = useApplicationMetadata();
  const layoutSets = useLayoutSets();
  const taskId = useProcessTaskId();

  const overriddenDataElementId = useTaskStore((s) => s.overriddenDataElementId);

  // Instance data elements will update often (after each save), so we have to use a selector to make
  // sure components don't re-render too often.
  return useInstanceDataQuery({
    select: (data) => {
      if (overriddenDataElementId) {
        return overriddenDataElementId;
      }

      return getCurrentTaskDataElementId({ application, dataElements: data.data, taskId, layoutSets });
    },
  }).data;
}

export function useCurrentDataModelName() {
  const overriddenDataModelType = useTaskStore((state) => state.overriddenDataModelType);

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
