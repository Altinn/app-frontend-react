import deepEqual from 'fast-deep-equal';

import { getComponentDef } from 'src/layout';
import { NodesReadiness } from 'src/utils/layout/NodesContext';
import { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesStoreFull } from 'src/utils/layout/NodesContext';
import type { NodeDataPluginSetState } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { RepChildrenRow } from 'src/utils/layout/plugins/RepeatingChildrenPlugin';
import type { BaseRow, NodeData } from 'src/utils/layout/types';

export interface SetRowExtrasRequest<T extends CompTypes = CompTypes> {
  node: LayoutNode<T>;
  row: BaseRow;
  internalProp: string;
  extras: unknown;
}

export interface RepeatingChildrenStorePluginConfig {
  extraFunctions: {
    setRowExtras: (requests: SetRowExtrasRequest[]) => void;
    removeRow: (node: LayoutNode, rowIndex: number, internalProp: string, itemProp: string) => void;
  };
  extraHooks: {
    useSetRowExtras: () => RepeatingChildrenStorePluginConfig['extraFunctions']['setRowExtras'];
    useRemoveRow: () => RepeatingChildrenStorePluginConfig['extraFunctions']['removeRow'];
  };
}

export class RepeatingChildrenStorePlugin extends NodeDataPlugin<RepeatingChildrenStorePluginConfig> {
  extraFunctions(set: NodeDataPluginSetState): RepeatingChildrenStorePluginConfig['extraFunctions'] {
    return {
      setRowExtras: (requests) => {
        set((state) => {
          let changes = false;
          const nodeData = { ...state.nodeData };
          for (const { node, row, internalProp, extras } of requests) {
            if (typeof extras !== 'object' || !extras) {
              throw new Error('Extras must be an object');
            }

            const thisNode = nodeData[node.id];
            if (!thisNode) {
              continue;
            }

            const existingRows = thisNode.item && (thisNode.item[internalProp] as RepChildrenRow[] | undefined);
            const existingRow = existingRows ? existingRows[row.index] : undefined;
            const nextRow = { ...existingRow, ...extras, ...row } as RepChildrenRow;
            if (existingRows && existingRow && deepEqual(existingRow, nextRow)) {
              continue;
            }

            if (row.index !== undefined) {
              changes = true;
              const newRows = [...(existingRows || [])];
              newRows[row.index] = nextRow;
              nodeData[node.id] = { ...thisNode, item: { ...thisNode.item, [internalProp]: newRows } as any };
            }
          }

          return changes ? { nodeData } : {};
        });
      },
      removeRow: (node, rowIndex, internalProp, itemProp) => {
        set((state) => {
          const nodeData = { ...state.nodeData };
          const thisNode = nodeData[node.id];
          if (!thisNode) {
            return {};
          }
          const existingRows = thisNode.item && (thisNode.item[internalProp] as RepChildrenRow[] | undefined);
          if (!existingRows) {
            return {};
          }
          const rowToRemove = existingRows[rowIndex];
          const items = Array.isArray(rowToRemove[itemProp]) ? rowToRemove[itemProp] : [rowToRemove[itemProp] ?? []];
          const recursiveChildren = recursivelyFindChildren(items, nodeData);
          for (const n of recursiveChildren) {
            delete nodeData[n.id];
            n.page._removeChild(n);
          }

          const newRows = [...existingRows];
          newRows.splice(rowIndex, 1);
          nodeData[node.id] = { ...thisNode, item: { ...thisNode.item, [internalProp]: newRows } as any };

          return { nodeData, readiness: NodesReadiness.NotReady, addRemoveCounter: state.addRemoveCounter + 1 };
        });
      },
    };
  }

  extraHooks(store: NodesStoreFull): RepeatingChildrenStorePluginConfig['extraHooks'] {
    return {
      useSetRowExtras: () => store.useSelector((state) => state.setRowExtras),
      useRemoveRow: () => store.useSelector((state) => state.removeRow),
    };
  }
}

function recursivelyFindChildren(nodes: LayoutNode[], nodeData: { [key: string]: NodeData }): LayoutNode[] {
  const children: LayoutNode[] = [];

  for (const node of nodes) {
    const data = nodeData[node.id];
    if (!data) {
      continue;
    }
    const def = getComponentDef(data.layout.type);
    const directChildren = def.pickDirectChildren(data as any);
    children.push(...recursivelyFindChildren(directChildren, nodeData));
  }

  return [...nodes, ...children];
}
