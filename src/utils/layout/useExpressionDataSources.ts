import { useMemo } from 'react';

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
import { useLanguageWithForcedNodeSelector } from 'src/features/language/useLanguage';
import { useNodeOptionsSelector } from 'src/features/options/useNodeOptions';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import { useDataModelBindingTranspose } from 'src/utils/layout/useDataModelBindingTranspose';
import { useNodeFormDataSelector } from 'src/utils/layout/useNodeItem';
import { useNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { AttachmentsSelector } from 'src/features/attachments/AttachmentsStorePlugin';
import type { ExternalApisResult } from 'src/features/externalApi/useExternalApi';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { NodeOptionsSelector } from 'src/features/options/OptionsStorePlugin';
import type { FormDataRowsSelector, FormDataSelector } from 'src/layout';
import type { ILayoutSet } from 'src/layout/common.generated';
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
}

export function useExpressionDataSources(): ExpressionDataSources {
  const instanceDataSources = useLaxInstanceDataSources();
  const formDataSelector = FD.useDebouncedSelector();
  const formDataRowsSelector = FD.useDebouncedRowsSelector();
  const attachmentsSelector = useAttachmentsSelector();
  const optionsSelector = useNodeOptionsSelector();
  const process = useLaxProcessData();
  const applicationSettings = useApplicationSettings();
  const langToolsSelector = useLanguageWithForcedNodeSelector();
  const currentLanguage = useCurrentLanguage();
  const isHiddenSelector = Hidden.useIsHiddenSelector();
  const nodeFormDataSelector = useNodeFormDataSelector();
  const nodeDataSelector = NodesInternal.useNodeDataSelector();
  const nodeTraversal = useNodeTraversalSelector();
  const transposeSelector = useDataModelBindingTranspose();
  const currentLayoutSet = useCurrentLayoutSet() ?? null;
  const readableDataModels = DataModels.useReadableDataTypes();

  const externalApiIds = useApplicationMetadata().externalApiIds ?? [];
  const externalApis = useExternalApis(externalApiIds);

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
      dataModelNames: readableDataModels,
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
      readableDataModels,
    ],
  );
}
