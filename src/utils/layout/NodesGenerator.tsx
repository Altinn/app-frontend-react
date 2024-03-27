import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { useStore } from 'zustand';

import { useHiddenLayoutsExpressions, useLayouts } from 'src/features/form/layout/LayoutsContext';
import { useCurrentView } from 'src/hooks/useNavigatePage';
import { getLayoutComponentObject } from 'src/layout';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { LayoutPages } from 'src/utils/layout/LayoutPages';
import type { CompExternal, ILayout } from 'src/layout/layout';
import type {
  BasicNodeGeneratorProps,
  ChildClaimerProps,
  ComponentProto,
  ContainerGeneratorProps,
} from 'src/layout/LayoutComponent';
import type { NodesDataStore, NodesStore } from 'src/utils/layout/NodesContext';

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

interface NodesGeneratorProps {
  nodesStore: NodesStore;
  dataStore: NodesDataStore;
}

export function NodesGenerator({ nodesStore, dataStore }: NodesGeneratorProps) {
  const layouts = useLayouts();
  const layoutSet = useMemo(() => new LayoutPages(), []);
  const currentView = useCurrentView();
  const setNodes = useStore(nodesStore, (state) => state.setNodes);

  useLayoutEffect(() => {
    if (layoutSet && layoutSet.isReady()) {
      setNodes(layoutSet);
    }
  }, [layoutSet, setNodes]);

  useEffect(() => {
    layoutSet.setCurrentPage(currentView);
  }, [currentView, layoutSet]);

  useEffect(() => {
    window.CypressState = window.CypressState || {};
    window.CypressState.nodesStore = nodesStore;
    window.CypressState.nodesDataStore = dataStore;
  }, [nodesStore, dataStore]);

  return (
    <div style={style}>
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
              layoutSet={layoutSet}
              store={dataStore}
            />
          );
        })}
    </div>
  );
}

interface PageProps {
  layout: ILayout;
  name: string;
  layoutSet: LayoutPages;
  store: NodesDataStore;
}

function Page({ layout, name, layoutSet, store }: PageProps) {
  const [children, setChildren] = useState<ChildrenState>({ forLayout: layout, map: undefined });
  const page = useMemo(() => new LayoutPage(), []);
  const addPage = useStore(store, (state) => state.addPage);
  const removePage = useStore(store, (state) => state.removePage);

  useEffect(() => {
    page.registerCollection(name, layoutSet);
  }, [layoutSet, name, page]);

  useEffect(() => {
    if (children.forLayout !== layout) {
      // Force a new first pass if the layout changes
      setChildren({ forLayout: layout, map: undefined });
    }
  }, [layout, children.forLayout]);

  useEffect(() => {
    addPage(name);
    return () => removePage(name);
  }, [addPage, name, removePage]);

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
  const claimedChildren = new Set(map ? Object.values(map).flat() : []);

  return (
    <>
      <MaintainPageState
        name={name}
        store={store}
      />
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
              store={store}
              path={[name, component.id]}
            />
          );
        })}
    </>
  );
}

interface MaintainPageStateProps {
  name: string;
  store: NodesDataStore;
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
  store: NodesDataStore;
  path: string[];
}

function Component({ component, childIds, getItem, parent, store, path }: ComponentProps) {
  const def = getLayoutComponentObject(component.type);
  const props = useMemo(() => {
    if (def instanceof ContainerComponent) {
      const out: ContainerGeneratorProps<any> = {
        item: component,
        parent,
        debug,
        store,
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
      store,
      path,
    };

    return out;
  }, [childIds, component, def, getItem, parent, path, store]);

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
