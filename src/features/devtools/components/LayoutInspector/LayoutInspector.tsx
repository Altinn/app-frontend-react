/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { Button, ButtonColor, ButtonVariant } from '@digdir/design-system-react';
import { Close } from '@navikt/ds-icons';

import classes from 'src/features/devtools/components/LayoutInspector/LayoutInspector.module.css';
import { LayoutInspectorItem } from 'src/features/devtools/components/LayoutInspector/LayoutInspectorItem';
import { SplitView } from 'src/features/devtools/components/SplitView/SplitView';
import { DevToolsActions } from 'src/features/devtools/data/devToolsSlice';
import { DevToolsTab } from 'src/features/devtools/data/types';
import { FormLayoutActions } from 'src/features/layout/formLayoutSlice';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useExprContext } from 'src/utils/layout/ExprContext';

export const LayoutInspector = () => {
  const selectedComponent = useAppSelector((state) => state.devTools.layoutInspector.selectedComponentId);
  const { currentView } = useAppSelector((state) => state.formLayout.uiConfig);
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const [componentProperties, setComponentProperties] = useState<string | null>(null);
  const [propertiesHaveChanged, setPropertiesHaveChanged] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const nodes = useExprContext();

  const dispatch = useDispatch();
  const setSelectedComponent = useCallback(
    (selectedComponentId: string | undefined) =>
      dispatch(
        DevToolsActions.layoutInspectorSet({
          selectedComponentId,
        }),
      ),
    [dispatch],
  );

  const currentLayout = layouts?.[currentView];
  const matchingNodes = selectedComponent ? nodes?.findAllById(selectedComponent) || [] : [];

  useEffect(() => {
    setSelectedComponent(undefined);
  }, [setSelectedComponent, currentView]);

  useEffect(() => {
    if (selectedComponent) {
      const component = currentLayout?.find((component) => component.id === selectedComponent);
      setComponentProperties(JSON.stringify(component, null, 2));
    }
    setPropertiesHaveChanged(false);
  }, [selectedComponent, currentLayout]);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setComponentProperties(event.target.value);
    !propertiesHaveChanged && setPropertiesHaveChanged(true);
  }

  function handleSave() {
    if (selectedComponent) {
      try {
        const updatedComponent = JSON.parse(componentProperties ?? '');
        const updatedLayout = currentLayout?.map((component) => {
          if (component.id === selectedComponent) {
            return updatedComponent;
          } else {
            return component;
          }
        });

        dispatch(FormLayoutActions.updateLayouts({ layouts: { [currentView]: updatedLayout } }));

        setPropertiesHaveChanged(false);
        return;
      } catch (error) {
        console.error(error);
      }
    }
    setError(true);
    setTimeout(() => {
      setError(false);
    }, 2000);
  }

  const NodeLink = ({ nodeId }: { nodeId: string }) => (
    <div>
      <a
        href='#'
        onClick={(e) => {
          e.preventDefault();
          dispatch(
            DevToolsActions.nodeInspectorSet({
              selectedNodeId: nodeId,
            }),
          );
          dispatch(
            DevToolsActions.setActiveTab({
              tabName: DevToolsTab.Components,
            }),
          );
        }}
      >
        Utforsk {nodeId} i komponenter-fanen
      </a>
    </div>
  );

  return (
    <SplitView
      direction='row'
      sizes={[300]}
    >
      <div className={classes.container}>
        <ul className={classes.list}>
          {currentLayout?.map((component) => (
            <LayoutInspectorItem
              key={component.id}
              component={component}
              selected={selectedComponent === component.id}
              onClick={() => setSelectedComponent(component.id)}
            />
          ))}
        </ul>
      </div>
      {selectedComponent && (
        <div className={classes.properties}>
          <div className={classes.header}>
            <h3>Egenskaper</h3>
            <div className={classes.headerLink}>
              {matchingNodes.length === 0 && 'Ingen aktive komponenter funnet'}
              {matchingNodes.map((node) => (
                <NodeLink
                  key={node.item.id}
                  nodeId={node.item.id}
                />
              ))}
            </div>
            <Button
              onClick={() => setSelectedComponent(undefined)}
              variant={ButtonVariant.Quiet}
              color={ButtonColor.Secondary}
              aria-label={'close'}
              icon={<Close aria-hidden />}
            />
          </div>
          <textarea
            value={componentProperties ?? ''}
            onChange={handleChange}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                // Save when pressing ctrl + s
                !error && handleSave();
                event.preventDefault();
                event.stopPropagation();
              }
            }}
          />
          {error && <span className={classes.error}>Ugyldig JSON</span>}
          {propertiesHaveChanged && <Button onClick={handleSave}>Lagre</Button>}
        </div>
      )}
    </SplitView>
  );
};
