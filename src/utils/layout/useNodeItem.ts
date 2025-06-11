import { FD } from 'src/features/formData/FormDataWrite';
import { NodesInternal, useNodes } from 'src/utils/layout/NodesContext';
import { typedBoolean } from 'src/utils/typing';
import type { FormDataSelector } from 'src/layout';
import type { CompTypes, IDataModelBindings, TypeFromNode } from 'src/layout/layout';
import type { IComponentFormData } from 'src/utils/formComponentUtils';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeItemFromNode } from 'src/utils/layout/types';

/**
 * Use the item of a node. This re-renders when the item changes (or when the part of the item you select changes),
 * which doesn't happen if you use node.item directly.
 */
export function useNodeItem<N extends LayoutNode, Out>(node: N, selector: (item: NodeItemFromNode<N>) => Out): Out;
// eslint-disable-next-line no-redeclare
export function useNodeItem<N extends LayoutNode>(node: N, selector?: undefined): NodeItemFromNode<N>;
// eslint-disable-next-line no-redeclare
export function useNodeItem(node: LayoutNode | undefined, selector: never): unknown {}

const emptyArray: LayoutNode[] = [];
export function useNodeDirectChildren(parent: LayoutNode | undefined, restriction?: number | undefined): LayoutNode[] {
  const nodes = useNodes();
  return (
    NodesInternal.useMemoSelector((state) => {
      if (!parent) {
        return emptyArray;
      }

      const out: (LayoutNode | undefined)[] = [];
      for (const n of Object.values(state.nodeData)) {
        if (n.parentId === parent.id && (restriction === undefined || restriction === n.rowIndex) && n.item) {
          out.push(nodes.findById(n.layout.id));
        }
      }
      return out.filter(typedBoolean);
    }) ?? emptyArray
  );
}

type NodeFormData<N extends LayoutNode | undefined> = N extends undefined
  ? IComponentFormData<TypeFromNode<Exclude<N, undefined>>> | undefined
  : IComponentFormData<TypeFromNode<Exclude<N, undefined>>>;

const emptyObject = {};
export function useNodeFormData<N extends LayoutNode | undefined>(node: N): NodeFormData<N> {
  const dataModelBindings = NodesInternal.useNodeData(node, (data) => data.layout.dataModelBindings) as
    | IDataModelBindings<TypeFromNode<N>>
    | undefined;

  return FD.useDebouncedSelect((pick) => getNodeFormDataInner(dataModelBindings, pick)) as NodeFormData<N>;
}

export function useNodeFormDataWhenType<Type extends CompTypes>(
  nodeId: string,
  type: Type,
): IComponentFormData<Type> | undefined {
  const dataModelBindings = NodesInternal.useNodeDataWhenType(nodeId, type, (data) => data.layout.dataModelBindings) as
    | IDataModelBindings<Type>
    | undefined;

  return FD.useDebouncedSelect((pick) => getNodeFormDataInner(dataModelBindings, pick));
}

function getNodeFormDataInner<T extends CompTypes>(
  dataModelBindings: IDataModelBindings<T> | undefined,
  formDataSelector: FormDataSelector,
): IComponentFormData<T> {
  if (!dataModelBindings) {
    return emptyObject as IComponentFormData<T>;
  }

  const formDataObj: { [key: string]: unknown } = {};
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

  return formDataObj as IComponentFormData<T>;
}
