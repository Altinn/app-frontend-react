import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useApplicationSettings } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useExternalApis } from 'src/features/externalApi/useExternalApi';
import { useCurrentLayoutSet } from 'src/features/form/layoutSets/useCurrentLayoutSet';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxInstanceDataSources } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useInnerLanguageWithForcedNodeSelector } from 'src/features/language/useLanguage';
import { useCurrentRoles } from 'src/features/party/PartiesProvider';
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
import type { FormDataRowsSelector, FormDataSelector } from 'src/layout';
import type { ILayoutSet } from 'src/layout/common.generated';
import type { IApplicationSettings, IInstanceDataSources, IProcess, Role } from 'src/types/shared';
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
  formDataSelector: FormDataSelector;
  formDataRowsSelector: FormDataRowsSelector;
  attachmentsSelector: AttachmentsSelector;
  optionsSelector: NodeOptionsSelector;
  langToolsSelector: (node: LayoutNode | undefined) => IUseLanguage;
  currentLanguage: string;
  currentLayoutSet: ILayoutSet | null;
  isHiddenSelector: ReturnType<typeof Hidden.useIsHiddenSelector>;
  nodeFormDataSelector: NodeFormDataSelector;
  nodeDataSelector: NodeDataSelector;
  nodeTraversal: NodeTraversalSelector;
  transposeSelector: DataModelTransposeSelector;
  externalApis: ExternalApisResult;
  roles: Role[] | undefined;
}

export function useExpressionDataSources(): ExpressionDataSources {
  const [
    formDataSelector,
    formDataRowsSelector,
    attachmentsSelector,
    optionsSelector,
    nodeDataSelector,
    dataSelectorForTraversal,
    isHiddenSelector,
  ] = useMultipleDelayedSelectors(
    FD.useDebouncedSelectorProps(),
    FD.useDebouncedRowsSelectorProps(),
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
  const currentLayoutSet = useCurrentLayoutSet() ?? null;
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

  const roles = useCurrentRoles();

  return useShallowObjectMemo({
    roles,
    formDataSelector,
    formDataRowsSelector,
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
    currentLayoutSet,
    externalApis,
    dataModelNames,
  });
}
