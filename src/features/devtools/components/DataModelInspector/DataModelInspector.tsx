/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@digdir/designsystemet-react';
import { Close } from '@navikt/ds-icons';
import cn from 'classnames';
import dot from 'dot-object';
import diff from 'fast-diff';

import { useLaxCurrentDataModelSchemaLookup } from 'src/features/datamodel/DataModelSchemaProvider';
import classes from 'src/features/devtools/components/DataModelInspector/DataModelInspector.module.css';
import reusedClasses from 'src/features/devtools/components/LayoutInspector/LayoutInspector.module.css';
import { SplitView } from 'src/features/devtools/components/SplitView/SplitView';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { FD } from 'src/features/formData/FormDataWrite';
import { useNodes } from 'src/utils/layout/NodesContext';

export function DataModelInspector() {
  const { selectedPath, selectedDataModelBinding } = useDevToolsStore((state) => state.dataModelInspector);
  const setSelected = useDevToolsStore((state) => state.actions.dataModelInspectorSet);
  const focusNodeInspector = useDevToolsStore((state) => state.actions.focusNodeInspector);

  const nodes = useNodes();
  const lookup = useLaxCurrentDataModelSchemaLookup();

  const currentData = FD.useCurrent();
  const debouncedData = FD.useDebounced();
  const lastSavedData = FD.useLastSaved();
  const combinedData = useMemo(
    () => combineModels(currentData, debouncedData, lastSavedData),
    [currentData, debouncedData, lastSavedData],
  );

  useEffect(() => {
    if (selectedDataModelBinding) {
      const id = getIdFromDataModelBinding(combinedData, selectedDataModelBinding);
      setSelected(id ?? undefined);

      if (!id) {
        toast(
          <span>
            Fant ikke{' '}
            <code style={{ backgroundColor: '#333', color: 'white', fontSize: '0.8rem', padding: '0 4px' }}>
              {selectedDataModelBinding}
            </code>{' '}
            i datamodellen
          </span>,
          {
            toastId: 'dataModelBindingNotFound',
            type: 'default',
            autoClose: 3000,
            position: 'bottom-center',
          },
        );
      }
    }
  }, [combinedData, selectedDataModelBinding, setSelected]);

  const selectedBinding = getDataModelBindingFromId(combinedData, selectedPath);
  const selectedSchema = selectedBinding && lookup?.getSchemaForPath(selectedBinding);
  const selectedCurrentData = selectedBinding && dot.pick(selectedBinding, currentData);
  const selectedLastSavedData = selectedBinding && dot.pick(selectedBinding, lastSavedData);

  const matchingNodes = nodes
    .allNodes()
    .filter(
      (n) =>
        n.item.dataModelBindings &&
        Object.values(n.item.dataModelBindings).some((binding) => selectedBinding === binding),
    );

  const NodeLink = ({ nodeId }: { nodeId: string }) => (
    <div>
      <a
        href='#'
        onClick={(e) => {
          e.preventDefault();
          focusNodeInspector(nodeId);
        }}
      >
        Utforsk {nodeId} i komponenter-fanen
      </a>
    </div>
  );

  return (
    <SplitView
      direction='row'
      sizes={[400]}
    >
      <div className={classes.container}>
        <dl>
          {Object.entries(combinedData).map(([k, v]) => (
            <DataField
              key={k}
              property={k}
              value={v}
              path={k}
              id={k}
            />
          ))}
        </dl>
      </div>
      {selectedPath && selectedBinding && (
        <div className={reusedClasses.properties}>
          <div className={reusedClasses.header}>
            <h3 style={{ wordBreak: 'break-all' }}>{selectedBinding}</h3>
            <div className={reusedClasses.headerLink}>
              {matchingNodes.length === 0 && 'Ingen tilknyttede komponenter funnet'}
              {matchingNodes.map((node) => (
                <NodeLink
                  key={node.item.id}
                  nodeId={node.item.id}
                />
              ))}
            </div>
            <Button
              onClick={() => setSelected(undefined)}
              variant='tertiary'
              color='second'
              size='small'
              aria-label={'close'}
              icon={true}
            >
              <Close
                fontSize='1rem'
                aria-hidden
              />
            </Button>
          </div>
          {selectedSchema?.[0] && (
            <>
              <h4>Datamodell</h4>
              <div className={classes.json}>{JSON.stringify(selectedSchema[0], null, 2)}</div>
            </>
          )}
          <h4>Verdi</h4>
          <div className={classes.json}>{JSON.stringify(selectedCurrentData, null, 2)}</div>
          <h4>Lagret verdi</h4>
          <div className={classes.json}>{JSON.stringify(selectedLastSavedData, null, 2)}</div>
        </div>
      )}
    </SplitView>
  );
}

