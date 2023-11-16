import { useCallback } from 'react';

import { useAttachments } from 'src/features/attachments/AttachmentsContext';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { staticUseLanguageFromState } from 'src/hooks/useLanguage';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationContext, ValidationContextGenerator } from 'src/utils/validation/types';

export function useValidationContextGenerator(): ValidationContextGenerator {
  const formData = useAppSelector((state) => state.formData.formData);
  const attachments = useAttachments();
  const application = useAppSelector((state) => state.applicationMetadata.applicationMetadata);
  const instance = useLaxInstanceData() ?? null;
  const process = useLaxProcessData() ?? null;
  const layoutSets = useAppSelector((state) => state.formLayout.layoutsets);
  const schemas = useAppSelector((state) => state.formDataModel.schemas);
  const customValidation = useAppSelector((state) => state.customValidation.customValidation);
  const langToolsGenerator = useAppSelector(
    (state) => (node: LayoutNode | undefined) => staticUseLanguageFromState(state, node),
  );
  return useCallback(
    (node: LayoutNode | undefined): IValidationContext => ({
      formData,
      langTools: langToolsGenerator(node),
      attachments,
      application,
      instance,
      process,
      layoutSets,
      schemas,
      customValidation,
    }),
    [application, attachments, customValidation, formData, instance, langToolsGenerator, layoutSets, process, schemas],
  );
}
