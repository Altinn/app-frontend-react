import type { IAttachments } from 'src/features/attachments';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { NodeOptionsSelector } from 'src/features/options/OptionsStorePlugin';
import type { FormDataSelector } from 'src/layout';
import type { CompInternal, CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeFormDataSelector } from 'src/utils/layout/useNodeItem';

export interface DisplayDataProps {
  attachments: IAttachments;
  optionsSelector: NodeOptionsSelector;
  langTools: IUseLanguage;
  currentLanguage: string;
  formDataSelector: FormDataSelector;
  nodeDataSelector: NodeFormDataSelector;
}

export interface DisplayData<Type extends CompTypes> {
  getDisplayData(node: LayoutNode<Type>, item: CompInternal<Type>, displayDataProps: DisplayDataProps): string;
  useDisplayData(node: LayoutNode<Type>): string;
}
