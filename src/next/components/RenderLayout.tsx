import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { RenderComponent } from 'src/next/components/RenderComponent';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

interface RenderLayoutType {
  components?: ResolvedCompExternal[];
  parentBinding?: string;
  itemIndex?: number;
}

interface VisibilityState {
  components: {
    [id: string]:
      | {
          height: number | undefined;
          isVisible: boolean;
        }
      | undefined;
  };
  setHeight: (id: string, height: number) => void;
  setVisible: (id: string, isVisible: boolean) => void;
}

const useVisibilityStore = create<VisibilityState>((set) => ({
  components: {},
  setHeight: (id, height) =>
    set((state) => ({
      components: {
        ...state.components,
        [id]: {
          isVisible: state.components[id]?.isVisible ?? false,
          ...state.components[id],
          height,
        },
      },
    })),
  setVisible: (id, isVisible) =>
    set((state) => ({
      components: {
        ...state.components,
        [id]: {
          height: state.components[id]?.height,
          ...state.components[id],
          isVisible,
        },
      },
    })),
}));

function useGlobalIntersectionObserver() {
  const setVisible = useVisibilityStore.getState().setVisible;
  const observer = useMemo(
    () =>
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target.id) {
            setVisible(entry.target.id, entry.isIntersecting);
          }
        });
      }),
    [setVisible],
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

  return observe;
}

const ObserverContext = createContext<ReturnType<typeof useGlobalIntersectionObserver> | undefined>(undefined);

export const RenderSubLayout: React.FunctionComponent<RenderLayoutType> = ({
  components,
  parentBinding,
  itemIndex,
}) => {
  const setHeight = useVisibilityStore.getState().setHeight;
  const frozenState = useVisibilityStore.getState();
  const observe = useContext(ObserverContext);
  const componentsWithIds = useMemo(
    () =>
      components?.map((component) => {
        const suffix = itemIndex !== undefined ? `[${itemIndex}]` : '';
        return { id: `item-${component.id}${suffix}`, component };
      }),
    [components, itemIndex],
  );

  const visibleIds = useVisibilityStore(
    useShallow((state) => {
      const visibleIds = new Set<string>();
      componentsWithIds?.forEach(({ id }) => {
        if (state.components[id]?.isVisible) {
          visibleIds.add(id);
        }
      });
      return visibleIds;
    }),
  );

  if (!components || !observe || !componentsWithIds) {
    return null;
  }

  return (
    <div>
      {componentsWithIds.map(({ id, component }) => {
        const childMapping = component.dataModelBindings ? component.dataModelBindings['simpleBinding'] : '';
        const childField = childMapping ? childMapping.replace(parentBinding, '') : undefined;
        const isVisible = visibleIds.has(id);
        const height = frozenState.components[id]?.height;

        return (
          <div
            key={id}
            id={id}
            ref={observe}
          >
            {isVisible && (
              <RenderComponent
                id={id}
                component={component}
                parentBinding={parentBinding}
                itemIndex={itemIndex}
                childField={childField}
                setHeight={setHeight}
              />
            )}
            {!isVisible && <div style={{ height: height ? `${height}px` : '100px' }}>Loading...</div>}
          </div>
        );
      })}
    </div>
  );
};

export const RenderMainLayout: React.FunctionComponent<RenderLayoutType> = ({ components }) => {
  const observe = useGlobalIntersectionObserver();

  return (
    <ObserverContext.Provider value={observe}>
      <RenderSubLayout components={components} />
    </ObserverContext.Provider>
  );
};
