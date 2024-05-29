import React, { useEffect, useMemo, useState } from 'react';

import { ExprVal } from 'src/features/expressions/types';
import { useHiddenLayoutsExpressions, useLayouts } from 'src/features/form/layout/LayoutsContext';
import { getComponentCapabilities, getComponentDef } from 'src/layout';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import { GeneratorDebug } from 'src/utils/layout/generator/debug';
import { GeneratorInternal, GeneratorPageProvider } from 'src/utils/layout/generator/GeneratorContext';
import {
  GeneratorErrorBoundary,
  useGeneratorErrorBoundaryNodeRef,
} from 'src/utils/layout/generator/GeneratorErrorBoundary';
import { GeneratorStages } from 'src/utils/layout/generator/GeneratorStages';
import { useResolvedExpression } from 'src/utils/layout/generator/useResolvedExpression';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { LayoutPages } from 'src/utils/layout/LayoutPages';
import { Hidden, NodesInternal, useNodes } from 'src/utils/layout/NodesContext';
import type { CompExternal, CompTypes, ILayout } from 'src/layout/layout';
import type {
  BasicNodeGeneratorProps,
  ChildClaimerProps,
  ComponentProto,
  ContainerGeneratorProps,
} from 'src/layout/LayoutComponent';
import type { ChildrenMap } from 'src/utils/layout/generator/GeneratorContext';
import type { HiddenStatePage } from 'src/utils/layout/NodesContext';

const style: React.CSSProperties = GeneratorDebug.displayState
  ? {
      display: 'block',
      position: 'fixed',
      top: '0',
      left: '0',
      zIndex: 1000,
      backgroundColor: 'white',
      padding: '10px',
      borderRight: '1px solid red',
      maxWidth: '40vw',
      height: '100vh',
      overflow: 'auto',
    }
  : { display: 'none' };

interface ChildrenState {
  forLayout: ILayout;
  map: ChildrenMap | undefined;
}

export function LayoutSetGenerator() {
  const layouts = useLayouts();
  const pages = useMemo(() => new LayoutPages(), []);

  return (
    <div style={style}>
      <SaveFinishedNodesToStore pages={pages} />
      <ExportStores />
      {GeneratorDebug.displayState && <h1>Node generator</h1>}
      {layouts &&
        Object.keys(layouts).map((key) => {
          const layout = layouts[key];

          if (!layout) {
            return null;
          }

          return (
            <GeneratorErrorBoundary key={key}>
              <PageGenerator
                name={key}
                layout={layout}
                layoutSet={pages}
              />
            </GeneratorErrorBoundary>
          );
        })}
    </div>
  );
}

function SaveFinishedNodesToStore({ pages }: { pages: LayoutPages }) {
  const layouts = useLayouts();
  const existingNodes = useNodes();
  const setNodes = NodesInternal.useSetNodes();
  const isFinished = GeneratorStages.useIsFinished();
  const layoutKeys = useMemo(() => Object.keys(layouts), [layouts]);

  useEffect(() => {
    if (existingNodes === pages) {
      return;
    }

    // With this being a useEffect, it will always run after all the children here have rendered - unless, importantly,
    // the children themselves rely on useEffect() to run in order to reach a stable state.
    const numPages = layoutKeys.length;
    if (!pages) {
      return;
    }
    if (numPages === 0) {
      setNodes(pages);
      return;
    }

    if (isFinished) {
      setNodes(pages);
    }
  }, [layoutKeys, pages, isFinished, setNodes, existingNodes]);

  return null;
}

function ExportStores() {
  const nodesStore = NodesInternal.useNodesStore();
  const dataStore = NodesInternal.useDataStore();

  useEffect(() => {
    window.CypressState = window.CypressState || {};
    window.CypressState.nodesStore = nodesStore;
    window.CypressState.nodesDataStore = dataStore;
  }, [nodesStore, dataStore]);

  return null;
}

interface PageProps {
  layout: ILayout;
  name: string;
  layoutSet: LayoutPages;
}

function PageGenerator({ layout, name, layoutSet }: PageProps) {
  const [children, setChildren] = useState<ChildrenState>({ forLayout: layout, map: undefined });
  const page = useMemo(() => new LayoutPage(), []);
  useGeneratorErrorBoundaryNodeRef().current = page;

  const [hidden, setHidden] = useState<HiddenStatePage>({
    hiddenByTracks: false,
    hiddenByExpression: false,
    hiddenByRules: false,
    parent: undefined,
  });

  const getProto = useMemo(() => {
    const proto: { [id: string]: ComponentProto } = {};

    for (const component of layout) {
      proto[component.id] = {
        type: component.type,
        capabilities: getComponentCapabilities(component.type),
      };
    }

    return (id: string) => proto[id];
  }, [layout]);

  const map = children.map;
  const topLevelIds = useMemo(() => {
    const claimedChildren = new Set(map ? Object.values(map).flat() : []);
    return layout.filter((component) => !claimedChildren.has(component.id)).map((component) => component.id);
  }, [map, layout]);

  const layoutMap = useMemo(() => {
    const out: { [id: string]: CompExternal } = {};
    for (const component of layout) {
      out[component.id] = component;
    }

    return out;
  }, [layout]);

  if (children.forLayout !== layout) {
    // Force a new first pass if the layout changes
    setChildren({ forLayout: layout, map: undefined });
    return null;
  }

  if (layout.length === 0) {
    return null;
  }

  return (
    <>
      <MaintainPageState
        layoutSet={layoutSet}
        page={page}
        name={name}
        setHidden={setHidden}
      />
      {map === undefined &&
        layout.map((component) => (
          <ComponentClaimChildren
            key={component.id}
            component={component}
            setChildren={setChildren}
            getProto={getProto}
          />
        ))}
      {GeneratorDebug.displayState && <h2>Page: {name}</h2>}
      {map !== undefined && (
        <GeneratorPageProvider
          parent={page}
          hidden={hidden}
          layoutMap={layoutMap}
          childrenMap={map}
        >
          <GenerateNodeChildren childIds={topLevelIds} />
        </GeneratorPageProvider>
      )}
    </>
  );
}

