import React from 'react';

import { TextArea } from '@digdir/design-system-react';

import classes from 'src/features/devtools/components/LayoutInspector/LayoutInspector.module.css';
import { LayoutInspectorItem } from 'src/features/devtools/components/LayoutInspector/LayoutInspectorItem';
import { SplitView } from 'src/features/devtools/components/SplitView/SplitView';
import { useAppSelector } from 'src/hooks/useAppSelector';

export const LayoutInspector = () => {
  const { currentView } = useAppSelector((state) => state.formLayout.uiConfig);
  const layouts = useAppSelector((state) => state.formLayout.layouts);

  const currentLayout = layouts?.[currentView];

  return (
    <SplitView direction='row'>
      <div className={classes.container}>
        <ul className={classes.list}>
          {currentLayout?.map((component) => (
            <LayoutInspectorItem
              key={component.id}
              component={component}
            />
          ))}
        </ul>
      </div>
      <TextArea />
    </SplitView>
  );
};
