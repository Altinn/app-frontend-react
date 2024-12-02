import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useApplicationSettings } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useExternalApis } from 'src/features/externalApi/useExternalApi';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxInstanceDataSources } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useInnerLanguageWithForcedNodeSelector } from 'src/features/language/useLanguage';
import { useMultipleDelayedSelectors } from 'src/hooks/delayedSelectors';
import { useShallowObjectMemo } from 'src/hooks/useShallowObjectMemo';
import { Hidden, NodesInternal, useNodes } from 'src/utils/layout/NodesContext';
import { useInnerDataModelBindingTranspose } from 'src/utils/layout/useDataModelBindingTranspose';
import { useInnerNodeFormDataSelector } from 'src/utils/layout/useNodeItem';
import { useInnerNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { AttachmentsSelector } from 'src/features/attachments/AttachmentsStorePlugin';
import type { ExternalApisResult } from 'src/features/externalApi/useExternalApi';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { NodeOptionsSelector } from 'src/features/options/OptionsStorePlugin';
import type { FormDataSelector } from 'src/layout';
import type { IApplicationSettings, IInstanceDataSources, IProcess } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeDataSelector } from 'src/utils/layout/NodesContext';
import type { DataModelTransposeSelector } from 'src/utils/layout/useDataModelBindingTranspose';
import type { NodeFormDataSelector } from 'src/utils/layout/useNodeItem';
import type { NodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';

export interface ExpressionDataSources {
  process?: IProcess;
  instanceDataSources: IInstanceDataSources | null;
  applicationSettings: IApplicationSettings | null;
  dataModelNames: string[];
  defaultDataType: string | null;
  formDataSelector: FormDataSelector;
  attachmentsSelector: AttachmentsSelector;
  optionsSelector: NodeOptionsSelector;
  langToolsSelector: (node: LayoutNode | undefined) => IUseLanguage;
  currentLanguage: string;
  isHiddenSelector: ReturnType<typeof Hidden.useIsHiddenSelector>;
  nodeFormDataSelector: NodeFormDataSelector;
  nodeDataSelector: NodeDataSelector;
  nodeTraversal: NodeTraversalSelector;
  transposeSelector: DataModelTransposeSelector;
  externalApis: ExternalApisResult;
}

export function useExpressionDataSources(): ExpressionDataSources {
  const [
    formDataSelector,
    attachmentsSelector,
    optionsSelector,
    nodeDataSelector,
    dataSelectorForTraversal,
    isHiddenSelector,
  ] = useMultipleDelayedSelectors(
    FD.useDebouncedSelectorProps(),
    NodesInternal.useAttachmentsSelectorProps(),
    NodesInternal.useNodeOptionsSelectorProps(),
    NodesInternal.useNodeDataSelectorProps(),
    NodesInternal.useDataSelectorForTraversalProps(),
    Hidden.useIsHiddenSelectorProps(),
  );

  const process = useLaxProcessData();
  const applicationSettings = useApplicationSettings();
  const currentLanguage = useCurrentLanguage();

  const instanceDataSources = useLaxInstanceDataSources();
  const defaultDataType = DataModels.useDefaultDataType() ?? null;
  const dataModelNames = DataModels.useReadableDataTypes();
  const externalApis = useExternalApis(useApplicationMetadata().externalApiIds ?? []);
  const nodeTraversal = useInnerNodeTraversalSelector(useNodes(), dataSelectorForTraversal);
  const transposeSelector = useInnerDataModelBindingTranspose(nodeDataSelector);
  const nodeFormDataSelector = useInnerNodeFormDataSelector(nodeDataSelector, formDataSelector);
  const langToolsSelector = useInnerLanguageWithForcedNodeSelector(
    DataModels.useDefaultDataType(),
    dataModelNames,
    formDataSelector,
    nodeDataSelector,
  );

  return useShallowObjectMemo({
    formDataSelector,
    attachmentsSelector,
    optionsSelector,
    nodeDataSelector,
    process,
    applicationSettings,
    instanceDataSources,
    langToolsSelector,
    currentLanguage,
    isHiddenSelector,
    nodeFormDataSelector,
    nodeTraversal,
    transposeSelector,
    defaultDataType,
    externalApis,
    dataModelNames,
  });
}