type DataFieldProps = {
  property: string;
  value: any;
  path: string;
  id: string;
};
function DataField({ property, value, path, id }: DataFieldProps) {
  if (isValueEmpty(value)) {
    value = null;
  }

  if (isLeafValue(value)) {
    return (
      <LeafValue
        property={property}
        value={value}
        path={path}
        id={id}
      />
    );
  }

  if (isLeafObject(value)) {
    return (
      <LeafObject
        property={property}
        value={value}
        path={path}
        id={id}
      />
    );
  }

  if (isUniqueListValueObject(value)) {
    return (
      <UniqueListValue
        property={property}
        value={value}
        path={path}
        id={id}
      />
    );
  }

  if (isRepeatingGroupObject(value)) {
    return (
      <RepeatingGroupValue
        property={property}
        value={value}
        path={path}
        id={id}
      />
    );
  }

  if (typeof value === 'object' && Array.isArray(value)) {
    return (
      <ArrayValue
        property={property}
        value={value}
        path={path}
        id={id}
      />
    );
  }

  if (typeof value === 'object') {
    return (
      <ObjectValue
        property={property}
        value={value}
        path={path}
        id={id}
      />
    );
  }

  return null;
}

type LeafObjectProps = {
  property: string;
  value: LeafValueTriplet;
  path: string;
  id: string;
};
function LeafObject({ property, value, path, id }: LeafObjectProps) {
  const schemaType = useBindingSchemaType(path);
  const selectedPath = useDevToolsStore((state) => state.dataModelInspector.selectedPath);
  const setSelected = useDevToolsStore((state) => state.actions.dataModelInspectorSet);
  const el = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selectedPath === id && el.current) {
      el.current.scrollIntoView({ block: 'nearest' });
    }
  }, [id, selectedPath]);

  // Maybe we should make it an option to hide row ids?
  if (property === 'altinnRowId') {
    return null;
  }

  const stable = value.current === value.debounced && value.debounced === value.lastSaved;
  const writing = value.current !== value.debounced;
  const saving = value.current === value.debounced && value.debounced !== value.lastSaved;

  const currentStringy = value.current != null ? String(value.current) : '';
  const debouncedStringy = value.debounced != null ? String(value.debounced) : '';
  const lastSavedStringy = value.lastSaved != null ? String(value.lastSaved) : '';

  const currentValue = String(value.current ?? null);

  return (
    <>
      <dt
        ref={el}
        title={path}
        onClick={() => setSelected(id)}
        className={cn({ [classes.active]: isSubPath(selectedPath, id) })}
      >
        <span className={cn({ [classes.colon]: !schemaType })}>{property}</span>
        {schemaType && <span className={classes.type}>{schemaType}</span>}
      </dt>
      {stable && (
        <dd>
          <pre className={cn({ [classes.showAsString]: typeof value.current === 'string' })}>{currentValue}</pre>
        </dd>
      )}
      {writing && (
        <dd>
          <pre
            className={cn({
              [classes.showAsString]: typeof value.current === 'string' || typeof value.debounced === 'string',
            })}
          >
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
          <pre
            className={cn({
              [classes.showAsString]: typeof value.lastSaved === 'string' || typeof value.debounced === 'string',
            })}
          >
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
  path: string;
  id: string;
};
function LeafValue({ property, value, path, id }: LeafValueProps) {
  const schemaType = useBindingSchemaType(path);
  const selectedPath = useDevToolsStore((state) => state.dataModelInspector.selectedPath);
  const setSelected = useDevToolsStore((state) => state.actions.dataModelInspectorSet);
  const el = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selectedPath === id && el.current) {
      el.current.scrollIntoView({ block: 'nearest' });
    }
  }, [id, selectedPath]);

  // Maybe we should make it an option to hide row ids?
  if (property === 'altinnRowId') {
    return null;
  }

  return (
    <>
      <dt
        ref={el}
        title={path}
        onClick={() => setSelected(id)}
        className={cn({ [classes.active]: isSubPath(selectedPath, id) })}
      >
        <span className={cn({ [classes.colon]: !schemaType })}>{property}</span>
        {schemaType && <span className={classes.type}>{schemaType}</span>}
      </dt>
      <dd>{String(value)}</dd>
    </>
  );
}

