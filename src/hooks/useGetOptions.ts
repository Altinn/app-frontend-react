import { useMemo } from 'react';

import { useGetOptionsQuery } from 'src/hooks/queries/useGetOptionsQuery';
import { useSourceOptions } from 'src/hooks/useSourceOptions';
import type { IMapping, IOption, IOptionSource } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface IUseGetOptionsParams {
  optionsId: string | undefined;
  mapping?: IMapping;
  queryParameters?: Record<string, string>;
  secure?: boolean;
  source?: IOptionSource;
  node: LayoutNode;
}

export function useGetOptions({
  optionsId,
  mapping,
  queryParameters,
  source,
  secure,
  node,
}: IUseGetOptionsParams): IOption[] | undefined {
  const sourceOptions = useSourceOptions({ source, node });
  const { data: fetchedOptions } = useGetOptionsQuery(optionsId, mapping, queryParameters, secure, !!optionsId);

  return useMemo(() => {
    if (sourceOptions) {
      return sourceOptions;
    }

    if (optionsId && fetchedOptions) {
      return fetchedOptions;
    }

    return undefined;
  }, [optionsId, fetchedOptions, sourceOptions]);
}
