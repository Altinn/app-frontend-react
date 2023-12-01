import { useLanguage } from 'src/features/language/useLanguage';
import type { ValidLangParam, ValidLanguageKey } from 'src/features/language/useLanguage';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface LangProps {
  id: ValidLanguageKey | string | undefined;
  params?: ValidLangParam[];
  node?: LayoutNode;
}

export function Lang({ id, params, node }: LangProps) {
  const { lang } = useLanguage(node);
  return lang(id, params);
}
