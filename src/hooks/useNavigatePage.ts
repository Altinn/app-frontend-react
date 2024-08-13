import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useMatch, useNavigate as useRouterNavigate } from 'react-router-dom';
import type { NavigateOptions } from 'react-router-dom';

import { create } from 'zustand';

import { ContextNotProvided } from 'src/core/contexts/context';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import {
  useHiddenPages,
  useSetReturnToView,
  useSetSummaryNodeOfOrigin,
} from 'src/features/form/layout/PageNavigationContext';
import { useLaxLayoutSettings, usePageSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxProcessData, useTaskType } from 'src/features/instance/ProcessContext';
import { ProcessTaskType } from 'src/types';

type NavigateToPageOptions = {
  replace?: boolean;
  skipAutoSave?: boolean;
  shouldFocusComponent?: boolean;
  exitSubForm?: boolean;
};

export enum TaskKeys {
  ProcessEnd = 'ProcessEnd',
  CustomReceipt = 'CustomReceipt',
}

export enum SearchParams {
  FocusComponentId = 'focusComponentId',
}

export const useNavigationParams = () => {
  const queryKeys = useLocation().search ?? '';

  const matches = [
    useMatch('/instance/:partyId/:instanceGuid'),
    useMatch('/instance/:partyId/:instanceGuid/:taskId'),
    useMatch('/instance/:partyId/:instanceGuid/:taskId/:pageKey'),
    useMatch('/:pageKey'), // Stateless

    // Temporary: Sub-form routing (should be moved into the component/index.tsx)
    useMatch('/instance/:partyId/:instanceGuid/:taskId/:mainPageKey/:componentId'),
    useMatch('/instance/:partyId/:instanceGuid/:taskId/:mainPageKey/:componentId/:dataElementId'),
    useMatch('/instance/:partyId/:instanceGuid/:taskId/:mainPageKey/:componentId/:dataElementId/:pageKey'),
  ];

  const partyId = matches.reduce((acc, match) => acc ?? match?.params['partyId'], undefined);
  const instanceGuid = matches.reduce((acc, match) => acc ?? match?.params['instanceGuid'], undefined);
  const taskId = matches.reduce((acc, match) => acc ?? match?.params['taskId'], undefined);
  const componentId = matches.reduce((acc, match) => acc ?? match?.params['componentId'], undefined);
  const dataElementId = matches.reduce((acc, match) => acc ?? match?.params['dataElementId'], undefined);
  const _pageKey = matches.reduce((acc, match) => acc ?? match?.params['pageKey'], undefined);
  const _mainPageKey = matches.reduce((acc, match) => acc ?? match?.params['mainPageKey'], undefined);
  const pageKey = _pageKey === undefined ? undefined : decodeURIComponent(_pageKey);
  const mainPageKey = _mainPageKey === undefined ? undefined : decodeURIComponent(_mainPageKey);

  const isSubFormPage = !!mainPageKey;

  return {
    partyId,
    instanceGuid,
    taskId,
    pageKey,
    queryKeys,
    componentId,
    dataElementId,
    mainPageKey,
    isSubFormPage,
  };
};

const emptyArray: never[] = [];

/**
 * Navigation function for react-router-dom
 * Makes sure to clear returnToView and summaryNodeOfOrigin on navigation
 * Takes an optional callback
 */
const useNavigate = () => {
  const navigate = useRouterNavigate();
  const storeCallback = useNavigationEffectStore((state) => state.storeCallback);
  const setReturnToView = useSetReturnToView();
  const setSummaryNodeOfOrigin = useSetSummaryNodeOfOrigin();

  return useCallback(
    (path: string, options?: NavigateOptions, cb?: Callback) => {
      setReturnToView?.(undefined);
      setSummaryNodeOfOrigin?.(undefined);
      if (cb) {
        storeCallback(cb);
      }
      navigate(path, options);
    },
    [navigate, setReturnToView, storeCallback, setSummaryNodeOfOrigin],
  );
};

export const useCurrentView = () => useNavigationParams().pageKey;
export const useOrder = () => {
  const maybeLayoutSettings = useLaxLayoutSettings();
  const orderWithHidden = maybeLayoutSettings === ContextNotProvided ? emptyArray : maybeLayoutSettings.pages.order;
  const hiddenPages = useHiddenPages();
  return useMemo(() => orderWithHidden?.filter((page) => !hiddenPages.has(page)), [orderWithHidden, hiddenPages]);
};

