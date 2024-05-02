import { useCallback, useMemo } from 'react';

import { FD } from 'src/features/formData/FormDataWrite';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { FormDataSelector, NodeRef } from 'src/layout';
import type { TypeFromNode } from 'src/layout/layout';
import type { IComponentFormData } from 'src/utils/formComponentUtils';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { ItemStore } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ItemFromNode<N extends LayoutNode | undefined> = N extends undefined
  ? undefined
  : N extends { item: infer I }
    ? I
    : never;

export function useNodeItem<N extends LayoutNode | undefined>(node: N): ItemFromNode<N> {
  return NodesInternal.useNodeState(node, (node) => node?.item) as ItemFromNode<N>;
}

export function useNodeDirectChildren(parent: LayoutNode, restriction?: ChildLookupRestriction): NodeRef[] {
  return NodesInternal.useNodeStateMemo(parent, (store) => parent.def.pickDirectChildren(store, restriction));
}

type NodeData<N extends LayoutNode | undefined> = N extends undefined
  ? IComponentFormData<TypeFromNode<Exclude<N, undefined>>> | undefined
  : IComponentFormData<TypeFromNode<Exclude<N, undefined>>>;

const emptyObject = {};
export function useNodeData<N extends LayoutNode | undefined>(node: N): NodeData<N> {
  const nodeItem = useNodeItem(node);
  const formDataSelector = FD.useDebouncedSelector();
  const dataModelBindings = nodeItem?.dataModelBindings;

  return useMemo(
    () => (dataModelBindings ? getNodeData(dataModelBindings, formDataSelector) : emptyObject) as NodeData<N>,
    [dataModelBindings, formDataSelector],
  );
}

export type NodeDataSelector = ReturnType<typeof useNodeDataSelector>;
export function useNodeDataSelector() {
  const nodeSelector = NodesInternal.useNodeStateMemoSelector();
  const formDataSelector = FD.useDebouncedSelector();

  return useCallback(
    <N extends LayoutNode | undefined>(node: N): NodeData<N> => {
      const dataModelBindings = nodeSelector({ node, path: 'item.dataModelBindings' });
      return dataModelBindings
        ? (getNodeData(dataModelBindings, formDataSelector) as NodeData<N>)
        : (emptyObject as NodeData<N>);
    },
    [nodeSelector, formDataSelector],
  );
}

function getNodeData<N extends LayoutNode>(
  dataModelBindings: ItemStore<TypeFromNode<N>>['dataModelBindings'],
  formDataSelector: FormDataSelector,
): NodeData<N> {
  if (!dataModelBindings) {
    return emptyObject as NodeData<N>;
  }

  const formDataObj: { [key: string]: any } = {};
  for (const key of Object.keys(dataModelBindings)) {
    const binding = dataModelBindings[key];
    const data = formDataSelector(binding);

    if (key === 'list') {
      formDataObj[key] = data ?? [];
    } else if (key === 'simpleBinding') {
      formDataObj[key] = data != null ? String(data) : '';
    } else {
      formDataObj[key] = data;
    }
  }

  return formDataObj as NodeData<N>;
}