type RepeatingGroupValueProps = {
  property: string;
  value: RepeatingGroupObject;
  path: string;
  id: string;
};
function RepeatingGroupValue({ property, value, path, id }: RepeatingGroupValueProps) {
  const repeatingGroupArray: unknown[] = [];
  const rowIds: (string | null)[] = [];
  for (const v of Object.values(value)) {
    const { altinnRowIndex, ...row } = v;
    const index = altinnRowIndex.lastSaved ?? altinnRowIndex.debounced ?? altinnRowIndex.current;
    if (typeof index === 'number') {
      repeatingGroupArray[index] = row;
      rowIds[index] = row.altinnRowId.lastSaved ?? row.altinnRowId.debounced ?? row.altinnRowId.current ?? null;
    }
  }

  return (
    <ArrayValue
      property={property}
      value={repeatingGroupArray}
      path={path}
      id={id}
      rowIds={rowIds}
    />
  );
}

type UniqueListValueProps = {
  property: string;
  value: UniqueListValueObject;
  path: string;
  id: string;
};
function UniqueListValue({ property, value, path, id }: UniqueListValueProps) {
  const uniqueListValue: unknown[] = [];
  const rowIds: (string | null)[] = [];
  for (const v of Object.values(value)) {
    const { value, index } = v;
    const i = index.lastSaved ?? index.debounced ?? index.current;
    if (typeof i === 'number') {
      uniqueListValue[i] = value;
      const rowId = value.lastSaved ?? value.debounced ?? value.current ?? null;
      rowIds[i] = rowId ? String(rowId) : null;
    }
  }

  return (
    <ArrayValue
      property={property}
      value={uniqueListValue}
      path={path}
      id={id}
      rowIds={rowIds}
    />
  );
}

