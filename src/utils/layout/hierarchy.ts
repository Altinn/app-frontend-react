import { useMemo } from 'react';

import { useApplicationSettings } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { useAttachments } from 'src/features/attachments/AttachmentsContext';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxInstanceDataSources } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useLangToolsRef } from 'src/features/language/LangToolsStore';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useNodeOptionsSelector } from 'src/features/options/useNodeOptions';
import { getComponentDef } from 'src/layout';
import { buildAuthContext } from 'src/utils/authContext';
import { generateEntireHierarchy } from 'src/utils/layout/HierarchyGenerator';
import { Hidden } from 'src/utils/layout/NodesContext';
import { useNodeDataSelector } from 'src/utils/layout/useNodeItem';
import type { HierarchyDataSources, ILayouts } from 'src/layout/layout';
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
  const unresolved = generateEntireHierarchy(layoutsCopy, currentView, dataSources, getComponentDef);
  return unresolved as unknown as LayoutPages;
}

const emptyObject = {};
export function useExpressionDataSources(): HierarchyDataSources {
  const instanceDataSources = useLaxInstanceDataSources();
  const formDataSelector = FD.useDebouncedSelector();
  const layoutSettings = useLayoutSettings();
  const attachments = useAttachments();
  const optionsSelector = useNodeOptionsSelector();
  const process = useLaxProcessData();
  const applicationSettings = useApplicationSettings();
  const devToolsIsOpen = useDevToolsStore((state) => state.isOpen);
  const devToolsHiddenComponents = useDevToolsStore((state) => state.hiddenComponents);
  const langToolsRef = useLangToolsRef();
  const currentLanguage = useCurrentLanguage();
  const authContext = useMemo(() => buildAuthContext(process?.currentTask), [process?.currentTask]);
  const isHiddenSelector = Hidden.useIsHiddenSelector();
  const nodeDataSelector = useNodeDataSelector();

  return useMemo(
    () => ({
      formDataSelector,
      attachments: attachments || emptyObject,
      layoutSettings,
      process,
      optionsSelector,
      applicationSettings,
      instanceDataSources,
      authContext,
      devToolsIsOpen,
      devToolsHiddenComponents,
      langToolsRef,
      currentLanguage,
      isHiddenSelector,
      nodeDataSelector,
    }),
    [
      formDataSelector,
      attachments,
      layoutSettings,
      optionsSelector,
      process,
      applicationSettings,
      instanceDataSources,
      authContext,
      devToolsIsOpen,
      devToolsHiddenComponents,
      langToolsRef,
      currentLanguage,
      isHiddenSelector,
      nodeDataSelector,
    ],
  );
}

/**
 * Exported only for testing. Please do not use!
 */
export const _private = {
  resolvedNodesInLayouts,
};
