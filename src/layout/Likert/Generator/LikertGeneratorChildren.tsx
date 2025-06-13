import React, { useMemo } from 'react';

import { FD } from 'src/features/formData/FormDataWrite';
import { getLikertStartStopIndex } from 'src/layout/Likert/rowUtils';
import { GeneratorInternal, GeneratorRowProvider } from 'src/utils/layout/generator/GeneratorContext';
import { GeneratorCondition, GeneratorRunProvider, StageAddNodes } from 'src/utils/layout/generator/GeneratorStages';
import { GenerateNodeChildren } from 'src/utils/layout/generator/LayoutSetGenerator';
import {
  mutateComponentId,
  mutateComponentIdPlain,
  mutateDataModelBindings,
  mutateMapping,
} from 'src/utils/layout/generator/NodeRepeatingChildren';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { CompIntermediate } from 'src/layout/layout';
import type { ChildClaims } from 'src/utils/layout/generator/GeneratorContext';

export function LikertGeneratorChildren() {
  return (
    <GeneratorCondition
      stage={StageAddNodes}
      mustBeAdded='parent'
    >
      <LikertGeneratorChildrenWorker />
    </GeneratorCondition>
  );
}

function LikertGeneratorChildrenWorker() {
  const item = GeneratorInternal.useIntermediateItem() as CompIntermediate<'Likert'>;
  const questionsBinding = item?.dataModelBindings?.questions;
  const rows = FD.useFreshRows(questionsBinding);

  const lastIndex = rows.length - 1;
  const { startIndex, stopIndex } = getLikertStartStopIndex(lastIndex, item.filter);
  const filteredRows = rows.slice(startIndex, stopIndex + 1);

  return (
    <>
      {filteredRows.map((row) => (
        <GeneratorRunProvider key={row.index}>
          <GenerateRow
            rowIndex={row.index}
            rowUuid={row.uuid}
            questionsBinding={questionsBinding}
          />
        </GeneratorRunProvider>
      ))}
    </>
  );
}

interface GenerateRowProps {
  rowIndex: number;
  rowUuid: string;
  questionsBinding: IDataModelReference;
}

export function makeLikertChildId(parentId: string, rowIndex: number | undefined) {
  if (rowIndex === undefined) {
    return `${parentId}-item`;
  }
  return `${parentId}-item-${rowIndex}`;
}

const GenerateRow = React.memo(function GenerateRow({ rowIndex, questionsBinding }: GenerateRowProps) {
  const parentItem = GeneratorInternal.useIntermediateItem() as CompIntermediate<'Likert'>;
  const depth = GeneratorInternal.useDepth();

  const childId = makeLikertChildId(parentItem.id, undefined); // This needs to be the base ID

  const childClaims = useMemo(
    (): ChildClaims => ({
      [childId]: {
        pluginKey: 'LikertRowsPlugin',
      },
    }),
    [childId],
  );

  const recursiveMutators = useMemo(
    () => [
      mutateComponentId(rowIndex),
      mutateDataModelBindings(rowIndex, questionsBinding),
      mutateMapping(rowIndex, depth),
    ],
    [rowIndex, depth, questionsBinding],
  );

  return (
    <GeneratorRowProvider
      rowIndex={rowIndex}
      idMutators={[mutateComponentIdPlain(rowIndex)]}
      recursiveMutators={recursiveMutators}
      groupBinding={questionsBinding}
      forceHidden={false}
    >
      <GenerateNodeChildren
        claims={childClaims}
        pluginKey={'LikertRowsPlugin' as const}
      />
    </GeneratorRowProvider>
  );
});

GenerateRow.displayName = 'GenerateRow';
