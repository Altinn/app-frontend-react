import { useAttachmentsSelector } from 'src/features/attachments/hooks';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { useNodeOptionsSelector } from 'src/features/options/useNodeOptions';
import { useShallowMemo } from 'src/hooks/useShallowMemo';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeFormDataSelector } from 'src/utils/layout/useNodeItem';
import type { DisplayData, DisplayDataProps } from 'src/features/displayData/index';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useDisplayDataProps(): DisplayDataProps {
  const langTools = useLanguage();
  const optionsSelector = useNodeOptionsSelector();
  const attachmentsSelector = useAttachmentsSelector();
  const currentLanguage = useCurrentLanguage();
  const nodeFormDataSelector = useNodeFormDataSelector();
  const nodeDataSelector = NodesInternal.useNodeDataSelector();

  return useShallowMemo({
    optionsSelector,
    attachmentsSelector,
    langTools,
    currentLanguage,
    nodeFormDataSelector,
    nodeDataSelector,
  });
}

export function useDisplayData<Type extends CompTypes>(node: LayoutNode<Type>): string {
  const props = useDisplayDataProps();
  const def = node.def as DisplayData<Type>;
  return def.getDisplayData(node, props);
}
