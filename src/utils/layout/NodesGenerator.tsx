import React, { useEffect, useMemo, useState } from 'react';

import { ExprVal } from 'src/features/expressions/types';
import { useHiddenLayoutsExpressions, useLayouts } from 'src/features/form/layout/LayoutsContext';
import { useCurrentView } from 'src/hooks/useNavigatePage';
import { getComponentCapabilities, getComponentDef } from 'src/layout';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { LayoutPages } from 'src/utils/layout/LayoutPages';
import { Hidden, NodesInternal, useNodes } from 'src/utils/layout/NodesContext';
import { NodeGeneratorInternal, NodesGeneratorPageProvider } from 'src/utils/layout/NodesGeneratorContext';
import { NodeStages } from 'src/utils/layout/NodeStages';
import { useResolvedExpression } from 'src/utils/layout/useResolvedExpression';
import type { CompExternal, CompTypes, ILayout } from 'src/layout/layout';
import type {
  BasicNodeGeneratorProps,
  ChildClaimerProps,
  ComponentProto,
  ContainerGeneratorProps,
} from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { HiddenStatePage } from 'src/utils/layout/NodesContext';
import type { ChildrenMap } from 'src/utils/layout/NodesGeneratorContext';

export const NodeGeneratorDebug = false;

const style: React.CSSProperties = NodeGeneratorDebug
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

export function NodesGenerator() {
  const layouts = useLayouts();
  const pages = useMemo(() => new LayoutPages(), []);

  return (
    <div style={style}>
      <SaveFinishedNodesToStore pages={pages} />
      <SetCurrentPage pages={pages} />
      <ExportStores />
      {NodeGeneratorDebug && <h1>Node generator</h1>}
      {layouts &&
        Object.keys(layouts).map((key) => {
          const layout = layouts[key];

          if (!layout) {
            return null;
          }

          return (
            <Page
              key={key}
              name={key}
              layout={layout}
              layoutSet={pages}
            />
          );
        })}
    </div>
  );
}

function SaveFinishedNodesToStore({ pages }: { pages: LayoutPages }) {
  const layouts = useLayouts();
  const existingNodes = useNodes();
  const setNodes = NodesInternal.useSetNodes();
  const isFinished = NodeStages.useIsFinished();
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
      console.log('debug, all ready. Nodes:');
      for (const page of Object.values(pages.all())) {
        console.log(`debug, --- page:`, page.pageKey);
        logNodes(page.children());
      }
      console.log('debug, nodes', pages);
    }
  }, [layoutKeys, pages, isFinished, setNodes, existingNodes]);

  return null;
}

function logNodes(nodes: LayoutNode[], prefix = '------') {
  for (const node of nodes) {
    console.log(`debug, ${prefix} node:`, node.getId());
    const children = node.children();
    if (children.length > 0) {
      logNodes(children, `${prefix}---`);
    }
  }
}

function SetCurrentPage({ pages }: { pages: LayoutPages }) {
  const currentView = useCurrentView();
  if (pages.currentPageKey() !== currentView) {
    pages.setCurrentPage(currentView);
  }

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

function Page({ layout, name, layoutSet }: PageProps) {
  const [children, setChildren] = useState<ChildrenState>({ forLayout: layout, map: undefined });
  const page = useMemo(() => new LayoutPage(), []);
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
  NodeStages.AddNodes.useEffect(
    () => () => {
      removePage(page.pageKey);
      page.unregisterCollection();
    },
    [page, removePage],
  );

  NodeStages.MarkHidden.useEffect(() => {
    setPageProp(name, 'hidden', hidden);
  }, [hidden, name, setPageProp]);

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
  const claimedChildren = new Set(map ? Object.values(map).flat() : []);
  const topLevelIds = layout.filter((component) => !claimedChildren.has(component.id)).map((component) => component.id);

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
      {map === undefined &&
        layout.map((component) => (
          <ComponentClaimChildren
            key={component.id}
            component={component}
            setChildren={setChildren}
            getProto={getProto}
          />
        ))}
      {NodeGeneratorDebug && <h2>Page: {name}</h2>}
      {map !== undefined && (
        <NodesGeneratorPageProvider
          parent={page}
          hidden={hidden}
          layoutMap={layoutMap}
          childrenMap={map}
        >
          <NodeChildren childIds={topLevelIds} />
        </NodesGeneratorPageProvider>
      )}
    </>
  );
}

interface NodeChildrenProps {
  childIds: string[];
}

export function NodeChildren({ childIds }: NodeChildrenProps) {
  const layoutMap = NodeGeneratorInternal.useLayoutMap();
  const map = NodeGeneratorInternal.useChildrenMap();

  return (
    <>
      {childIds.map((id) => (
        <Component
          key={id}
          baseId={id}
          childIds={map[id]}
          type={layoutMap[id].type}
        />
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
      {NodeGeneratorDebug && (
        <h3>
          {component.id} ({component.type})
        </h3>
      )}
      {NodeGeneratorDebug && <span>(first pass render)</span>}
    </>
  );
}

interface ComponentProps {
  baseId: string;
  type: CompTypes;
  childIds: string[] | undefined;
}

function Component({ baseId, type, childIds }: ComponentProps) {
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

    const out: BasicNodeGeneratorProps = {
      baseId,
    };

    return out;
  }, [childIds, baseId, def]);

  return (
    <>
      {NodeGeneratorDebug && (
        <h3>
          {baseId} ({type})
        </h3>
      )}
      {NodeGeneratorDebug && <span>{childIds ? `Children: ${childIds.join(', ')}` : 'No children'}</span>}
      <Generator {...(props as any)} />
    </>
  );
}
