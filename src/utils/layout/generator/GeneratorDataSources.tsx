import { createHookContext } from 'src/core/contexts/hookContext';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useApplicationSettings } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { useExternalApis } from 'src/features/externalApi/useExternalApi';
import { useCurrentLayoutSet } from 'src/features/form/layoutSets/useCurrentLayoutSet';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxInstanceDataSources } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useInnerLanguageWithForcedNodeSelector } from 'src/features/language/useLanguage';
import { Validation } from 'src/features/validation/validationContext';
import { useShallowObjectMemo } from 'src/hooks/useShallowObjectMemo';
import { useCommitWhenFinished } from 'src/utils/layout/generator/CommitQueue';
import { Hidden, NodesInternal, useNodes } from 'src/utils/layout/NodesContext';
import { useInnerDataModelBindingTranspose } from 'src/utils/layout/useDataModelBindingTranspose';
import { useInnerNodeFormDataSelector } from 'src/utils/layout/useNodeItem';
import { useInnerNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { ExpressionDataSources } from 'src/utils/layout/useExpressionDataSources';

const { Provider, hooks } = createHookContext({
  useLaxInstanceDataSources: () => useLaxInstanceDataSources(),
  useCurrentLayoutSet: () => useCurrentLayoutSet(),
  useDefaultDataType: () => DataModels.useDefaultDataType(),
  useReadableDataTypes: () => DataModels.useReadableDataTypes(),
  useExternalApis: () => useExternalApis(useApplicationMetadata().externalApiIds ?? []),
  useNodes: () => useNodes(),
  useIsForcedVisibleByDevTools: () => {
    const devToolsIsOpen = useDevToolsStore((state) => state.isOpen);
    const devToolsHiddenComponents = useDevToolsStore((state) => state.hiddenComponents);
    return devToolsIsOpen && devToolsHiddenComponents !== 'hide';
  },

  useGetDataElementIdForDataType: () => DataModels.useGetDataElementIdForDataType(),
  useValidationsProcessedLast: () => Validation.useProcessedLast(),

  useCommitWhenFinished: () => useCommitWhenFinished(),
});

export const GeneratorData = {
  Provider,
  useExpressionDataSources,
  useDefaultDataType: hooks.useDefaultDataType,
  useIsForcedVisibleByDevTools: hooks.useIsForcedVisibleByDevTools,

  useGetDataElementIdForDataType: hooks.useGetDataElementIdForDataType,
  useValidationsProcessedLast: hooks.useValidationsProcessedLast,

  useCommitWhenFinished: hooks.useCommitWhenFinished,
};

function useExpressionDataSources(): ExpressionDataSources {
  const formDataSelector = FD.useDebouncedSelector();
  const formDataRowsSelector = FD.useDebouncedRowsSelector();
  const attachmentsSelector = NodesInternal.useAttachmentsSelector();
  const optionsSelector = NodesInternal.useNodeOptionsSelector();
  const nodeDataSelector = NodesInternal.useNodeDataSelector();

  const process = useLaxProcessData();
  const applicationSettings = useApplicationSettings();
  const currentLanguage = useCurrentLanguage();

  const instanceDataSources = hooks.useLaxInstanceDataSources();
  const currentLayoutSet = hooks.useCurrentLayoutSet() ?? null;
  const dataModelNames = hooks.useReadableDataTypes();
  const externalApis = hooks.useExternalApis();

  const isHiddenSelector = Hidden.useIsHiddenSelector();
  const nodeTraversal = useInnerNodeTraversalSelector(hooks.useNodes());
  const transposeSelector = useInnerDataModelBindingTranspose(nodeDataSelector);
  const nodeFormDataSelector = useInnerNodeFormDataSelector(nodeDataSelector, formDataSelector);
  const langToolsSelector = useInnerLanguageWithForcedNodeSelector(
    hooks.useDefaultDataType(),
    dataModelNames,
    formDataSelector,
    nodeDataSelector,
  );

  return useShallowObjectMemo({
    formDataSelector,
    formDataRowsSelector,
    attachmentsSelector,
    process,
    optionsSelector,
    applicationSettings,
    instanceDataSources,
    langToolsSelector,
    currentLanguage,
    isHiddenSelector,
    nodeFormDataSelector,
    nodeDataSelector,
    nodeTraversal,
    transposeSelector,
    currentLayoutSet,
    externalApis,
    dataModelNames,
  });
}
