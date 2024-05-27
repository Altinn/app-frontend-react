import { useMemo } from 'react';

import { useAttachmentsSelector } from 'src/features/attachments/hooks';
import { FD } from 'src/features/formData/FormDataWrite';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { useNodeOptionsSelector } from 'src/features/options/useNodeOptions';
import { useNodeFormDataSelector } from 'src/utils/layout/useNodeItem';
import type { DisplayDataProps } from 'src/features/displayData/index';

export function useDisplayDataProps(): DisplayDataProps {
  const langTools = useLanguage();
  const optionsSelector = useNodeOptionsSelector();
  const attachmentsSelector = useAttachmentsSelector();
  const currentLanguage = useCurrentLanguage();
  const formDataSelector = FD.useDebouncedSelector();
  const nodeDataSelector = useNodeFormDataSelector();

  return useMemo(
    () => ({
      optionsSelector,
      attachmentsSelector,
      langTools,
      currentLanguage,
      formDataSelector,
      nodeFormDataSelector: nodeDataSelector,
    }),
    [attachmentsSelector, langTools, optionsSelector, currentLanguage, formDataSelector, nodeDataSelector],
  );
}
