import React from 'react';

import { Tabs } from '@digdir/design-system-react';

import { DevHiddenFunctionality } from 'src/features/devtools/components/DevHiddenFunctionality/DevHiddenFunctionality';
import { DevNavigationButtons } from 'src/features/devtools/components/DevNavigationButtons/DevNavigationButtons';
import { ExpressionPlayground } from 'src/features/devtools/components/ExpressionPlayground/ExpressionPlayground';
import { LayoutInspector } from 'src/features/devtools/components/LayoutInspector/LayoutInspector';
import { NodeInspector } from 'src/features/devtools/components/NodeInspector/NodeInspector';
import { PDFPreviewButton } from 'src/features/devtools/components/PDFPreviewButton/PDFPreviewButton';
import { PermissionsEditor } from 'src/features/devtools/components/PermissionsEditor/PermissionsEditor';
import classes from 'src/features/devtools/DevTools.module.css';

export const DevToolsControls = () => (
  <div className={classes.tabs}>
    <Tabs
      items={[
        {
          name: 'Generelt',
          content: (
            <div className={classes.page}>
              <PDFPreviewButton />
              <DevNavigationButtons />
              <DevHiddenFunctionality />
              <PermissionsEditor />
            </div>
          ),
        },
        {
          name: 'Layout',
          content: <LayoutInspector />,
        },
        {
          name: 'Komponenter',
          content: <NodeInspector />,
        },
        {
          name: 'Uttrykk',
          content: <ExpressionPlayground />,
        },
      ]}
    />
  </div>
);
