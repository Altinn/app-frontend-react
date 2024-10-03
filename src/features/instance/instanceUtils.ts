import deepEqual from 'fast-deep-equal';

import type { IData, IInstance } from 'src/types/shared';

export function cleanUpInstanceData<T extends IInstance | undefined>(instance: T): T {
  if (!instance) {
    return undefined as T;
  }

  if (instance && 'process' in instance) {
    // Even though the process state is part of the instance data we fetch from the server, we don't want to expose it
    // to the rest of the application. This is because the process state is also fetched separately, and that
    // is the one we want to use, as it contains more information about permissions than the instance data provides.
    delete instance.process;
  }

  return instance;
}

// Fields that are not relevant for instanceHasRelevantChanges
const IRRELEVANT_INSTANCE_FIELDS: Set<keyof IInstance> = new Set([
  'appId',
  'org',
  'selfLinks',
  'dueBefore',
  'visibleAfter',
  'created',
  'createdBy',
  'lastChanged',
  'lastChangedBy',
  'process',
]);

// Fields that are not relevant in instance.data for instanceHasRelevantChanges
const IRRELEVANT_DATA_FIELDS: Set<keyof IData> = new Set([
  'blobStoragePath',
  'contentHash',
  'contentType',
  'created',
  'createdBy',
  'lastChanged',
  'lastChangedBy',
  'dataType',
  'filename',
  'instanceGuid',
  'selfLinks',
  'size',
  'refs',
]);

export function instanceHasRelevantChanges(a: IInstance | undefined, b: IInstance | undefined): boolean {
  // Base cases
  if (typeof a === 'undefined' && typeof b === 'undefined') {
    return false;
  }
  if (
    (typeof a === 'undefined' && typeof b !== 'undefined') ||
    (typeof a !== 'undefined' && typeof b === 'undefined')
  ) {
    return true;
  }

  // Fields like lastChanged changes constantly, but we don't need to update our instance data if only such irrelevant fields have changed
  const aRelevant = filterRelevantFields(a!);
  const bRelevant = filterRelevantFields(b!);

  return !deepEqual(aRelevant, bRelevant);
}

type FilteredInstance = Partial<Omit<IInstance, 'data'>> & { data?: Partial<IData>[] };

function filterRelevantFields(instance: IInstance): FilteredInstance {
  const out: FilteredInstance = {};

  for (const [instanceKey, instanceValue] of Object.entries(instance)) {
    if (IRRELEVANT_INSTANCE_FIELDS.has(instanceKey as keyof IInstance)) {
      continue;
    }

    if (instanceKey === 'data') {
      out['data'] = instance['data'].map((data) => {
        const outData: Partial<IData> = {};

        for (const [dataKey, dataValue] of Object.entries(data)) {
          if (IRRELEVANT_DATA_FIELDS.has(dataKey as keyof IData)) {
            continue;
          }

          outData[dataKey] = dataValue;
        }

        return outData;
      });

      continue;
    }

    out[instanceKey] = instanceValue;
  }

  return out;
}
