import { useCallback, useMemo } from 'react';

import { FD } from 'src/features/formData/FormDataWrite';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { FormDataSelector, NodeRef } from 'src/layout';
import type { TypeFromNode } from 'src/layout/layout';
import type { IComponentFormData } from 'src/utils/formComponentUtils';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeData } from 'src/utils/layout/types';

type ItemFromNode<N extends LayoutNode | undefined> = N extends undefined
  ? undefined
  : N extends { item: infer I }
    ? I
    : never;

export function useNodeItem<N extends LayoutNode | undefined>(node: N): ItemFromNode<N> {
  return NodesInternal.useNodeData(node, (node) => node?.item) as ItemFromNode<N>;
}

export function useNodeDirectChildren(parent: LayoutNode, restriction?: ChildLookupRestriction): NodeRef[] | undefined {
  return NodesInternal.useNodeData(parent, (store) => parent.def.pickDirectChildren(store, restriction));
}

type NodeFormData<N extends LayoutNode | undefined> = N extends undefined
  ? IComponentFormData<TypeFromNode<Exclude<N, undefined>>> | undefined
  : IComponentFormData<TypeFromNode<Exclude<N, undefined>>>;

const emptyObject = {};
export function useNodeFormData<N extends LayoutNode | undefined>(node: N): NodeFormData<N> {
  const nodeItem = useNodeItem(node);
  const formDataSelector = FD.useDebouncedSelector();
  const dataModelBindings = nodeItem?.dataModelBindings;

  return useMemo(
    () => (dataModelBindings ? getNodeFormData(dataModelBindings, formDataSelector) : emptyObject) as NodeFormData<N>,
    [dataModelBindings, formDataSelector],
  );
}

export type NodeDataSelector = ReturnType<typeof useNodeFormDataSelector>;
export function useNodeFormDataSelector() {
  const nodeSelector = NodesInternal.useNodeDataMemoSelector();
  const formDataSelector = FD.useDebouncedSelector();

  return useCallback(
    <N extends LayoutNode | undefined>(node: N): NodeFormData<N> => {
      const dataModelBindings = nodeSelector({ node, path: 'item.dataModelBindings' });
      return dataModelBindings
        ? (getNodeFormData(dataModelBindings, formDataSelector) as NodeFormData<N>)
        : (emptyObject as NodeFormData<N>);
    },
    [nodeSelector, formDataSelector],
  );
}

function getNodeFormData<N extends LayoutNode>(
  dataModelBindings: NodeData<TypeFromNode<N>>['dataModelBindings'],
  formDataSelector: FormDataSelector,
): NodeFormData<N> {
  if (!dataModelBindings) {
    return emptyObject as NodeFormData<N>;
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

  return formDataObj as NodeFormData<N>;
}
