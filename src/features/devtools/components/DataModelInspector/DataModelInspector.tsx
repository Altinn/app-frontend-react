import React from 'react';

import dot from 'dot-object';
import diff from 'fast-diff';

import classes from 'src/features/devtools/components/DataModelInspector/DataModelInspector.module.css';
import { FD } from 'src/features/formData/FormDataWrite';

export function DataModelInspector() {
  const currentData = FD.useCurrent();
  const debouncedData = FD.useDebounced();
  const lastSavedData = FD.useLastSaved();

  const combinedData = combineModels(currentData, debouncedData, lastSavedData);

  return (
    <div className={classes.container}>
      <dl>
        {Object.entries(combinedData).map(([k, v]) => (
          <DataField
            key={k}
            property={k}
            value={v}
          />
        ))}
      </dl>
    </div>
  );
}

type DataFieldProps = {
  property: string;
  value: any;
};
function DataField({ property, value }: DataFieldProps) {
  if (isValueEmpty(value)) {
    value = null;
  }

  if (isLeafValue(value)) {
    return (
      <LeafValue
        property={property}
        value={value}
      />
    );
  }

  if (isLeafObject(value)) {
    return (
      <LeafObject
        property={property}
        value={value}
      />
    );
  }

  if (isUniqueListValueObject(value)) {
    return (
      <UniqueListValue
        property={property}
        value={value}
      />
    );
  }

  if (isRepeatingGroupObject(value)) {
    return (
      <RepeatingGroupValue
        property={property}
        value={value}
      />
    );
  }

  if (typeof value === 'object' && Array.isArray(value)) {
    return (
      <ArrayValue
        property={property}
        value={value}
      />
    );
  }

  if (typeof value === 'object') {
    return (
      <ObjectValue
        property={property}
        value={value}
      />
    );
  }

  return null;
}

type LeafObjectProps = {
  property: string;
  value: LeafValueTriplet;
};
function LeafObject({ property, value }: LeafObjectProps) {
  const stable = value.current === value.debounced && value.debounced === value.lastSaved;
  const writing = value.current !== value.debounced;
  const saving = value.current === value.debounced && value.debounced !== value.lastSaved;

  const currentStringy = value.current != null ? String(value.current) : '';
  const debouncedStringy = value.debounced != null ? String(value.debounced) : '';
  const lastSavedStringy = value.lastSaved != null ? String(value.lastSaved) : '';

  const currentValue = String(value.current ?? null);

  return (
    <>
      <dt>{property}</dt>
      {stable && (
        <dd>
          <pre>{currentValue}</pre>
        </dd>
      )}
      {writing && (
        <dd>
          <pre>
            {diff(debouncedStringy, currentStringy).map(([edit, text]) => (
              <span
                key={`${edit}-${text}`}
                style={{
                  ...(edit === diff.INSERT && { color: 'green' }),
                  ...(edit === diff.DELETE && { color: 'red', textDecorationLine: 'line-through' }),
                }}
              >
                {text}
              </span>
            ))}
          </pre>
        </dd>
      )}
      {saving && (
        <dd>
          <pre>
            {diff(lastSavedStringy, debouncedStringy).map(([edit, text]) => (
              <span
                key={`${edit}-${text}`}
                style={{
                  ...(edit === diff.INSERT && { color: 'orange' }),
                  ...(edit === diff.DELETE && { color: 'red', opacity: 0.3, textDecorationLine: 'line-through' }),
                }}
              >
                {text}
              </span>
            ))}
          </pre>
        </dd>
      )}
    </>
  );
}

type LeafValueProps = {
  property: string;
  value: string | number | boolean | null;
};
function LeafValue({ property, value }: LeafValueProps) {
  return (
    <>
      <dt>{property}</dt>
      <dd>{String(value)}</dd>
    </>
  );
}

type RepeatingGroupValueProps = {
  property: string;
  value: RepeatingGroupObject;
};
function RepeatingGroupValue({ property, value }: RepeatingGroupValueProps) {
  const repeatingGroupArray: unknown[] = [];
  for (const v of Object.values(value)) {
    const { altinnRowIndex, altinnRowId: _, ...row } = v;
    const index = altinnRowIndex.lastSaved ?? altinnRowIndex.debounced ?? altinnRowIndex.current;
    if (typeof index === 'number') {
      repeatingGroupArray[index] = row;
    }
  }

  return (
    <ArrayValue
      property={property}
      value={repeatingGroupArray}
    />
  );
}

type UniqueListValueProps = {
  property: string;
  value: UniqueListValueObject;
};
function UniqueListValue({ property, value }: UniqueListValueProps) {
  const uniqueListValue: unknown[] = [];
  for (const v of Object.values(value)) {
    const { value, index } = v;
    const i = index.lastSaved ?? index.debounced ?? index.current;
    if (typeof i === 'number') {
      uniqueListValue[i] = value;
    }
  }

  return (
    <ArrayValue
      property={property}
      value={uniqueListValue}
    />
  );
}

