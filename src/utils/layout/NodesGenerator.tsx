import React, { useEffect, useMemo, useState } from 'react';

import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { getLayoutComponentObject } from 'src/layout';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import type { CompExternal, ILayout } from 'src/layout/layout';
import type { ChildClaimerProps, ComponentProto } from 'src/layout/LayoutComponent';

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
            />
          );
        })}
    </div>
  );
}

function Page({ layout, name }: { layout: ILayout; name: string }) {
  const [children, setChildren] = useState<ChildrenState>({ forLayout: layout, map: undefined });

  useEffect(() => {
    if (children.forLayout !== layout) {
      // Force a new first pass if the layout changes
      setChildren({ forLayout: layout, map: undefined });
    }
  }, [layout, children.forLayout]);

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

  const map = children.map;
  const claimedChildren = new Set(map ? Object.values(map).flat() : []);

  return (
    <>
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
            />
          );
        })}
    </>
  );
}

function ComponentClaimChildren({
  component,
  setChildren,
  getProto,
}: {
  component: CompExternal;
  setChildren: React.Dispatch<React.SetStateAction<ChildrenState>>;
  getProto: (id: string) => ComponentProto | undefined;
}) {
  const def = getLayoutComponentObject(component.type);

  // The first render will be used to determine which components will be claimed as children by others (which will
  // prevent them from rendering on the top-level on the next render pass). We must always set a state here,
  // otherwise the page will not know if the first pass is done.
  useEffect(() => {
    if (def instanceof ContainerComponent) {
      const claimedChildren: string[] = [];
      const props: ChildClaimerProps<any> = {
        item: component,
        claimChild: (id) => claimedChildren.push(id),
        getProto,
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

function Component({ component, childIds }: { component: CompExternal; childIds: string[] | undefined }) {
  // const def = getLayoutComponentObject(component.type);

  return (
    <>
      {debug && (
        <h3>
          {component.id} ({component.type})
        </h3>
      )}
      {debug && <span>{childIds ? `Children: ${childIds.join(', ')}` : 'No children'}</span>}
      {debug && <pre style={{ fontSize: '0.8em' }}>{JSON.stringify(component, null, 2)}</pre>}
    </>
  );
}
