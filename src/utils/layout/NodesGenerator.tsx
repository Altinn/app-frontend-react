import React, { useEffect, useMemo, useState } from 'react';

import { useHiddenLayoutsExpressions, useLayouts } from 'src/features/form/layout/LayoutsContext';
import { useCurrentView } from 'src/hooks/useNavigatePage';
import { getLayoutComponentObject } from 'src/layout';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { LayoutPages } from 'src/utils/layout/LayoutPages';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { CompExternal, ILayout } from 'src/layout/layout';
import type {
  BasicNodeGeneratorProps,
  ChildClaimerProps,
  ComponentProto,
  ContainerGeneratorProps,
} from 'src/layout/LayoutComponent';

const debug = false;
const style: React.CSSProperties = debug
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

interface ChildrenMap {
  [parentId: string]: string[];
}

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
      {debug && <h1>Node generator</h1>}
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
  const setNodes = NodesInternal.useSetNodes();
  const readyPages = NodesInternal.useReadyPages();
  const layoutKeys = useMemo(() => Object.keys(layouts), [layouts]);

  useEffect(() => {
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

    const ready = new Set(readyPages);
    const allReady = layoutKeys.every((key) => ready.has(key));
    if (allReady) {
      console.log('debug, settings final nodes, all pages ready', pages);
      setNodes(pages);
    }
  }, [layoutKeys, pages, readyPages, setNodes]);

  return null;
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
  const wasReady = NodesInternal.useIsPageReady(name);
  const markPageReady = NodesInternal.useMarkPageReady();
  const removePage = NodesInternal.useRemovePage();

  addPage(name);
  if (!page.isRegisteredInCollection(layoutSet)) {
    page.registerCollection(name, layoutSet);
  }

  // Removes the page from the store when is removed from the react tree
  useEffect(
    () => () => {
      removePage(page.pageKey);
      page.unregisterCollection();
    },
    [page, removePage],
  );

  const getProto = useMemo(() => {
    const proto: { [id: string]: ComponentProto } = {};

    for (const component of layout) {
      proto[component.id] = {
        type: component.type,
        def: getLayoutComponentObject(component.type),
      };
    }

    return (id: string) => proto[id];
  }, [layout]);

  const getItem = useMemo(() => {
    const item: { [id: string]: CompExternal } = {};

    for (const component of layout) {
      item[component.id] = component;
    }

    return (id: string) => item[id];
  }, [layout]);

  const map = children.map;
  const isReady = map !== undefined && children.forLayout === layout;
  const claimedChildren = new Set(map ? Object.values(map).flat() : []);

  useEffect(() => {
    if (!wasReady && isReady) {
      markPageReady(name);
    }
  }, [isReady, markPageReady, name, wasReady]);

  if (children.forLayout !== layout) {
    // Force a new first pass if the layout changes
    setChildren({ forLayout: layout, map: undefined });
    return null;
  }

  if (layout.length === 0) {
    if (!wasReady) {
      markPageReady(name);
    }
    return null;
  }

  return (
    <>
      <MaintainPageState name={name} />
      {debug && <h2>Page: {name}</h2>}
      {map === undefined &&
        layout.map((component) => (
          <ComponentClaimChildren
            key={component.id}
            component={component}
            setChildren={setChildren}
            getProto={getProto}
          />
        ))}
      {map !== undefined &&
        layout.map((component) => {
          if (claimedChildren.has(component.id)) {
            return null;
          }

          return (
            <Component
              key={component.id}
              component={component}
              childIds={map[component.id]}
              getItem={getItem}
              parent={page}
              path={[name, component.id]}
            />
          );
        })}
    </>
  );
}

interface MaintainPageStateProps {
  name: string;
}

function MaintainPageState(_props: MaintainPageStateProps) {
  // TODO: Implement evaluating expressions for hidden pages
  const _hiddenExpr = useHiddenLayoutsExpressions();

  return null;
}

interface ComponentClaimChildrenProps {
  component: CompExternal;
  setChildren: React.Dispatch<React.SetStateAction<ChildrenState>>;
  getProto: (id: string) => ComponentProto | undefined;
}

function ComponentClaimChildren({ component, setChildren, getProto }: ComponentClaimChildrenProps) {
  const def = getLayoutComponentObject(component.type);

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
      {debug && (
        <h3>
          {component.id} ({component.type})
        </h3>
      )}
      {debug && <span>(first pass render)</span>}
    </>
  );
}

interface ComponentProps {
  component: CompExternal;
  childIds: string[] | undefined;
  getItem: (id: string) => CompExternal;
  parent: LayoutPage;
  path: string[];
}

function Component({ component, childIds, getItem, parent, path }: ComponentProps) {
  const def = getLayoutComponentObject(component.type);
  const props = useMemo(() => {
    if (def instanceof ContainerComponent) {
      const out: ContainerGeneratorProps<any> = {
        item: component,
        parent,
        debug,
        path,
        childIds: childIds ?? [],
        getChild: (id: string) => {
          if (childIds?.includes(id)) {
            return getItem(id);
          }

          throw new Error(`Child '${id}' not claimed by component '${component.id}'`);
        },
      };
      return out;
    }

    const out: BasicNodeGeneratorProps<any> = {
      item: component,
      parent,
      debug,
      path,
    };

    return out;
  }, [childIds, component, def, getItem, parent, path]);

  return (
    <>
      {debug && (
        <h3>
          {component.id} ({component.type})
        </h3>
      )}
      {debug && <span>{childIds ? `Children: ${childIds.join(', ')}` : 'No children'}</span>}
      <Generator {...props} />
    </>
  );
}

function _Generator(props: any) {
  const def = getLayoutComponentObject(props.item.type);
  const InnerGenerator = def.renderNodeGenerator;

  return <InnerGenerator {...props} />;
}
const Generator = React.memo(_Generator);
