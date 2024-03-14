import React from 'react';

import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { getLayoutComponentObject } from 'src/layout';
import type { CompExternal, ILayout } from 'src/layout/layout';

export function NodesGenerator() {
  const layouts = useLayouts();

  return (
    <div style={{ display: 'none' }}>
      {layouts &&
        Object.keys(layouts).map((key) => {
          const layout = layouts[key];

          if (!layout) {
            return null;
          }

          return (
            <Page
              key={key}
              layout={layout}
            />
          );
        })}
    </div>
  );
}

function Page({ layout }: { layout: ILayout }) {
  return (
    <>
      {layout.map((component) => (
        <Component
          key={component.id}
          component={component}
        />
      ))}
    </>
  );
}

function Component({ component }: { component: CompExternal }) {
  const def = getLayoutComponentObject(component.type);

  // The first render will be used to determine which components will be claimed as children by others (which will
  // prevent them from rendering on the top-level on the next render pass).

  // TODO: Implement
  return null;
}
