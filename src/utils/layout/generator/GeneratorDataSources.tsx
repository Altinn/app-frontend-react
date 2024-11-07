import { useMemo } from 'react';

import { createHookContext } from 'src/core/contexts/hookContext';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useApplicationSettings } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { useAttachmentsSelector } from 'src/features/attachments/hooks';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useExternalApis } from 'src/features/externalApi/useExternalApi';
import { useCurrentLayoutSet } from 'src/features/form/layoutSets/useCurrentLayoutSet';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxInstanceDataSources } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useInnerLanguageWithForcedNodeSelector } from 'src/features/language/useLanguage';
import { useNodeOptionsSelector } from 'src/features/options/useNodeOptions';
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
  useIsForcedVisibleByDevTools: () => Hidden.useIsForcedVisibleByDevTools(),
});

export const GeneratorData = {
  Provider,
  useExpressionDataSources,
};

function useExpressionDataSources(): ExpressionDataSources {
  const formDataSelector = FD.useDebouncedSelector();
  const formDataRowsSelector = FD.useDebouncedRowsSelector();
  const attachmentsSelector = useAttachmentsSelector();
  const optionsSelector = useNodeOptionsSelector();
  const nodeDataSelector = NodesInternal.useNodeDataSelector();

  const process = useLaxProcessData();
  const applicationSettings = useApplicationSettings();
  const currentLanguage = useCurrentLanguage();

  const instanceDataSources = hooks.useLaxInstanceDataSources();
  const currentLayoutSet = hooks.useCurrentLayoutSet() ?? null;
  const dataModelNames = hooks.useReadableDataTypes();
  const externalApis = hooks.useExternalApis();

  const isHiddenSelector = Hidden.useInnerIsHiddenSelector(hooks.useIsForcedVisibleByDevTools());
  const nodeTraversal = useInnerNodeTraversalSelector(hooks.useNodes());
  const transposeSelector = useInnerDataModelBindingTranspose(nodeDataSelector);
  const nodeFormDataSelector = useInnerNodeFormDataSelector(nodeDataSelector, formDataSelector);
  const langToolsSelector = useInnerLanguageWithForcedNodeSelector(
    hooks.useDefaultDataType(),
    dataModelNames,
    formDataSelector,
    nodeDataSelector,
  );

  return useMemo(
    () => ({
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
    }),
    [
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
    ],
  );
}
