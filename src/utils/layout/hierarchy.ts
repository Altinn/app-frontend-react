import { useMemo } from 'react';

import { createSelector } from 'reselect';

import { evalExprInObj, ExprConfigForComponent, ExprConfigForGroup } from 'src/features/expressions';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { staticUseLanguageFromState, useLanguage } from 'src/features/language/useLanguage';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useNavigationParams } from 'src/hooks/useNavigatePage';
import { getLayoutComponentObject } from 'src/layout';
import { buildAuthContext } from 'src/utils/authContext';
import { buildInstanceDataSources } from 'src/utils/instanceDataSources';
import { generateEntireHierarchy } from 'src/utils/layout/HierarchyGenerator';
import type { PageNavigationConfig } from 'src/features/expressions/ExprContext';
import type { CompInternal, HierarchyDataSources, ILayouts } from 'src/layout/layout';
import type { IRepeatingGroups, IRuntimeState } from 'src/types';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

/**
 * This will generate an entire layout hierarchy, iterate each
 * component/group in the layout and resolve all expressions for them.
 */
function resolvedNodesInLayouts(
  layouts: ILayouts | null,
  currentView: string | undefined,
  repeatingGroups: IRepeatingGroups | null,
  dataSources: HierarchyDataSources,
) {
  // A full copy is needed here because formLayout comes from the redux store, and in production code (not the
  // development server!) the properties are not mutable (but we have to mutate them below).
  const layoutsCopy: ILayouts = layouts ? structuredClone(layouts) : {};
  const unresolved = generateEntireHierarchy(
    layoutsCopy,
    currentView,
    repeatingGroups,
    dataSources,
    getLayoutComponentObject,
  );

  const config = {
    ...ExprConfigForComponent,
    ...ExprConfigForGroup,
  } as any;

  for (const layout of Object.values(unresolved.all())) {
    for (const node of layout.flat(true)) {
      const input = { ...node.item };
      delete input['children'];
      delete input['rows'];
      delete input['childComponents'];
      delete input['rowsAfter'];
      delete input['rowsBefore'];

      const resolvedItem = evalExprInObj({
        input,
        node,
        dataSources,
        config,
        resolvingPerRow: false,
      }) as unknown as CompInternal;

      if (node.isType('Group') && node.isRepGroup()) {
        for (const row of node.item.rows) {
          if (!row) {
            continue;
          }
          const first = row.items[0];
          if (!first) {
            continue;
          }
          const firstItemNode = unresolved.findById(first.item.id);
          if (firstItemNode) {
            row.groupExpressions = evalExprInObj({
              input,
              node: firstItemNode,
              dataSources,
              config,
              resolvingPerRow: true,
              deleteNonExpressions: true,
            }) as any;
          }
        }
      }

      for (const key of Object.keys(resolvedItem)) {
        // Mutates node.item directly - this also mutates references to it and makes sure
        // we resolve expressions deep inside recursive structures.
        node.item[key] = resolvedItem[key];
      }
    }
  }

  return unresolved as unknown as LayoutPages;
}

export const dataSourcesFromState =
  (currentView: string | null) =>
  (state: IRuntimeState): HierarchyDataSources => ({
    formData: state.formData.formData,
    attachments: state.deprecated.lastKnownAttachments || {},
    uiConfig: state.formLayout.uiConfig,
    pageNavigationConfig: { currentView },
    options: state.deprecated.allOptions || {},
    applicationSettings: state.applicationSettings.applicationSettings,
    instanceDataSources: buildInstanceDataSources(state.deprecated.lastKnownInstance),
    hiddenFields: new Set(state.formLayout.uiConfig.hiddenFields),
    authContext: buildAuthContext(state.deprecated.lastKnownProcess?.currentTask),
    devTools: state.devTools,
    langTools: staticUseLanguageFromState(state),
    currentLanguage: state.deprecated.currentLanguage,
  });

export const createSelectDataSourcesFromState = (currentView: string | null) =>
  createSelector(dataSourcesFromState(currentView), (data) => data);

function innerResolvedLayoutsFromState(
  layouts: ILayouts | null,
  currentView: string | undefined,
  repeatingGroups: IRepeatingGroups | null,
  dataSources: HierarchyDataSources,
): LayoutPages | undefined {
  if (!layouts || !repeatingGroups) {
    return undefined;
  }

  return resolvedNodesInLayouts(layouts, currentView, repeatingGroups, dataSources);
}

export const resolvedLayoutsFromState = (currentView: string) => (state: IRuntimeState) =>
  innerResolvedLayoutsFromState(
    state.formLayout.layouts,
    currentView,
    state.formLayout.uiConfig.repeatingGroups,
    dataSourcesFromState(currentView)(state),
  );

/**
 * This is a more efficient, memoized version of what happens above. This will only be used from ExprContext,
 * and trades verbosity and code duplication for performance and caching.
 */
function useResolvedExpressions() {
  const instance = useLaxInstanceData();
  const formData = useAppSelector((state) => state.formData.formData);
  const uiConfig = useAppSelector((state) => state.formLayout.uiConfig);
  const attachments = useAppSelector((state) => state.deprecated.lastKnownAttachments);
  const options = useAppSelector((state) => state.deprecated.allOptions);
  const process = useLaxProcessData();
  const applicationSettings = useAppSelector((state) => state.applicationSettings.applicationSettings);
  const hiddenFields = useAppSelector((state) => state.formLayout.uiConfig.hiddenFields);
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const { pageKey } = useNavigationParams();
  const currentView = pageKey;
  const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
  const devTools = useAppSelector((state) => state.devTools);
  const langTools = useLanguage();
  const currentLanguage = useCurrentLanguage();

  const pageNavigationConfig: PageNavigationConfig = useMemo(
    () => ({
      currentView: currentView ?? null,
    }),
    [currentView],
  );

  const dataSources: HierarchyDataSources = useMemo(
    () => ({
      formData,
      attachments: attachments || {},
      uiConfig,
      pageNavigationConfig,
      options: options || {},
      applicationSettings,
      instanceDataSources: buildInstanceDataSources(instance),
      authContext: buildAuthContext(process?.currentTask),
      hiddenFields: new Set(hiddenFields),
      devTools,
      langTools,
      currentLanguage,
    }),
    [
      formData,
      attachments,
      uiConfig,
      pageNavigationConfig,
      options,
      applicationSettings,
      instance,
      process?.currentTask,
      hiddenFields,
      devTools,
      langTools,
      currentLanguage,
    ],
  );

  return useMemo(
    () => innerResolvedLayoutsFromState(layouts, currentView, repeatingGroups, dataSources),
    [layouts, currentView, repeatingGroups, dataSources],
  );
}

/**
 * Selector for use in redux sagas. Will return a fully resolved layouts tree.
 * Specify manually that the returned value from this is `LayoutPages`
 */
export const ResolvedNodesSelector = (currentView: string) => (state: IRuntimeState) =>
  resolvedLayoutsFromState(currentView)(state);

/**
 * Exported only for testing. Please do not use!
 */
export const _private = {
  resolvedNodesInLayouts,
  useResolvedExpressions,
};
