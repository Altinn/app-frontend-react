import { isValidElement } from 'react';
import type React from 'react';

import { useLanguage } from 'src/features/language/useLanguage';
import type { ValidLangParam, ValidLanguageKey } from 'src/features/language/useLanguage';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type Param = ValidLangParam | React.ReactElement<Props, typeof Lang>;
export interface Props {
  id: ValidLanguageKey | string | undefined;
  params?: Param[];
  node?: LayoutNode;
}

type LangAsString = ReturnType<typeof useLanguage>['langAsString'];

const unrollProps = (params: Param[], langAsString: LangAsString): ValidLangParam[] =>
  params.map((param) => {
    if (isValidElement(param) && param.type === Lang) {
      return langAsString((param.props as Props).id, unrollProps((param.props as Props).params || [], langAsString));
    } else if (isValidElement(param)) {
      throw new Error('Invalid element passed to Lang component');
    }

    return param as ValidLangParam;
  });

export function Lang({ id, params, node }: Props) {
  const { lang, langAsString } = useLanguage(node);
  const realParams = unrollProps(params || [], langAsString);

  return lang(id, realParams);
}