interface MaintainPageStateProps {
  layoutSet: LayoutPages;
  page: LayoutPage;
  name: string;
  setHidden: React.Dispatch<React.SetStateAction<HiddenStatePage>>;
}

function MaintainPageState({ layoutSet, page, name, setHidden }: MaintainPageStateProps) {
  const addPage = NodesInternal.useAddPage();
  const setPageProp = NodesInternal.useSetPageProp();
  const removePage = NodesInternal.useRemovePage();

  const hiddenByTracks = Hidden.useIsPageHiddenViaTracks(name);
  const hiddenByExpression = useIsHiddenPage(page);

  const hidden: HiddenStatePage = useMemo(
    () => ({
      hiddenByTracks,
      hiddenByExpression,
      hiddenByRules: false,
      parent: undefined,
    }),
    [hiddenByTracks, hiddenByExpression],
  );

  addPage(name);
  if (!page.isRegisteredInCollection(layoutSet)) {
    page.registerCollection(name, layoutSet);
  }

  // Removes the page from the store when is removed from the React tree
  GeneratorStages.AddNodes.useEffect(
    () => () => {
      removePage(page.pageKey);
      page.unregisterCollection();
    },
    [page, removePage],
  );

  GeneratorStages.MarkHidden.useEffect(() => {
    setPageProp(name, 'hidden', hidden);
    setHidden(hidden);
  }, [hidden, name, setPageProp, setHidden]);

  return null;
}

interface NodeChildrenProps {
  childIds: string[];
}

export function GenerateNodeChildren({ childIds }: NodeChildrenProps) {
  const layoutMap = GeneratorInternal.useLayoutMap();
  const map = GeneratorInternal.useChildrenMap();

  return (
    <>
      {childIds.map((id) => (
        <GeneratorErrorBoundary key={id}>
          <GenerateComponent
            baseId={id}
            childIds={map[id]}
            type={layoutMap[id].type}
          />
        </GeneratorErrorBoundary>
      ))}
    </>
  );
}

function useIsHiddenPage(page: LayoutPage) {
  const hiddenExpr = useHiddenLayoutsExpressions();
  return useResolvedExpression(ExprVal.Boolean, page, hiddenExpr[page.pageKey], false);
}

interface ComponentClaimChildrenProps {
  component: CompExternal;
  setChildren: React.Dispatch<React.SetStateAction<ChildrenState>>;
  getProto: (id: string) => ComponentProto | undefined;
}

function ComponentClaimChildren({ component, setChildren, getProto }: ComponentClaimChildrenProps) {
  const def = getComponentDef(component.type);

  // The first render will be used to determine which components will be claimed as children by others (which will
  // prevent them from rendering on the top-level on the next render pass). We must always set a state here,
  // otherwise the page will not know if the first pass is done.
  useEffect(() => {
    if (def instanceof ContainerComponent) {
      const claimedChildren: string[] = [];
      const props: ChildClaimerProps<any> = {
        item: component,
        claimChild: (id) => {
          if (getProto(id) === undefined) {
            window.logError(`Component '${id}' (as referenced by '${component.id}') does not exist`);
            return;
          }
          claimedChildren.push(id);
        },
        getProto: (id) => {
          const proto = getProto(id);
          if (proto === undefined) {
            window.logError(`Component '${id}' (as referenced by '${component.id}') does not exist`);
          }
          return proto;
        },
      };

      def.claimChildren(props as unknown as any);
      setChildren((prev) => ({
        ...prev,
        map: {
          ...prev.map,
          [component.id]: claimedChildren,
        },
      }));
    } else {
      setChildren((prev) => (prev.map === undefined ? { ...prev, map: {} } : prev));
    }
  }, [def, component, setChildren, getProto]);

  return (
    <>
      {GeneratorDebug.displayState && (
        <h3>
          {component.id} ({component.type})
        </h3>
      )}
      {GeneratorDebug.displayState && <span>(first pass render)</span>}
    </>
  );
}

interface ComponentProps {
  baseId: string;
  type: CompTypes;
  childIds: string[] | undefined;
}

function GenerateComponent({ baseId, type, childIds }: ComponentProps) {
  const def = getComponentDef(type);
  const Generator = def.renderNodeGenerator;
  const props = useMemo(() => {
    if (def instanceof ContainerComponent) {
      const out: ContainerGeneratorProps = {
        baseId,
        childIds: childIds ?? [],
      };
      return out;
    }

    const out: BasicNodeGeneratorProps = { baseId };
    return out;
  }, [childIds, baseId, def]);

  return (
    <div
      style={{
        borderLeft: `5px solid blue`,
        paddingLeft: '5px',
      }}
    >
      {GeneratorDebug.displayState && (
        <h3>
          {baseId} ({type})
        </h3>
      )}
      {GeneratorDebug.displayState && <span>{childIds ? `Children: ${childIds.join(', ')}` : 'No children'}</span>}
      <Generator {...(props as any)} />
    </div>
  );
}
