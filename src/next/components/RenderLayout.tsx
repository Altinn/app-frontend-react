import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { RenderComponent } from 'src/next/components/RenderComponent';
import type { ResolvedCompExternal } from 'src/next/stores/megaStore';

interface RenderLayoutType {
  components?: ResolvedCompExternal[];
  parentBinding?: string;
  itemIndex?: number;
}

interface IntersectionOptions {
  once?: boolean; // if you only want to fire once
}

function useGlobalIntersectionObserver(options: IntersectionOptions = {}) {
  const { once, ...observerOptions } = options;
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  const observer = useMemo(
    () =>
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const elementId = entry.target.id;
          if (entry.isIntersecting && elementId) {
            setVisibleIds((prev) => {
              // If we only want to fire once, keep the ID in our set
              const next = new Set(prev).add(elementId);
              return next;
            });
            if (once) {
              // Stop observing if we only need it once
              observer.unobserve(entry.target);
            }
          }
        });
      }, observerOptions),
    [],
  );

  // The "ref callback" for each item to mount/unmount in the observer
  const observe = useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        observer.observe(node);
      }
    },
    [observer],
  );

  // Cleanup
  useEffect(() => () => observer.disconnect(), [observer]);

  return { observe, visibleIds };
}

export const RenderLayout: React.FunctionComponent<RenderLayoutType> = ({ components, parentBinding, itemIndex }) => {
  const { observe, visibleIds } = useGlobalIntersectionObserver({ once: true });

  if (!components || !observe || !components) {
    return null;
  }

  return (
    <div>
      {components.map((currentComponent) => {
        const childMapping = currentComponent.dataModelBindings
          ? currentComponent.dataModelBindings['simpleBinding']
          : '';
        const childField = childMapping ? childMapping.replace(parentBinding, '') : undefined;
        const id = `item-${currentComponent.id}`;
        const isVisible = visibleIds.has(id);

        return (
          <div
            key={id}
            id={id}
            ref={observe}
          >
            {isVisible && (
              <RenderComponent
                component={currentComponent}
                parentBinding={parentBinding}
                itemIndex={itemIndex}
                childField={childField}
              />
            )}
            {!isVisible && <div>Loading...</div>}
          </div>
        );
      })}
    </div>
  );
};
