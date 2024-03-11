import { useMemo, useRef } from 'react';

import { useApplicationSettings } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { useAttachments } from 'src/features/attachments/AttachmentsContext';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { evalExprInObj, ExprConfigForComponent, ExprConfigForGroup } from 'src/features/expressions';
import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { usePageNavigationConfig } from 'src/features/form/layout/PageNavigationContext';
import { useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxInstanceDataSources } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useLangToolsRef } from 'src/features/language/LangToolsStore';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useAllOptionsSelector } from 'src/features/options/useAllOptions';
import { useCurrentView } from 'src/hooks/useNavigatePage';
import { getLayoutComponentObject } from 'src/layout';
import { buildAuthContext } from 'src/utils/authContext';
import { generateEntireHierarchy } from 'src/utils/layout/HierarchyGenerator';
import { useIsHiddenComponent } from 'src/utils/layout/NodesContext';
import type { CompInternal, HierarchyDataSources, ILayouts } from 'src/layout/layout';
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
    for (const node of layout.flat()) {
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

      if (node.item.type === 'RepeatingGroup') {
        for (const row of node.item.rows) {
          if (!row) {
            continue;
          }
          const first = row.items[0];
          if (!first) {
            continue;
          }
          const firstItemNode = unresolved.findById(first.getId());
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

const emptyObject = {};
export function useExpressionDataSources(): HierarchyDataSources {
  const instanceDataSources = useLaxInstanceDataSources();
  const formDataSelector = FD.useDebouncedSelector();
  const layoutSettings = useLayoutSettings();
  const attachments = useAttachments();
  const options = useAllOptionsSelector(true);
  const process = useLaxProcessData();
  const applicationSettings = useApplicationSettings();
  const devToolsIsOpen = useDevToolsStore((state) => state.isOpen);
  const devToolsHiddenComponents = useDevToolsStore((state) => state.hiddenComponents);
  const langToolsRef = useLangToolsRef();
  const currentLanguage = useCurrentLanguage();
  const pageNavigationConfig = usePageNavigationConfig();
  const authContext = useMemo(() => buildAuthContext(process?.currentTask), [process?.currentTask]);
  const isHidden = useIsHiddenComponent();

  return useMemo(
    () => ({
      formDataSelector,
      attachments: attachments || emptyObject,
      layoutSettings,
      pageNavigationConfig,
      options: options || emptyObject,
      applicationSettings,
      instanceDataSources,
      authContext,
      isHidden,
      devToolsIsOpen,
      devToolsHiddenComponents,
      langToolsRef,
      currentLanguage,
    }),
    [
      formDataSelector,
      attachments,
      layoutSettings,
      pageNavigationConfig,
      options,
      applicationSettings,
      instanceDataSources,
      authContext,
      isHidden,
      devToolsIsOpen,
      devToolsHiddenComponents,
      langToolsRef,
      currentLanguage,
    ],
  );
}

function useResolvedExpressions() {
  const layouts = useLayouts();
  const currentView = useCurrentView();
  const dataSources = useExpressionDataSources();
  const previousNodesRef = useRef<LayoutPages>();
  const nodes = useMemo(
    () => resolvedNodesInLayouts(layouts, currentView, dataSources),
    [layouts, currentView, dataSources],
  );
  previousNodesRef.current = nodes;

  return nodes;
}

/**
 * Exported only for testing. Please do not use!
 */
export const _private = {
  resolvedNodesInLayouts,
  useResolvedExpressions,
};
