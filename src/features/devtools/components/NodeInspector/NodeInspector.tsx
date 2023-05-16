import React, { useEffect, useState } from 'react';

import { Button, ButtonColor, ButtonVariant } from '@digdir/design-system-react';
import { Close } from '@navikt/ds-icons';

import reusedClasses from 'src/features/devtools/components/LayoutInspector/LayoutInspector.module.css';
import { NodeHierarchy } from 'src/features/devtools/components/NodeInspector/NodeHierarchy';
import { SplitView } from 'src/features/devtools/components/SplitView/SplitView';
import { useExprContext } from 'src/utils/layout/ExprContext';

export const NodeInspector = () => {
  const pages = useExprContext();
  const currentPage = pages?.current();
  const currentPageKey = currentPage?.top.myKey;
  const [selectedComponent, setSelected] = useState<string | null>(null);
  const selectedNode = selectedComponent ? currentPage?.findById(selectedComponent) : undefined;

  useEffect(() => {
    setSelected(null);
  }, [currentPageKey]);

  return (
    <SplitView direction='row'>
      <div className={reusedClasses.container}>
        <NodeHierarchy
          nodes={currentPage?.children()}
          onClick={setSelected}
        />
      </div>
      {selectedComponent && (
        <div className={reusedClasses.properties}>
          <div className={reusedClasses.header}>
            <h3>Egenskaper</h3>
            <Button
              onClick={() => setSelected(null)}
              variant={ButtonVariant.Quiet}
              color={ButtonColor.Secondary}
              aria-label={'close'}
              icon={<Close aria-hidden />}
            />
          </div>
          <textarea
            disabled={true}
            // TODO: Implement
            value={`TODO: Display some information about node ${selectedNode?.item.id}`}
          />
        </div>
      )}
    </SplitView>
  );
};
