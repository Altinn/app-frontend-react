import { useGetOptions } from 'src/features/options/useGetOptions';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { NodeGeneratorInternal } from 'src/utils/layout/NodesGeneratorContext';
import { NodeStages } from 'src/utils/layout/NodeStages';
import type { OptionsValueType } from 'src/features/options/useGetOptions';
import type { CompInternal, CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function StoreOptionsInNode({ valueType }: { valueType: OptionsValueType }) {
  const item = NodeGeneratorInternal.useUnresolvedItem() as CompInternal<CompWithBehavior<'canHaveOptions'>>;
  const node = NodeGeneratorInternal.useParent() as LayoutNode<CompWithBehavior<'canHaveOptions'>>;
  const setNodeProp = NodesInternal.useSetNodeProp();
  const isAllAdded = NodeStages.AddNodes.useIsDone();
  const isSelfAdded = NodesInternal.useIsAdded(node);

  const { options, isFetching } = useGetOptions({
    valueType,
    ...item,
    node,

    // Setting this makes sure we don't run preselection logic. We could however do that in the future, as doing
    // that in the node generator would be more reliable than doing it in each component on render (as we might miss
    // setting a preselection for a component unless the user sees it).
    dataModelBindings: undefined,
  });

  NodeStages.OptionsFetched.useEffect(() => {
    isAllAdded && isSelfAdded && !isFetching && setNodeProp(node, 'options' as any, options, 'ignore');
  }, [isAllAdded, isSelfAdded, node, setNodeProp, options]);

  return null;
}