type ObjectValueProps = {
  property: string;
  value: Record<string, unknown>;
};
function ObjectValue({ property, value }: ObjectValueProps) {
  return (
    <>
      <dt>{property}</dt>
      <dd>
        <dl>
          {Object.entries(value).map(([k, v]) => (
            <DataField
              key={k}
              property={k}
              value={v}
            />
          ))}
        </dl>
      </dd>
    </>
  );
}

type ArrayValueProps = {
  property: string;
  value: unknown[];
};
function ArrayValue({ property, value }: ArrayValueProps) {
  return (
    <>
      <dt>{property}</dt>
      <dd>
        <dl>
          {value.map((v, i) => (
            <DataField
              key={v?.['altinnRowId'] ?? i}
              property={`[${i}]`}
              value={v}
            />
          ))}
        </dl>
      </dd>
    </>
  );
}

function combineModels(current: object, debounced: object, lastSaved: object) {
  const currentReplaced = replaceIndicesWithRowIds(current);
  const deboucedReplaced = replaceIndicesWithRowIds(debounced);
  const lastSavedReplaced = replaceIndicesWithRowIds(lastSaved);

  const currentFlat = dot.dot(currentReplaced);
  const debouncedFlat = dot.dot(deboucedReplaced);
  const lastSavedFlat = dot.dot(lastSavedReplaced);

  const currentExtended = appendDataModelKey(currentFlat, 'current');
  const debouncedExtended = appendDataModelKey(debouncedFlat, 'debounced');
  const lastSavedExtended = appendDataModelKey(lastSavedFlat, 'lastSaved');

  const combined = {};
  Object.assign(combined, currentExtended);
  Object.assign(combined, debouncedExtended);
  Object.assign(combined, lastSavedExtended);

  const ordered = Object.keys(combined)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .reduce((obj, key) => {
      obj[key] = combined[key];
      return obj;
    }, {});

  return dot.object(ordered);
}

function appendDataModelKey(
  flattenedDataModel: Record<string, LeafValueType>,
  dataModelKey: Exclude<keyof LeafValueTriplet, '__leafValue__'>,
) {
  const newModel = {};
  for (const [key, value] of Object.entries(flattenedDataModel)) {
    newModel[`${key}.__leafValue__`] = true;
    newModel[`${key}.${dataModelKey}`] = value;
  }
  return newModel;
}

function replaceIndicesWithRowIds(datamodel: object) {
  const replaced = structuredClone(datamodel);
  for (const key of Object.keys(replaced)) {
    replaceIndicesWithRowIdsRecursive(key, replaced);
  }

  return replaced;
}

function replaceIndicesWithRowIdsRecursive(key: string, parent: object) {
  if (isValueEmpty(parent[key])) {
    parent[key] = null;
  }

  // If leaf value, stop recursion
  if (isLeafValue(parent[key])) {
    return;
  }
  let data = parent[key];

  // If repeating group (all rows have altinnRowId), replace with object
  if (typeof data === 'object' && Array.isArray(data) && data.every((row) => row?.['altinnRowId'])) {
    parent[key] = data.reduce((obj, row, i) => {
      obj[row.altinnRowId] = row;
      obj[row.altinnRowId].altinnRowIndex = Number(i);
      return obj;
    }, {});
  }

  // Special case for unique array elements (attachment references, etc...)
  if (
    typeof data === 'object' &&
    Array.isArray(data) &&
    data.every((el) => isLeafValue(el)) &&
    new Set(data).size === data.length
  ) {
    parent[key] = data.reduce((obj, value, i) => {
      obj[value] = {
        __uniqueList__: true,
        value,
        index: i,
      };
      return obj;
    }, {});
  }

  data = parent[key];

  // Recurse children
  if (typeof data === 'object') {
    for (const childKey of Object.keys(data)) {
      replaceIndicesWithRowIdsRecursive(childKey, data);
    }
  }
}

type RepeatingGroupObject = Record<
  string,
  {
    altinnRowId: LeafValueTriplet<string>;
    altinnRowIndex: LeafValueTriplet<number>;
  }
>;

function isRepeatingGroupObject(value: unknown): value is RepeatingGroupObject {
  return (
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => isLeafObject(v?.altinnRowId) && isLeafObject(v?.altinnRowIndex))
  );
}

type UniqueListValueObject = Record<
  string,
  {
    __uniqueList__: true;
    value: LeafValueTriplet;
    index: LeafValueTriplet<number>;
  }
>;

function isUniqueListValueObject(value: unknown): value is UniqueListValueObject {
  return (
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => v.__uniqueList__)
  );
}

type LeafValueType = string | number | boolean | null;
type LeafValueTriplet<T = LeafValueType> = {
  __leafValue__: true;
  current?: T;
  debounced?: T;
  lastSaved?: T;
};

function isLeafObject(value: unknown): value is LeafValueTriplet {
  return (value as LeafValueTriplet)?.__leafValue__;
}

function isLeafValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value == null;
}

function isValueEmpty(value: unknown) {
  return value != null && typeof value === 'object' && !Object.keys(value).length;
}
