import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useApplicationSettings } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useExternalApis } from 'src/features/externalApi/useExternalApi';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxDataElementsSelectorProps, useLaxInstanceDataSources } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useInnerLanguageWithForcedNodeSelector } from 'src/features/language/useLanguage';
import { useCodeListSelectorProps } from 'src/features/options/CodeListsProvider';
import { useCurrentPartyRoles } from 'src/features/useCurrentPartyRoles';
import { useMultipleDelayedSelectors } from 'src/hooks/delayedSelectors';
import { useShallowMemo } from 'src/hooks/useShallowMemo';
import { Hidden, NodesInternal, useNodes } from 'src/utils/layout/NodesContext';
import { useInnerDataModelBindingTranspose } from 'src/utils/layout/useDataModelBindingTranspose';
import { useInnerNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { AttachmentsSelector } from 'src/features/attachments/tools';
import type { ExternalApisResult } from 'src/features/externalApi/useExternalApi';
import type { DataElementSelector } from 'src/features/instance/InstanceContext';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { CodeListSelector } from 'src/features/options/CodeListsProvider';
import type { NodeOptionsSelector } from 'src/features/options/OptionsStorePlugin';
import type { RoleResult } from 'src/features/useCurrentPartyRoles';
import type { FormDataSelector } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { IApplicationSettings, IInstanceDataSources, IProcess } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeDataSelector } from 'src/utils/layout/NodesContext';
import type { DataModelTransposeSelector } from 'src/utils/layout/useDataModelBindingTranspose';
import type { NodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';

export interface ExpressionDataSourcesWithNodes {
  process?: IProcess;
  instanceDataSources: IInstanceDataSources | null;
  applicationSettings: IApplicationSettings | null;
  dataElementSelector: DataElementSelector;
  dataModelNames: string[];
  formDataSelector: FormDataSelector;
  attachmentsSelector: AttachmentsSelector;
  optionsSelector: NodeOptionsSelector;
  langToolsSelector: (node: LayoutNode | string | undefined) => IUseLanguage;
  currentLanguage: string;
  defaultDataType: string | null;
  isHiddenSelector: ReturnType<typeof Hidden.useIsHiddenSelector>;
  nodeDataSelector: NodeDataSelector;
  nodeTraversal: NodeTraversalSelector;
  transposeSelector: DataModelTransposeSelector;
  externalApis: ExternalApisResult;
  roles: RoleResult;
  currentDataModelPath?: IDataModelReference;
  codeListSelector: CodeListSelector;
}

export type ExpressionDataSourcesWithoutNodes = Omit<
  ExpressionDataSourcesWithNodes,
  | 'attachmentsSelector'
  | 'optionsSelector'
  | 'isHiddenSelector'
  | 'nodeFormDataSelector'
  | 'nodeDataSelector'
  | 'nodeTraversal'
  | 'transposeSelector'
>;

export type ExpressionDataSources = ExpressionDataSourcesWithNodes | ExpressionDataSourcesWithoutNodes;

export function isExpressionDataSourcesWithNodes(
  dataSources: ExpressionDataSources,
): dataSources is ExpressionDataSourcesWithNodes {
  return 'nodeDataSelector' in dataSources;
}

export function useExpressionDataSources(): ExpressionDataSourcesWithNodes {
  const [
    formDataSelector,
    attachmentsSelector,
    optionsSelector,
    nodeDataSelector,
    dataSelectorForTraversal,
    isHiddenSelector,
    dataElementSelector,
    codeListSelector,
  ] = useMultipleDelayedSelectors(
    FD.useDebouncedSelectorProps(),
    NodesInternal.useAttachmentsSelectorProps(),
    NodesInternal.useNodeOptionsSelectorProps(),
    NodesInternal.useNodeDataSelectorProps(),
    NodesInternal.useDataSelectorForTraversalProps(),
    Hidden.useIsHiddenSelectorProps(),
    useLaxDataElementsSelectorProps(),
    useCodeListSelectorProps(),
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
  const langToolsSelector = useInnerLanguageWithForcedNodeSelector(
    DataModels.useDefaultDataType(),
    dataModelNames,
    formDataSelector,
    nodeDataSelector,
  );

  const roles = useCurrentPartyRoles();

  return useShallowMemo({
    roles,
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
    nodeTraversal,
    transposeSelector,
    defaultDataType,
    externalApis,
    dataModelNames,
    dataElementSelector,
    codeListSelector,
  });
}