type ObjectValueProps = {
  property: string;
  value: Record<string, unknown>;
  path: string;
  id: string;
};
function ObjectValue({ property, value, path, id }: ObjectValueProps) {
  const schemaType = useBindingSchemaType(path);
  const selectedPath = useDevToolsStore((state) => state.dataModelInspector.selectedPath);
  const setSelected = useDevToolsStore((state) => state.actions.dataModelInspectorSet);
  const el = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selectedPath === id && el.current) {
      el.current.scrollIntoView({ block: 'nearest' });
    }
  }, [id, selectedPath]);

  return (
    <>
      <dt
        ref={el}
        title={path}
        onClick={() => setSelected(id)}
        className={cn({ [classes.active]: isSubPath(selectedPath, id) })}
      >
        <span className={cn({ [classes.colon]: !schemaType })}>{property}</span>
        {schemaType && <span className={classes.type}>{schemaType}</span>}
      </dt>
      <dd>
        <dl>
          {Object.entries(value).map(([k, v]) => (
            <DataField
              key={k}
              property={k}
              value={v}
              path={`${path}.${k}`}
              id={`${id}.${k}`}
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
  path: string;
  id: string;
  rowIds?: (string | null)[];
};
function ArrayValue({ property, value, path, id, rowIds }: ArrayValueProps) {
  const schemaType = useBindingSchemaType(path);
  const selectedPath = useDevToolsStore((state) => state.dataModelInspector.selectedPath);
  const setSelected = useDevToolsStore((state) => state.actions.dataModelInspectorSet);
  const el = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selectedPath === id && el.current) {
      el.current.scrollIntoView({ block: 'nearest' });
    }
  }, [id, selectedPath]);

  return (
    <>
      <dt
        ref={el}
        title={path}
        onClick={() => setSelected(id)}
        className={cn({ [classes.active]: isSubPath(selectedPath, id) })}
      >
        <span className={cn({ [classes.colon]: !schemaType })}>{property}</span>
        {schemaType && <span className={classes.type}>{schemaType}</span>}
      </dt>
      <dd>
        <dl>
          {value.map((v, i) => (
            <DataField
              key={rowIds?.[i] ?? i}
              property={`[${i}]`}
              value={v}
              path={`${path}[${i}]`}
              id={rowIds?.[i] ? `${id}.${rowIds[i]}` : `${id}[${i}]`}
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
  let data = parent[key];

  // If leaf value, stop recursion
  if (isLeafValue(parent[key])) {
    return;
  }

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

function parseKeyPart(keyPart: string): [string | null, string | null] {
  if (!keyPart.endsWith(']')) {
    return [keyPart, null];
  }

  const match = /^([^\s]+)\[(\d+)\]$/.exec(keyPart);
  if (match) {
    return [match[1], match[2]];
  }

  return [null, null];
}

function isSubPath(selectedPath: string | undefined, target: string) {
  if (!selectedPath) {
    return false;
  }

  const selectedKeyParts = selectedPath.split('.');
  const targetKeyParts = target.split('.');
  return targetKeyParts.every((part, index) => part === selectedKeyParts.at(index));
}

function useBindingSchemaType(path: string): string | null {
  const lookup = useLaxCurrentDataModelSchemaLookup();
  const type = lookup?.getSchemaForPath(path)?.[0]?.type;
  return type ? String(type) : null;
}

function getIdFromDataModelBinding(model: unknown, dataModelBinding: string | undefined): string | null {
  if (!dataModelBinding) {
    return null;
  }

  const keyParts = dataModelBinding.split('.');
  let id = '';
  let currentModel = model;

  for (const keyPart of keyParts) {
    const [key, index] = parseKeyPart(keyPart);

    if (!currentModel || !key) {
      return null;
    }

    currentModel = currentModel[key];

    // If repeating group use the index instead
    if (isRepeatingGroupObject(currentModel) && index != null) {
      const rowId = Object.entries(currentModel).reduce((result, [rowId, row]) => {
        const rowIndexTriplet = row.altinnRowIndex;
        const rowIndex = rowIndexTriplet.lastSaved ?? rowIndexTriplet.debounced ?? rowIndexTriplet.current;
        if (index === String(rowIndex)) {
          return rowId;
        }
        return result;
      }, null);

      if (!rowId) {
        return null;
      }

      id += `.${key}.${rowId}`;
      currentModel = currentModel[rowId];
      continue;
    }

    // If unique list use index instead
    if (isUniqueListValueObject(currentModel) && index != null) {
      const rowId = Object.entries(currentModel).reduce((result, [rowId, row]) => {
        const rowIndexTriplet = row.index;
        const rowIndex = rowIndexTriplet.lastSaved ?? rowIndexTriplet.debounced ?? rowIndexTriplet.current;
        if (index === String(rowIndex)) {
          return rowId;
        }
        return result;
      }, null);

      if (!rowId) {
        return null;
      }

      id += `.${key}.${rowId}`;
      currentModel = currentModel[rowId];
      continue;
    }

    // Default
    id += `.${keyPart}`;
    if (currentModel && index != null) {
      currentModel = currentModel[Number(index)];
    }
  }

  return id.slice(1);
}

function getDataModelBindingFromId(model: unknown, id: string | undefined): string | null {
  if (!id) {
    return null;
  }

  const keyParts = id.split('.');
  let binding = '';
  let currentModel = model;

  for (const keyPart of keyParts) {
    const [key, index] = parseKeyPart(keyPart);

    if (!currentModel || !key) {
      return null;
    }

    // If repeating group use the index instead
    if (isRepeatingGroupObject(currentModel)) {
      const row = currentModel[keyPart];
      const rowIndexTriplet = row?.altinnRowIndex;
      const rowIndex = rowIndexTriplet.lastSaved ?? rowIndexTriplet.debounced ?? rowIndexTriplet.current;
      if (rowIndex == null) {
        return null;
      }

      binding += `[${rowIndex}]`;
      currentModel = row;
      continue;
    }

    // If unique list use index instead
    if (isUniqueListValueObject(currentModel)) {
      const row = currentModel[keyPart];
      const rowIndexTriplet = row?.index;
      const rowIndex = rowIndexTriplet.lastSaved ?? rowIndexTriplet.debounced ?? rowIndexTriplet.current;
      if (rowIndex == null) {
        return null;
      }

      binding += `[${rowIndex}]`;
      currentModel = row;
      continue;
    }

    // Default
    binding += `.${keyPart}`;
    currentModel = currentModel[key];
    if (currentModel && index != null) {
      currentModel = currentModel[Number(index)];
    }
  }

  return binding.slice(1);
}
