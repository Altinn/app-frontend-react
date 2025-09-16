import { useCallback, useEffect, useState } from 'react';

import { useEngine } from 'libs/FormEngineReact/FormEngineProvider';
import type { ResolvedComponent } from 'libs/FormEngine/types';

/**
 * Hook for current page management
 */
export function useCurrentPage() {
  const engine = useEngine();
  const [currentPage, setCurrentPage] = useState(() => engine.layout.getCurrentPage());

  useEffect(() => {
    const unsubscribe = engine.subscribeToPageChanges((pageId) => {
      setCurrentPage(pageId);
    });

    return unsubscribe;
  }, [engine]);

  const navigateToPage = useCallback(
    (pageId: string) => {
      engine.navigateToPage(pageId);
    },
    [engine],
  );

  const navigateToNext = useCallback(() => engine.layout.navigateToNextPage(), [engine]);

  const navigateToPrevious = useCallback(() => engine.layout.navigateToPreviousPage(), [engine]);

  return {
    currentPage,
    navigateToPage,
    navigateToNext,
    navigateToPrevious,
  };
}

/**
 * Hook for page components
 */
export function usePageComponents(pageId?: string) {
  const engine = useEngine();
  const [components, setComponents] = useState<ResolvedComponent[]>(() => {
    if (pageId) {
      return engine.layout.getVisibleComponents(pageId);
    }
    return engine.layout.getCurrentPageComponents();
  });

  useEffect(() => {
    const updateComponents = () => {
      if (pageId) {
        setComponents(engine.layout.getVisibleComponents(pageId));
      } else {
        setComponents(engine.layout.getCurrentPageComponents());
      }
    };

    // Subscribe to layout changes
    const unsubscribeLayout = engine.layout.subscribe(updateComponents);

    // Subscribe to page changes if no specific page ID
    const unsubscribePage = pageId ? null : engine.subscribeToPageChanges(updateComponents);

    return () => {
      unsubscribeLayout();
      unsubscribePage?.();
    };
  }, [engine, pageId]);

  return components;
}

/**
 * Hook for page list
 */
export function usePageList() {
  const engine = useEngine();
  const [pageList, setPageList] = useState(() => engine.layout.getPageList());

  useEffect(() => {
    const unsubscribe = engine.layout.subscribe((_) => {
      setPageList(engine.layout.getPageList());
    });

    return unsubscribe;
  }, [engine]);

  return pageList;
}

/**
 * Hook for component visibility
 */
export function useComponentVisibility(componentId: string) {
  const engine = useEngine();
  const [isVisible, setIsVisible] = useState(() => engine.isComponentVisible(componentId));

  useEffect(() => {
    // Subscribe to data changes that might affect visibility
    const unsubscribeData = engine.subscribeToDataChanges(() => {
      setIsVisible(engine.isComponentVisible(componentId));
    });

    // Subscribe to layout changes
    const unsubscribeLayout = engine.layout.subscribe(() => {
      setIsVisible(engine.isComponentVisible(componentId));
    });

    return () => {
      unsubscribeData();
      unsubscribeLayout();
    };
  }, [engine, componentId]);

  return isVisible;
}

/**
 * Hook for component by ID
 */
export function useComponent(componentId: string) {
  const engine = useEngine();
  const [component, setComponent] = useState(() => engine.getComponent(componentId));

  useEffect(() => {
    const unsubscribe = engine.layout.subscribe(() => {
      setComponent(engine.getComponent(componentId));
    });

    return unsubscribe;
  }, [engine, componentId]);

  return component;
}
