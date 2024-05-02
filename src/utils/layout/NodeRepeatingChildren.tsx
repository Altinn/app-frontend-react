import React, { useMemo } from 'react';

import dot from 'dot-object';

import { FD } from 'src/features/formData/FormDataWrite';
import { NodeChildren } from 'src/utils/layout/NodesGenerator';
import { NodeGeneratorInternal, NodesGeneratorRowProvider } from 'src/utils/layout/NodesGeneratorContext';
import type { BaseRow } from 'src/utils/layout/itemState';
import type { ChildMutator } from 'src/utils/layout/NodesGeneratorContext';

interface Props {
  childIds: string[];
  internalProp: string;
  externalProp: string;
  binding: string;
  multiPageSupport: false | string;
}

export function NodeRepeatingChildren({ childIds, binding, multiPageSupport, externalProp }: Props) {
  const item = NodeGeneratorInternal.useExternalItem();
  const rows = FD.useFreshRows(item?.dataModelBindings?.[binding]);
  const multiPage = multiPageSupport !== false && dot.pick(multiPageSupport, item) === true;
  const multiPageMapping = multiPage ? makeMultiPageMapping(dot.pick(externalProp, item)) : undefined;
  const groupBinding = dot.pick(`dataModelBindings.${binding}`, item);

  return (
    <>
      {rows.map((row) => (
        <GenerateRow
          key={row.uuid}
          row={row}
          groupBinding={groupBinding}
          childIds={childIds}
          multiPageMapping={multiPageMapping}
        />
      ))}
    </>
  );
}

interface GenerateRowProps {
  row: BaseRow;
  childIds: string[];
  groupBinding: string | undefined;
  multiPageMapping: MultiPageMapping | undefined;
}

function GenerateRow({ row, childIds, groupBinding, multiPageMapping }: GenerateRowProps) {
  const depth = NodeGeneratorInternal.useDepth();
  const directMutators = useMemo(
    () => [mutateComponentId(row), mutateMultiPageIndex(multiPageMapping)],
    [multiPageMapping, row],
  );

  const recursiveMutators = useMemo(
    () => [mutateDataModelBindings(row, groupBinding), mutateMapping(row, depth)],
    [row, depth, groupBinding],
  );

  return (
    <NodesGeneratorRowProvider
      row={row}
      directMutators={directMutators}
      recursiveMutators={recursiveMutators}
    >
      <NodeChildren childIds={childIds} />
    </NodesGeneratorRowProvider>
  );
}

interface MultiPageMapping {
  [childId: string]: number;
}

function makeMultiPageMapping(children: string[] | undefined): MultiPageMapping {
  const mapping: MultiPageMapping = {};
  for (const child of children ?? []) {
    const [childId, pageIndex] = child.split(':', 2);
    mapping[childId] = parseInt(pageIndex, 10);
  }
  return mapping;
}

function mutateMultiPageIndex(multiPageMapping: MultiPageMapping | undefined): ChildMutator {
  return (item) => {
    if (!multiPageMapping) {
      return;
    }

    const id = (item as any).baseComponentId ?? item.id;
    const multiPageIndex = multiPageMapping[id];
    if (multiPageIndex !== undefined) {
      item['multiPageIndex'] = multiPageIndex;
    }
  };
}

function mutateComponentId(row: BaseRow): ChildMutator {
  return (item) => {
    (item as any).baseComponentId = (item as any).baseComponentId || item.id;
    item.id += `-${row.index}`;
  };
}

function mutateDataModelBindings(row: BaseRow, groupBinding: string | undefined): ChildMutator {
  return (item) => {
    const bindings = item.dataModelBindings || {};
    for (const key of Object.keys(bindings)) {
      if (groupBinding && bindings[key]) {
        bindings[key] = bindings[key].replace(groupBinding, `${groupBinding}[${row.index}]`);
      }
    }
  };
}

function mutateMapping(row: BaseRow, depth: number): ChildMutator {
  return (item) => {
    if ('mapping' in item && item.mapping) {
      const depthMarker = depth - 1;
      for (const key of Object.keys(item.mapping)) {
        const value = item.mapping[key];
        const newKey = key.replace(`[{${depthMarker}}]`, `[${row.index}]`);
        delete item.mapping[key];
        item.mapping[newKey] = value;
      }
    }
  };
}
