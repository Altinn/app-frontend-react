import React, { useEffect, useState } from 'react';

import { Button, ButtonColor, ButtonVariant } from '@digdir/design-system-react';
import { Close } from '@navikt/ds-icons';

import reusedClasses from 'src/features/devtools/components/LayoutInspector/LayoutInspector.module.css';
import { NodeHierarchy } from 'src/features/devtools/components/NodeInspector/NodeHierarchy';
import { NodeInspectorContextProvider } from 'src/features/devtools/components/NodeInspector/NodeInspectorContext';
import { SplitView } from 'src/features/devtools/components/SplitView/SplitView';
import { useExprContext } from 'src/utils/layout/ExprContext';

export const NodeInspector = () => {
  const pages = useExprContext();
  const currentPage = pages?.current();
  const currentPageKey = currentPage?.top.myKey;
  const [selectedId, setSelected] = useState<string | undefined>(undefined);
  const selectedNode = selectedId ? currentPage?.findById(selectedId) : undefined;

  useEffect(() => {
    setSelected(undefined);
  }, [currentPageKey]);

  return (
    <SplitView direction='row'>
      <div className={reusedClasses.container}>
        <NodeHierarchy
          nodes={currentPage?.children()}
          selected={selectedId}
          onClick={setSelected}
        />
      </div>
      {selectedId && selectedNode && (
        <div className={reusedClasses.properties}>
          <div className={reusedClasses.header}>
            <h3>Egenskaper for {selectedId}</h3>
            <Button
              onClick={() => setSelected(undefined)}
              variant={ButtonVariant.Quiet}
              color={ButtonColor.Secondary}
              aria-label={'close'}
              icon={<Close aria-hidden />}
            />
          </div>
          <NodeInspectorContextProvider
            value={{
              selectedNodeId: selectedId,
              selectNode: setSelected,
            }}
          >
            {selectedNode.def.renderDevToolsInspector(selectedNode as any)}
          </NodeInspectorContextProvider>
        </div>
      )}
    </SplitView>
  );
};
