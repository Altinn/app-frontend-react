import { useFetchOptions } from 'src/features/options/useGetOptions';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { GeneratorStages } from 'src/utils/layout/generator/GeneratorStages';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { OptionsValueType } from 'src/features/options/useGetOptions';
import type { CompIntermediate, CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function StoreOptionsInNode({ valueType }: { valueType: OptionsValueType }) {
  const item = GeneratorInternal.useIntermediateItem() as CompIntermediate<CompWithBehavior<'canHaveOptions'>>;
  const node = GeneratorInternal.useParent() as LayoutNode<CompWithBehavior<'canHaveOptions'>>;
  const setNodeProp = NodesInternal.useSetNodeProp();
  const isAllAdded = GeneratorStages.AddNodes.useIsDone();
  const isSelfAdded = NodesInternal.useIsAdded(node);

  const { options, isFetching } = useFetchOptions({
    valueType,
    node,
    item,
  });

  const ready = isAllAdded && isSelfAdded;
  GeneratorStages.OptionsFetched.useConditionalEffect(() => {
    if (ready) {
      !isFetching && setNodeProp(node, 'options' as any, options);
      setNodeProp(node, 'isFetchingOptions' as any, isFetching);
      return true;
    }
    return false;
  }, [ready, node, setNodeProp, options]);

  return null;
}
