import React, { useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';

import dot from 'dot-object';

import { ContextNotProvided } from 'src/core/contexts/context';
import { FD } from 'src/features/formData/FormDataWrite';
import { useMemoDeepEqual } from 'src/hooks/useStateDeepEqual';
import { GeneratorInternal, GeneratorRowProvider } from 'src/utils/layout/generator/GeneratorContext';
import {
  GeneratorCondition,
  GeneratorRunProvider,
  GeneratorStages,
  NodesStateQueue,
  StageAddNodes,
  StageEvaluateExpressions,
} from 'src/utils/layout/generator/GeneratorStages';
import { GenerateNodeChildren } from 'src/utils/layout/generator/LayoutSetGenerator';
import { useDef, useExpressionResolverProps } from 'src/utils/layout/generator/NodeGenerator';
import { NodesInternal, useNodeLax } from 'src/utils/layout/NodesContext';
import { useNodeDirectChildren } from 'src/utils/layout/useNodeItem';
import type { CompDef } from 'src/layout';
import type { CompExternal } from 'src/layout/layout';
import type { ChildClaims, ChildMutator } from 'src/utils/layout/generator/GeneratorContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { BaseRow } from 'src/utils/layout/types';

interface Props {
  claims: ChildClaims;
  internalProp: string;
  externalProp: string;
  binding: string;
  multiPageSupport: false | string;
  pluginKey: string;
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

function PerformWork({ claims, binding, multiPageSupport, externalProp, internalProp, pluginKey }: Props) {
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
        <GeneratorRunProvider key={row.uuid}>
          <GenerateRow
            row={row}
            groupBinding={groupBinding}
            claims={claims}
            multiPageMapping={multiPageMapping}
            internalProp={internalProp}
            pluginKey={pluginKey}
          />
        </GeneratorRunProvider>
      ))}
    </>
  );
}

/**
 * Re-uses the existing row objects from previous runs whenever row uuids match.
 * This causes props to not change for the row components, which is important for performance.
 */
export function useReusedRows(freshRows: BaseRow[], prevRows: MutableRefObject<BaseRow[]>): BaseRow[] {
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
  claims: ChildClaims;
  groupBinding: string | undefined;
  multiPageMapping: MultiPageMapping | undefined;
  internalProp: string;
  pluginKey: string;
}

function _GenerateRow({ row, claims, groupBinding, multiPageMapping, internalProp, pluginKey }: GenerateRowProps) {
  const node = GeneratorInternal.useParent() as LayoutNode;
  const removeRow = NodesInternal.useRemoveRow();
  const depth = GeneratorInternal.useDepth();
  const directMutators = useMemo(() => [mutateMultiPageIndex(multiPageMapping)], [multiPageMapping]);

  const recursiveMutators = useMemo(
    () => [mutateComponentId(row), mutateDataModelBindings(row, groupBinding), mutateMapping(row, depth)],
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
      <GenerateNodeChildren
        claims={claims}
        pluginKey={pluginKey}
      />
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
  const resolvedRowExtras = useMemoDeepEqual(() => (def as CompDef).evalExpressionsForRow(props as any), [def, props]);

  GeneratorStages.EvaluateExpressions.useEffect(() => {
    setExtra({ node: parent, row, internalProp, extras: resolvedRowExtras });
  }, [resolvedRowExtras, setExtra, parent, row, internalProp]);

  return null;
}

// TODO: Mark rows as hidden. This should be different from the hiddenRow expression/property, and should mark a row
// as hidden if:
// - Every node/component inside is hidden

// TODO: Use the hidden state in a repeating group row to:
// - Mark every node inside the row as hidden
// - Replicate the code below:

//   const myBaseId = this.minimalItem.baseComponentId || this.minimalItem.id;
//   const groupMode = this.parent.minimalItem.edit?.mode;
//   const tableColSetup = this.parent.minimalItem.tableColumns && this.parent.minimalItem.tableColumns[myBaseId];
//
//   // This specific configuration hides the component fully, without having set hidden=true on the component itself.
//   // It's most likely done by mistake, but we still need to respect it when checking if the component is hidden,
//   // because it doesn't make sense to validate a component that is hidden in the UI and the
//   // user cannot interact with.
//   let hiddenImplicitly =
//     tableColSetup?.showInExpandedEdit === false && !tableColSetup?.editInTable && groupMode !== 'onlyTable';
//
//   if (groupMode === 'onlyTable' && tableColSetup?.editInTable === false) {
//     // This is also a way to hide a component implicitly
//     hiddenImplicitly = true;
//   }

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

export function mutateComponentId(row: BaseRow): ChildMutator {
  return (item) => {
    (item as any).baseComponentId = (item as any).baseComponentId || item.id;
    item.id += `-${row.index}`;
  };
}

export function mutateDataModelBindings(row: BaseRow, groupBinding: string | undefined): ChildMutator {
  return (item) => {
    const bindings = item.dataModelBindings || {};
    for (const key of Object.keys(bindings)) {
      if (groupBinding && bindings[key]) {
        bindings[key] = bindings[key].replace(groupBinding, `${groupBinding}[${row.index}]`);
      }
    }
  };
}

export function mutateMapping(row: BaseRow, depth: number): ChildMutator {
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
