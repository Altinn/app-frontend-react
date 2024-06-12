import React, { useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';

import dot from 'dot-object';

import { ContextNotProvided } from 'src/core/contexts/context';
import { FD } from 'src/features/formData/FormDataWrite';
import { GeneratorInternal, GeneratorRowProvider } from 'src/utils/layout/generator/GeneratorContext';
import {
  GeneratorCondition,
  GeneratorStages,
  NodesStateQueue,
  StageAddNodes,
  StageEvaluateExpressions,
} from 'src/utils/layout/generator/GeneratorStages';
import { GenerateNodeChildrenWhenReady } from 'src/utils/layout/generator/LayoutSetGenerator';
import { useDef, useExpressionResolverProps } from 'src/utils/layout/generator/NodeGenerator';
import { NodesInternal, useNodeLax } from 'src/utils/layout/NodesContext';
import { useNodeDirectChildren } from 'src/utils/layout/useNodeItem';
import type { CompDef } from 'src/layout';
import type { CompExternal } from 'src/layout/layout';
import type { ChildMutator } from 'src/utils/layout/generator/GeneratorContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { BaseRow } from 'src/utils/layout/types';

interface Props {
  childIds: string[];
  internalProp: string;
  externalProp: string;
  binding: string;
  multiPageSupport: false | string;
}

export function NodeRepeatingChildren(props: Props) {
  return (
    <GeneratorCondition
      stage={StageAddNodes}
      mustBeAdded='parent'
    >
      <PerformWork {...props} />
    </GeneratorCondition>
  );
}

function PerformWork({ childIds, binding, multiPageSupport, externalProp, internalProp }: Props) {
  const item = GeneratorInternal.useIntermediateItem();
  const groupBinding = item?.dataModelBindings?.[binding];
  const freshRows = FD.useFreshRows(groupBinding);
  const prevRows = useRef<BaseRow[]>(freshRows);
  const rows = useReusedRows(freshRows, prevRows);
  const multiPage = multiPageSupport !== false && dot.pick(multiPageSupport, item) === true;
  const multiPageMapping = useMemo(
    () => (multiPage ? makeMultiPageMapping(dot.pick(externalProp, item)) : undefined),
    [item, externalProp, multiPage],
  );

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

/**
 * Re-uses the existing row objects from previous runs whenever row uuids match.
 * This causes props to not change for the row components, which is important for performance.
 */
function useReusedRows(freshRows: BaseRow[], prevRows: MutableRefObject<BaseRow[]>): BaseRow[] {
  const out: BaseRow[] = [];
  const prevRowsMap = new Map(prevRows.current.map((r) => [r.uuid, r]));

  for (const row of freshRows) {
    const prevRow = prevRowsMap.get(row.uuid);
    if (prevRow) {
      out.push(prevRow);
    } else {
      out.push(row);
    }
  }

  prevRows.current = out;
  return out;
}

interface GenerateRowProps {
  row: BaseRow;
  childIds: string[];
  groupBinding: string | undefined;
  multiPageMapping: MultiPageMapping | undefined;
  internalProp: string;
}

function _GenerateRow({ row, childIds, groupBinding, multiPageMapping, internalProp }: GenerateRowProps) {
  const node = GeneratorInternal.useParent() as LayoutNode;
  const removeRow = NodesInternal.useRemoveRow();
  const depth = GeneratorInternal.useDepth();
  const directMutators = useMemo(
    () => [mutateComponentId(row), mutateMultiPageIndex(multiPageMapping)],
    [multiPageMapping, row],
  );

  const recursiveMutators = useMemo(
    () => [mutateDataModelBindings(row, groupBinding), mutateMapping(row, depth)],
    [row, depth, groupBinding],
  );

  GeneratorStages.AddNodes.useEffect(
    () => () => {
      removeRow(node, row, internalProp);
    },
    [node, row, internalProp, removeRow],
  );

  return (
    <GeneratorRowProvider
      row={row}
      directMutators={directMutators}
      recursiveMutators={recursiveMutators}
    >
      <GeneratorCondition
        stage={StageEvaluateExpressions}
        mustBeAdded='all'
      >
        <ResolveRowExpressions internalProp={internalProp} />
      </GeneratorCondition>
      <GenerateNodeChildrenWhenReady childIds={childIds} />
    </GeneratorRowProvider>
  );
}

const GenerateRow = React.memo(_GenerateRow);
GenerateRow.displayName = 'GenerateRow';

interface ResolveRowProps {
  internalProp: string;
}

function ResolveRowExpressions({ internalProp }: ResolveRowProps) {
  const parent = GeneratorInternal.useParent() as LayoutNode;
  const row = GeneratorInternal.useRow() as BaseRow;
  const nodeChildren = useNodeDirectChildren(parent as LayoutNode, { onlyInRowUuid: row!.uuid });
  const firstChildRaw = useNodeLax(nodeChildren?.[0]);
  const firstChild = firstChildRaw === ContextNotProvided ? undefined : firstChildRaw;

  const item = GeneratorInternal.useIntermediateItem();
  const props = useExpressionResolverProps(firstChild, item as CompExternal, row);

  const setExtra = NodesStateQueue.useSetRowExtras();
  const def = useDef(item!.type);
  const resolvedRowExtras = useMemo(() => (def as CompDef).evalExpressionsForRow(props as any), [def, props]);

  GeneratorStages.EvaluateExpressions.useEffect(() => {
    setExtra({ node: parent, row, internalProp, extras: resolvedRowExtras });
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
