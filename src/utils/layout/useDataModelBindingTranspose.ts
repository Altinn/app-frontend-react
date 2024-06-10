import { useCallback } from 'react';

import { ContextNotProvided } from 'src/core/contexts/context';
import { transposeDataBinding } from 'src/utils/databindings/DataBinding';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeTraversalSelectorLax } from 'src/utils/layout/useNodeTraversal';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LaxNodeDataSelector } from 'src/utils/layout/NodesContext';
import type { NodeTraversalFromAny } from 'src/utils/layout/useNodeTraversal';

export type DataModelTransposeSelector = ReturnType<typeof useDataModelBindingTranspose>;

/**
 * This takes a dataModel path (without indexes) and alters it to add indexes such that the data model path refers
 * to an item in the same repeating group row (or nested repeating group row) as the data model for the current
 * component.
 *
 * Example: Let's say this component is in the second row of the first repeating group, and inside the third row
 * of a nested repeating group. Our data model binding is such:
 *    simpleBinding: 'MyModel.Group[1].NestedGroup[2].FirstName'
 *
 * If you pass the argument 'MyModel.Group.NestedGroup.Age' to this function, you'll get the
 * transposed binding back: 'MyModel.Group[1].NestedGroup[2].Age'.
 *
 * If you pass the argument 'MyModel.Group[2].NestedGroup[3].Age' to this function, it will still be transposed to
 * the current row indexes: 'MyModel.Group[1].NestedGroup[2].Age' unless you pass overwriteOtherIndices = false.
 */
export function useDataModelBindingTranspose() {
  const nodeSelector = NodesInternal.useLaxNodeDataSelector();
  const traversal = useNodeTraversalSelectorLax();

  return useCallback(
    (node: LayoutNode, subject: string, rowIndex?: number) => {
      const result = traversal((t) => firstDataModelBinding(t, nodeSelector), [node]);

      if (result === ContextNotProvided) {
        return subject;
      }

      const [currentLocation, currentLocationIsRepGroup] = result;
      return currentLocation
        ? transposeDataBinding({ subject, currentLocation, rowIndex, currentLocationIsRepGroup })
        : subject;
    },
    [nodeSelector, traversal],
  );
}

/**
 * Finds the first component with a data model binding (and the first binding) in the current component's hierarchy.
 * Starts at a node and then moves up the hierarchy until it finds a node with a data model binding.
 */
function firstDataModelBinding(
  traversal: NodeTraversalFromAny,
  nodeSelector: LaxNodeDataSelector,
): [string | undefined, boolean] {
  if (!traversal.targetIsNode()) {
    return [undefined, false];
  }

  const node = traversal.target;
  const dataModelBindings = nodeSelector((picker) => picker(node).layout.dataModelBindings, [node]);
  if (dataModelBindings === ContextNotProvided) {
    return [undefined, false];
  }

  const firstBinding = Object.keys(dataModelBindings || {}).shift();
  if (firstBinding && dataModelBindings) {
    return [dataModelBindings[firstBinding], node.isType('RepeatingGroup')];
  }

  const parent = traversal.parents()[0];
  if (!parent) {
    return [undefined, false];
  }
  return firstDataModelBinding(traversal.with(parent), nodeSelector);
}
