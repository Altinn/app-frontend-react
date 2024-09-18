import React, { type PropsWithChildren } from 'react';

import { TaskStoreProvider } from 'src/core/contexts/taskStoreContext';
import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
import { DoSummaryWrapper } from 'src/features/pdf/PdfView2';
import { SubformSummaryTable } from 'src/layout/Subform/Summary/SubformSummaryTable';
import { LayoutSetSummary } from 'src/layout/Summary2/SummaryComponent2/LayoutSetSummary';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { useNodeTraversal } from 'src/utils/layout/useNodeTraversal';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export const SummarySubformWrapper = ({ node }: PropsWithChildren<{ node: LayoutNode<'Subform'> }>) => {
  const { layoutSet } = useNodeItem(node);
  const instanceData = useStrictInstanceData();
  const dataType = useDataTypeFromLayoutSet(layoutSet);
  const dataElements = instanceData.data.filter((d) => d.dataType === dataType) ?? [];

  return (
    <>
      {dataElements?.map((element, idx) => (
        <TaskStoreProvider key={element.id + idx}>
          <DoSummaryWrapper
            dataElementId={element.id}
            layoutSet={layoutSet}
            dataType={element.dataType}
          >
            <LayoutSetSummary />
          </DoSummaryWrapper>
        </TaskStoreProvider>
      ))}
    </>
  );
};

export function SubformSummaryComponent2({
  displayType,
  subformId,
  componentNode,
}: {
  displayType?: string;
  subformId?: string;
  componentNode?: LayoutNode<'Subform'>;
}) {
  const children = useNodeTraversal((t) =>
    t
      .allNodes()
      .filter((node) => node.isType('Subform'))
      .filter((child) => {
        if (!subformId) {
          return child;
        }
        return child.id === subformId;
      }),
  );

  if (displayType === 'table' && componentNode) {
    return <SubformSummaryTable targetNode={componentNode} />;
  }

  return (
    <>
      {children.map((child, idx) => (
        <SummarySubformWrapper
          key={idx}
          node={child}
        />
      ))}
    </>
  );
}
