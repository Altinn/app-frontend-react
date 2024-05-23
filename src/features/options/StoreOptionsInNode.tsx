import { useFetchOptions } from 'src/features/options/useGetOptions';
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

  const { options, isFetching } = useFetchOptions({
    valueType,
    node,
    item,
  });

  const ready = isAllAdded && isSelfAdded;
  NodeStages.OptionsFetched.useEffect(() => {
    if (ready) {
      !isFetching && setNodeProp(node, 'options' as any, options);
      setNodeProp(node, 'isFetchingOptions' as any, isFetching);
    }
  }, [ready, node, setNodeProp, options]);

  return null;
}
