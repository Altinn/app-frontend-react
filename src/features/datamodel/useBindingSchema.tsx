import { useMemo } from 'react';

import type { JSONSchema7 } from 'json-schema';

import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import {
  getCurrentDataTypeForApplication,
  getCurrentTaskDataElementId,
} from 'src/features/applicationMetadata/appMetadataUtils';
import { useDataModelSchema } from 'src/features/datamodel/DataModelSchemaProvider';
import { dotNotationToPointer } from 'src/features/datamodel/notations';
import { lookupBindingInSchema } from 'src/features/datamodel/SimpleSchemaTraversal';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { getRootElementPath } from 'src/utils/schemaUtils';
import type { IDataModelBindings } from 'src/layout/layout';

type AsSchema<T> = {
  [P in keyof T]: JSONSchema7 | null;
};

export function useCurrentDataModelGuid() {
  const instance = useLaxInstanceData();
  const process = useLaxProcessData();
  const application = useApplicationMetadata();
  const layoutSets = useLayoutSets();

  return getCurrentTaskDataElementId({ application, instance, process, layoutSets });
}

export function useCurrentDataModelName() {
  const process = useLaxProcessData();
  const application = useApplicationMetadata();
  const layoutSets = useLayoutSets();
  return getCurrentDataTypeForApplication({
    application,
    process,
    layoutSets,
  });
}

export function useCurrentDataModelType() {
  const name = useCurrentDataModelName();

  return useAppSelector(
    (state) => state.applicationMetadata.applicationMetadata?.dataTypes.find((dt) => dt.id === name),
  );
}

export function useBindingSchema<T extends IDataModelBindings | undefined>(bindings: T): AsSchema<T> | undefined {
  const currentSchema = useDataModelSchema();
  const dataType = useCurrentDataModelType();

  return useMemo(() => {
    const resolvedBindings = bindings && Object.values(bindings).length ? { ...bindings } : undefined;
    if (resolvedBindings && currentSchema) {
      const rootElementPath = getRootElementPath(currentSchema, dataType);
      const out = {} as AsSchema<T>;
      for (const [key, _value] of Object.entries(resolvedBindings)) {
        const value = _value as string;
        const bindingPointer = dotNotationToPointer(value);

        const [schema] = lookupBindingInSchema({
          schema: currentSchema,
          rootElementPath,
          targetPointer: bindingPointer,
        });

        out[key] = schema || null;
      }

      return out;
    }

    return undefined;
  }, [currentSchema, bindings, dataType]);
}
