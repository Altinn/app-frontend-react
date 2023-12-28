import { useMemo } from 'react';

import { createSelector } from 'reselect';

import { useApplicationSettings } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { useAttachments } from 'src/features/attachments/AttachmentsContext';
import { evalExprInObj, ExprConfigForComponent, ExprConfigForGroup } from 'src/features/expressions';
import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { usePageNavigationConfig } from 'src/features/form/layout/PageNavigationContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { staticUseLanguageFromState, useLanguage } from 'src/features/language/useLanguage';
import { useAllOptions } from 'src/features/options/useAllOptions';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useCurrentView } from 'src/hooks/useNavigatePage';
import { getLayoutComponentObject } from 'src/layout';
import { buildAuthContext } from 'src/utils/authContext';
import { convertDataBindingToModel } from 'src/utils/databindings';
import { buildInstanceDataSources } from 'src/utils/instanceDataSources';
import { generateEntireHierarchy } from 'src/utils/layout/HierarchyGenerator';
import type { PageNavigationConfig } from 'src/features/expressions/ExprContext';
import type { CompInternal, HierarchyDataSources, ILayouts } from 'src/layout/layout';
import type { IRuntimeState } from 'src/types';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

/**
 * This will generate an entire layout hierarchy, iterate each
 * component/group in the layout and resolve all expressions for them.
 */
function resolvedNodesInLayouts(
  layouts: ILayouts | null,
  currentView: string | undefined,
  dataSources: HierarchyDataSources,
) {
  // A full copy is needed here because formLayout comes from the redux store, and in production code (not the
  // development server!) the properties are not mutable (but we have to mutate them below).
  const layoutsCopy: ILayouts = layouts ? structuredClone(layouts) : {};
  const unresolved = generateEntireHierarchy(layoutsCopy, currentView, dataSources, getLayoutComponentObject);

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
  (pageNavigationConfig: PageNavigationConfig) =>
  (state: IRuntimeState): HierarchyDataSources => ({
    formData: convertDataBindingToModel(state.deprecated.formData),
    attachments: state.deprecated.lastKnownAttachments || {},
    uiConfig: state.formLayout.uiConfig,
    pageNavigationConfig,
    options: state.deprecated.allOptions || {},
    applicationSettings: state.applicationSettings.applicationSettings,
    instanceDataSources: buildInstanceDataSources(state.deprecated.lastKnownInstance),
    hiddenFields: new Set(state.formLayout.uiConfig.hiddenFields),
    authContext: buildAuthContext(state.deprecated.lastKnownProcess?.currentTask),
    devTools: state.devTools,
    langTools: staticUseLanguageFromState(state),
    currentLanguage: state.deprecated.currentLanguage,
  });

export const createSelectDataSourcesFromState = (pageNavigationConfig: PageNavigationConfig) =>
  createSelector(dataSourcesFromState(pageNavigationConfig), (data) => data);

function innerResolvedLayoutsFromState(
  layouts: ILayouts | null,
  currentView: string | undefined,
  dataSources: HierarchyDataSources,
): LayoutPages | undefined {
  if (!layouts) {
    return undefined;
  }

  return resolvedNodesInLayouts(layouts, currentView, dataSources);
}

/**
 * This is a more efficient, memoized version of what happens above. This will only be used from ExprContext,
 * and trades verbosity and code duplication for performance and caching.
 */
function useResolvedExpressions() {
  const instance = useLaxInstanceData();
  const formData = FD.useDebounced();
  const uiConfig = useAppSelector((state) => state.formLayout.uiConfig);
  const attachments = useAttachments();
  const options = useAllOptions();
  const process = useLaxProcessData();
  const applicationSettings = useApplicationSettings();
  const hiddenFields = useAppSelector((state) => state.formLayout.uiConfig.hiddenFields);
  const layouts = useLayouts();
  const currentView = useCurrentView();
  const devTools = useAppSelector((state) => state.devTools);
  const langTools = useLanguage();
  const currentLanguage = useCurrentLanguage();
  const pageNavigationConfig = usePageNavigationConfig();

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
    () => innerResolvedLayoutsFromState(layouts, currentView, dataSources),
    [layouts, currentView, dataSources],
  );
}

/**
 * Exported only for testing. Please do not use!
 */
export const _private = {
  resolvedNodesInLayouts,
  useResolvedExpressions,
};
