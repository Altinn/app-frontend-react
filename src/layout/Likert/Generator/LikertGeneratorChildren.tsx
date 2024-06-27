import React, { useMemo, useRef } from 'react';

import { FD } from 'src/features/formData/FormDataWrite';
import { getLikertStartStopIndex } from 'src/utils/formLayout';
import { GeneratorInternal, GeneratorRowProvider } from 'src/utils/layout/generator/GeneratorContext';
import { GeneratorCondition, GeneratorStages, StageAddNodes } from 'src/utils/layout/generator/GeneratorStages';
import { GenerateNodeChildrenWithStaticLayout } from 'src/utils/layout/generator/LayoutSetGenerator';
import {
  mutateComponentId,
  mutateDataModelBindings,
  mutateMapping,
  useReusedRows,
} from 'src/utils/layout/generator/NodeRepeatingChildren';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { CompExternalExact, CompIntermediate } from 'src/layout/layout';
import type { ChildClaims } from 'src/utils/layout/generator/GeneratorContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { BaseRow } from 'src/utils/layout/types';

export function LikertGeneratorChildren() {
  return (
    <GeneratorCondition
      stage={StageAddNodes}
      mustBeAdded='parent'
    >
      <PerformWork />
    </GeneratorCondition>
  );
}

function PerformWork() {
  const item = GeneratorInternal.useIntermediateItem() as CompIntermediate<'Likert'>;
  const questionsBinding = item?.dataModelBindings?.questions;
  const freshRows = FD.useFreshRows(questionsBinding);
  const prevRows = useRef<BaseRow[]>(freshRows);
  const rows = useReusedRows(freshRows, prevRows);

  const lastIndex = rows.length - 1;
  const { startIndex, stopIndex } = getLikertStartStopIndex(lastIndex, item.filter);
  const filteredRows = rows.slice(startIndex, stopIndex + 1);

  return (
    <>
      {filteredRows.map((row) => (
        <GenerateRow
          key={row.uuid}
          row={row}
          questionsBinding={questionsBinding}
        />
      ))}
    </>
  );
}

interface GenerateRowProps {
  row: BaseRow;
  questionsBinding: string;
}

function _GenerateRow({ row, questionsBinding }: GenerateRowProps) {
  const parentItem = GeneratorInternal.useIntermediateItem() as CompIntermediate<'Likert'>;
  const node = GeneratorInternal.useParent() as LayoutNode<'Likert'>;
  const removeRow = NodesInternal.useRemoveRow();
  const depth = GeneratorInternal.useDepth();

  const childId = `${parentItem.id}-item`;

  const externalItem = useMemo(
    (): CompExternalExact<'LikertItem'> => ({
      id: childId,
      type: 'LikertItem',
      textResourceBindings: {
        title: parentItem.textResourceBindings?.questions,
      },
      dataModelBindings: {
        simpleBinding: parentItem.dataModelBindings?.answer,
      },
      options: parentItem.options,
      optionsId: parentItem.optionsId,
      mapping: parentItem.mapping,
      required: parentItem.required,
      secure: parentItem.secure,
      queryParameters: parentItem.queryParameters,
      readOnly: parentItem.readOnly,
      sortOrder: parentItem.sortOrder,
      showValidations: parentItem.showValidations,
      grid: parentItem.grid,
      source: parentItem.source,
      hidden: parentItem.hidden,
      pageBreak: parentItem.pageBreak,
      renderAsSummary: parentItem.renderAsSummary,
    }),
    [parentItem, childId],
  );

  const childClaims = useMemo(
    (): ChildClaims => ({
      [childId]: {
        pluginKey: 'LikertRowsPlugin',
      },
    }),
    [childId],
  );

  const layoutMap = useMemo(
    (): Record<string, CompExternalExact<'LikertItem'>> => ({
      [childId]: externalItem,
    }),
    [childId, externalItem],
  );

  const recursiveMutators = useMemo(
    () => [mutateComponentId(row), mutateDataModelBindings(row, questionsBinding), mutateMapping(row, depth)],
    [row, depth, questionsBinding],
  );

  GeneratorStages.AddNodes.useEffect(
    () => () => {
      removeRow(node, row, 'rows');
    },
    [node, row, removeRow],
  );

  return (
    <GeneratorRowProvider
      row={row}
      recursiveMutators={recursiveMutators}
    >
      <GenerateNodeChildrenWithStaticLayout
        claims={childClaims}
        staticLayoutMap={layoutMap}
      />
    </GeneratorRowProvider>
  );
}

const GenerateRow = React.memo(_GenerateRow);
GenerateRow.displayName = 'GenerateRow';