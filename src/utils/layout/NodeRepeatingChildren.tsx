import React, { useMemo } from 'react';

import dot from 'dot-object';

import { ContextNotProvided } from 'src/core/contexts/context';
import { FD } from 'src/features/formData/FormDataWrite';
import { useDef, useExpressionResolverProps } from 'src/utils/layout/NodeGenerator';
import { NodesInternal, useNodeLax } from 'src/utils/layout/NodesContext';
import { NodeChildren } from 'src/utils/layout/NodesGenerator';
import { NodeGeneratorInternal, NodesGeneratorRowProvider } from 'src/utils/layout/NodesGeneratorContext';
import { NodeStages } from 'src/utils/layout/NodeStages';
import { useNodeDirectChildren } from 'src/utils/layout/useNodeItem';
import type { CompDef } from 'src/layout';
import type { CompExternal } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ChildMutator } from 'src/utils/layout/NodesGeneratorContext';
import type { BaseRow } from 'src/utils/layout/types';

interface Props {
  childIds: string[];
  internalProp: string;
  externalProp: string;
  binding: string;
  multiPageSupport: false | string;
}

export function NodeRepeatingChildren({ childIds, binding, multiPageSupport, externalProp, internalProp }: Props) {
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
          internalProp={internalProp}
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
  internalProp: string;
}

function GenerateRow({ row, childIds, groupBinding, multiPageMapping, internalProp }: GenerateRowProps) {
  const node = NodeGeneratorInternal.useParent() as LayoutNode;
  const removeRow = NodesInternal.useRemoveRow();
  const depth = NodeGeneratorInternal.useDepth();
  const directMutators = useMemo(
    () => [mutateComponentId(row), mutateMultiPageIndex(multiPageMapping)],
    [multiPageMapping, row],
  );

  const recursiveMutators = useMemo(
    () => [mutateDataModelBindings(row, groupBinding), mutateMapping(row, depth)],
    [row, depth, groupBinding],
  );

  NodeStages.AddNodes.useEffect(
    () => () => {
      removeRow(node, row, internalProp);
    },
    [node, row, internalProp, removeRow],
  );

  return (
    <NodesGeneratorRowProvider
      row={row}
      directMutators={directMutators}
      recursiveMutators={recursiveMutators}
    >
      <ResolveRowExpressions internalProp={internalProp} />
      <NodeChildren childIds={childIds} />
    </NodesGeneratorRowProvider>
  );
}

interface ResolveRowProps {
  internalProp: string;
}

function ResolveRowExpressions({ internalProp }: ResolveRowProps) {
  const parent = NodeGeneratorInternal.useParent() as LayoutNode;
  const row = NodeGeneratorInternal.useRow() as BaseRow;
  const nodeChildren = useNodeDirectChildren(parent as LayoutNode, { onlyInRowUuid: row!.uuid });
  const firstChildRaw = useNodeLax(nodeChildren?.[0]);
  const firstChild = firstChildRaw === ContextNotProvided ? undefined : firstChildRaw;

  const item = NodeGeneratorInternal.useExternalItem();
  const props = useExpressionResolverProps(firstChild, item as CompExternal, row);
  const allNodesAdded = NodeStages.AddNodes.useIsDone();

  const setExtra = NodesInternal.useSetRowExtras();
  const def = useDef(item!.type);
  const resolvedRowExtras = useMemo(
    () => (allNodesAdded ? (def as CompDef).evalExpressionsForRow(props as any) : undefined),
    [def, props, allNodesAdded],
  );

  NodeStages.EvaluateExpressions.useEffect(() => {
    if (resolvedRowExtras) {
      setExtra(parent, row, internalProp, resolvedRowExtras);
    }
  }, [resolvedRowExtras, setExtra, parent, row, internalProp]);

  return null;
}

interface MultiPageMapping {
  [childId: string]: number;
}

function makeMultiPageMapping(children: string[] | undefined): MultiPageMapping {
  const mapping: MultiPageMapping = {};
  for (const child of children ?? []) {
    const [pageIndex, childId] = child.split(':', 2);
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
