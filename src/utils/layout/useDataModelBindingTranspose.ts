import { useCallback } from 'react';

import { ContextNotProvided } from 'src/core/contexts/context';
import { transposeDataBinding } from 'src/utils/databindings/DataBinding';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LaxNodeIdDataSelector } from 'src/utils/layout/NodesContext';

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
  const selector = NodesInternal.useLaxNodeIdDataSelector();
  return useInnerDataModelBindingTranspose(selector);
}
export function useInnerDataModelBindingTranspose(nodeIdDataSelector: LaxNodeIdDataSelector) {
  return useCallback(
    (node: LayoutNode | string, subject: IDataModelReference, _rowIndex?: number) => {
      const { currentLocation, currentLocationIsRepGroup, foundRowIndex } = firstDataModelBinding(
        node,
        nodeIdDataSelector,
      );
      const rowIndex = _rowIndex ?? foundRowIndex;
      return currentLocation
        ? transposeDataBinding({ subject, currentLocation, rowIndex, currentLocationIsRepGroup })
        : subject;
    },
    [nodeIdDataSelector],
  );
}

/**
 * Finds the first component with a data model binding (and the first binding) in the current component's hierarchy.
 * Starts at a node and then moves up the hierarchy until it finds a node with a data model binding.
 */
function firstDataModelBinding(
  node: LayoutNode | string,
  nodeIdDataSelector: LaxNodeIdDataSelector,
  rowIndex?: number,
): {
  currentLocation: IDataModelReference | undefined;
  currentLocationIsRepGroup: boolean;
  foundRowIndex: number | undefined;
} {
  const data = nodeIdDataSelector(
    (picker) => {
      const nodeData = picker(node instanceof BaseLayoutNode ? node.id : node);
      if (!nodeData) {
        return undefined;
      }

      return {
        type: nodeData.layout.type,
        dataModelBindings: nodeData.layout.dataModelBindings,
        parentId: nodeData.parentId,
        nodeRowIndex: nodeData.rowIndex,
      };
    },
    [node],
  );
  if (!data || data === ContextNotProvided) {
    return {
      currentLocation: undefined,
      foundRowIndex: undefined,
      currentLocationIsRepGroup: false,
    };
  }
  const { type, dataModelBindings, parentId, nodeRowIndex } = data;

  const firstBinding = Object.keys(dataModelBindings || {}).shift();
  if (firstBinding && dataModelBindings) {
    return {
      currentLocation: dataModelBindings[firstBinding],
      foundRowIndex: rowIndex,
      currentLocationIsRepGroup: type === 'RepeatingGroup',
    };
  }

  if (!parentId) {
    return {
      currentLocation: undefined,
      currentLocationIsRepGroup: false,
      foundRowIndex: undefined,
    };
  }

  return firstDataModelBinding(parentId, nodeIdDataSelector, nodeRowIndex);
}
