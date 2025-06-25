import { useFetchOptions, useFilteredAndSortedOptions } from 'src/features/options/useGetOptions';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useIntermediateItem } from 'src/utils/layout/hooks';
import { useNode } from 'src/utils/layout/NodesContext';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { CompIntermediateExact, CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface OptionsResult {
  options: IOptionInternal[];
  isFetching: boolean;
}

export function useOptionsFor<T extends CompWithBehavior<'canHaveOptions'>>(
  baseComponentId: string,
  valueType: 'single' | 'multi',
): OptionsResult {
  const nodeId = useIndexedId(baseComponentId);
  const node = useNode(nodeId) as LayoutNode<T>;
  const item = useIntermediateItem(baseComponentId) as CompIntermediateExact<T>;
  const { unsorted, isFetching } = useFetchOptions({ item });
  const { options } = useFilteredAndSortedOptions({ unsorted, valueType, node, item });
  return { isFetching, options };
}
