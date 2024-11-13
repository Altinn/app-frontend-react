import { createHookContext } from 'src/core/contexts/hookContext';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useApplicationSettings } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { useExternalApis } from 'src/features/externalApi/useExternalApi';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useCurrentLayoutSet } from 'src/features/form/layoutSets/useCurrentLayoutSet';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxDataElementsSelectorProto, useLaxInstanceDataSources } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useInnerLanguageWithForcedNodeSelector } from 'src/features/language/useLanguage';
import { Validation } from 'src/features/validation/validationContext';
import { useMultipleDelayedSelectors } from 'src/hooks/delayedSelectors';
import { useShallowObjectMemo } from 'src/hooks/useShallowObjectMemo';
import { useCommitWhenFinished } from 'src/utils/layout/generator/CommitQueue';
import { Hidden, NodesInternal, useNodes } from 'src/utils/layout/NodesContext';
import { useInnerDataModelBindingTranspose } from 'src/utils/layout/useDataModelBindingTranspose';
import { useInnerNodeFormDataSelector } from 'src/utils/layout/useNodeItem';
import { useInnerNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { ValidationDataSources } from 'src/features/validation';
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
  useValidationDataSources,
  useDefaultDataType: hooks.useDefaultDataType,
  useIsForcedVisibleByDevTools: hooks.useIsForcedVisibleByDevTools,

  useGetDataElementIdForDataType: hooks.useGetDataElementIdForDataType,
  useValidationsProcessedLast: hooks.useValidationsProcessedLast,

  useCommitWhenFinished: hooks.useCommitWhenFinished,
};

function useExpressionDataSources(): ExpressionDataSources {
  const selectors = useMultipleDelayedSelectors({
    formDataSelector: FD.useDebouncedSelectorProto(),
    formDataRowsSelector: FD.useDebouncedRowsSelectorProto(),
    attachmentsSelector: NodesInternal.useAttachmentsSelectorProto(),
    optionsSelector: NodesInternal.useNodeOptionsSelectorProto(),
    nodeDataSelector: NodesInternal.useNodeDataSelectorProto(),
  });

  const process = useLaxProcessData();
  const applicationSettings = useApplicationSettings();
  const currentLanguage = useCurrentLanguage();

  const instanceDataSources = hooks.useLaxInstanceDataSources();
  const currentLayoutSet = hooks.useCurrentLayoutSet() ?? null;
  const dataModelNames = hooks.useReadableDataTypes();
  const externalApis = hooks.useExternalApis();

  const isHiddenSelector = Hidden.useIsHiddenSelector();
  const nodeTraversal = useInnerNodeTraversalSelector(hooks.useNodes());
  const transposeSelector = useInnerDataModelBindingTranspose(selectors.nodeDataSelector);
  const nodeFormDataSelector = useInnerNodeFormDataSelector(selectors.nodeDataSelector, selectors.formDataSelector);
  const langToolsSelector = useInnerLanguageWithForcedNodeSelector(
    hooks.useDefaultDataType(),
    dataModelNames,
    selectors.formDataSelector,
    selectors.nodeDataSelector,
  );

  return useShallowObjectMemo({
    formDataSelector: selectors.formDataSelector,
    formDataRowsSelector: selectors.formDataRowsSelector,
    attachmentsSelector: selectors.attachmentsSelector,
    optionsSelector: selectors.optionsSelector,
    nodeDataSelector: selectors.nodeDataSelector,
    process,
    applicationSettings,
    instanceDataSources,
    langToolsSelector,
    currentLanguage,
    isHiddenSelector,
    nodeFormDataSelector,
    nodeTraversal,
    transposeSelector,
    currentLayoutSet,
    externalApis,
    dataModelNames,
  }) as ExpressionDataSources;
}

function useValidationDataSources(): ValidationDataSources {
  const selectors = useMultipleDelayedSelectors({
    formDataSelector: FD.useDebouncedSelectorProto(),
    invalidDataSelector: FD.useInvalidDebouncedSelectorProto(),
    attachmentsSelector: NodesInternal.useAttachmentsSelectorProto(),
    nodeDataSelector: NodesInternal.useNodeDataSelectorProto(),
    dataElementsSelector: useLaxDataElementsSelectorProto(),
    dataElementHasErrorsSelector: Validation.useDataElementHasErrorsSelectorProto(),
  });

  const currentLanguage = useCurrentLanguage();
  const applicationMetadata = useApplicationMetadata();
  const layoutSets = useLayoutSets();

  return useShallowObjectMemo({
    formDataSelector: selectors.formDataSelector,
    invalidDataSelector: selectors.invalidDataSelector,
    attachmentsSelector: selectors.attachmentsSelector,
    nodeDataSelector: selectors.nodeDataSelector,
    dataElementsSelector: selectors.dataElementsSelector,
    dataElementHasErrorsSelector: selectors.dataElementHasErrorsSelector,
    currentLanguage,
    applicationMetadata,
    layoutSets,
  }) as ValidationDataSources;
}