export const useNavigatePage = () => {
  const isStatelessApp = useApplicationMetadata().isStatelessApp;
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const processTasks = useLaxProcessData()?.processTasks;
  const lastTaskId = processTasks?.slice(-1)[0]?.elementId;
  const navigate = useNavigate();

  const { partyId, instanceGuid, taskId, pageKey, queryKeys, componentId, dataElementId, mainPageKey, isSubFormPage } =
    useNavigationParams();
  const { autoSaveBehavior } = usePageSettings();

  const taskType = useTaskType(taskId);
  const order = useOrder();

  const currentPageId = pageKey ?? '';
  const currentPageIndex = order?.indexOf(currentPageId) ?? -1;
  const nextPageIndex = currentPageIndex !== -1 ? currentPageIndex + 1 : -1;
  const previousPageIndex = currentPageIndex !== -1 ? currentPageIndex - 1 : -1;

  const isValidPageId = useCallback(
    (_pageId: string) => {
      // The page ID may be URL encoded already, if we got this from react-router.
      const pageId = decodeURIComponent(_pageId);
      if (taskType !== ProcessTaskType.Data) {
        return false;
      }
      return order?.includes(pageId) ?? false;
    },
    [order, taskType],
  );

  /**
   * For stateless apps, this is how we redirect to the
   * initial page of the app. We replace the url, to not
   * have the initial page (i.e. the page without a
   * pageKey) in the history.
   */
  useEffect(() => {
    if (isStatelessApp && order?.[0] !== undefined && (!currentPageId || !isValidPageId(currentPageId))) {
      navigate(`/${order?.[0]}${queryKeys}`, { replace: true });
    }
  }, [isStatelessApp, order, navigate, currentPageId, isValidPageId, queryKeys]);

  const requestManualSave = FD.useRequestManualSave();
  const maybeSaveOnPageChange = useCallback(() => {
    if (autoSaveBehavior === 'onChangePage') {
      requestManualSave();
    }
  }, [autoSaveBehavior, requestManualSave]);

  const navigateToPage = useCallback(
    async (page?: string, options?: NavigateToPageOptions) => {
      const replace = options?.replace ?? false;
      if (!page) {
        window.logWarn('navigateToPage called without page');
        return;
      }
      if (!order.includes(page) && options?.exitSubForm !== true) {
        window.logWarn('navigateToPage called with invalid page:', `"${page}"`);
        return;
      }

      if (options?.skipAutoSave !== true) {
        maybeSaveOnPageChange();
      }

      if (isStatelessApp) {
        return navigate(`/${page}${queryKeys}`, { replace }, () => focusMainContent(options));
      }

      // Subform
      if (mainPageKey && componentId && dataElementId && options?.exitSubForm !== true) {
        const url = `/instance/${partyId}/${instanceGuid}/${taskId}/${mainPageKey}/${componentId}/${dataElementId}/${page}/${queryKeys}`;
        return navigate(url, { replace }, () => focusMainContent(options));
      }

      const url = `/instance/${partyId}/${instanceGuid}/${taskId}/${page}${queryKeys}`;
      navigate(url, { replace }, () => focusMainContent(options));
    },
    [
      componentId,
      dataElementId,
      instanceGuid,
      isStatelessApp,
      mainPageKey,
      maybeSaveOnPageChange,
      navigate,
      order,
      partyId,
      queryKeys,
      taskId,
    ],
  );

  const navigateToTask = useCallback(
    (newTaskId?: string, options?: NavigateOptions & { runEffect?: boolean }) => {
      const { runEffect = true } = options ?? {};
      if (newTaskId === taskId) {
        return;
      }
      const url = `/instance/${partyId}/${instanceGuid}/${newTaskId ?? lastTaskId}${queryKeys}`;
      navigate(url, options, runEffect ? () => focusMainContent(options) : undefined);
    },
    [taskId, partyId, instanceGuid, lastTaskId, queryKeys, navigate],
  );

  const isCurrentTask = useMemo(() => {
    if (currentTaskId === undefined && taskId === TaskKeys.CustomReceipt) {
      return true;
    }
    return currentTaskId === taskId;
  }, [currentTaskId, taskId]);

  const startUrl = useMemo(() => {
    if (taskType === ProcessTaskType.Archived) {
      return `/instance/${partyId}/${instanceGuid}/${TaskKeys.ProcessEnd}`;
    }
    if (taskType !== ProcessTaskType.Data && taskId !== undefined) {
      return `/instance/${partyId}/${instanceGuid}/${taskId}`;
    }
    const firstPage = order?.[0];
    if (taskId && firstPage) {
      return `/instance/${partyId}/${instanceGuid}/${taskId}/${firstPage}`;
    }
    if (taskId) {
      return `/instance/${partyId}/${instanceGuid}/${taskId}`;
    }
    return `/instance/${partyId}/${instanceGuid}`;
  }, [partyId, instanceGuid, taskId, order, taskType]);

  const next = order?.[nextPageIndex];
  const previous = order?.[previousPageIndex];

  const isValidTaskId = useCallback(
    (taskId?: string) => {
      if (!taskId) {
        return false;
      }
      if (taskId === TaskKeys.ProcessEnd) {
        return true;
      }
      if (taskId === TaskKeys.CustomReceipt) {
        return true;
      }
      return processTasks?.find((task) => task.elementId === taskId) !== undefined;
    },
    [processTasks],
  );

  const trimSingleTrailingSlash = (str: string) => (str.endsWith('/') ? str.slice(0, -1) : str);

  const getCurrentPageIndex = () => {
    const location = trimSingleTrailingSlash(window.location.href);
    const _currentPageId = location.split('/').slice(-1)[0];
    return order?.indexOf(_currentPageId) ?? undefined;
  };

  const getNextPage = () => {
    const currentPageIndex = getCurrentPageIndex();
    const nextPageIndex = currentPageIndex !== undefined ? currentPageIndex + 1 : undefined;

    if (nextPageIndex === undefined) {
      return undefined;
    }
    return order?.[nextPageIndex];
  };

  const getPreviousPage = () => {
    const currentPageIndex = getCurrentPageIndex();
    const nextPageIndex = currentPageIndex !== undefined ? currentPageIndex - 1 : undefined;

    if (nextPageIndex === undefined) {
      return undefined;
    }
    return order?.[nextPageIndex];
  };

  /**
   * This function fetch the next page index on function
   * invocation and then navigates to the next page. This is
   * to be able to chain multiple ClientActions together.
   */
  const navigateToNextPage = () => {
    const nextPage = getNextPage();
    if (!nextPage) {
      window.logWarn('Tried to navigate to next page when standing on the last page.');
      return;
    }
    navigateToPage(nextPage);
  };
  /**
   * This function fetches the previous page index on
   * function invocation and then navigates to the previous
   * page. This is to be able to chain multiple ClientActions
   * together.
   */
  const navigateToPreviousPage = () => {
    const previousPage = getPreviousPage();

    if (!previousPage) {
      window.logWarn('Tried to navigate to previous page when standing on the first page.');
      return;
    }
    navigateToPage(previousPage);
  };

  // TODO: Focus on sub-form table component?
  const exitSubForm = () => {
    if (!isSubFormPage || !mainPageKey) {
      window.logWarn('Tried to close sub-form page while not in a sub-form.');
      return;
    }
    navigateToPage(mainPageKey, { exitSubForm: true });
  };

  return {
    navigateToPage,
    navigateToTask,
    isCurrentTask,
    isValidPageId,
    isValidTaskId,
    startUrl,
    order,
    next,
    queryKeys,
    partyId,
    instanceGuid,
    currentPageId,
    taskId,
    previous,
    navigateToNextPage,
    navigateToPreviousPage,
    maybeSaveOnPageChange,
    exitSubForm,
  };
};

export function focusMainContent(options?: NavigateToPageOptions) {
  if (options?.shouldFocusComponent !== true) {
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }
}

type Callback = () => void;
type NavigationEffectStore = {
  callback: Callback | null;
  storeCallback: (cb: Callback | null) => void;
};

export const useNavigationEffectStore = create<NavigationEffectStore>((set) => ({
  callback: null,
  storeCallback: (cb: Callback) => set({ callback: cb }),
}));
