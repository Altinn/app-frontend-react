import deepEqual from 'fast-deep-equal';

import { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesContext, NodesStoreFull } from 'src/utils/layout/NodesContext';
import type { NodeDataPluginSetState } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { RepChildrenRow } from 'src/utils/layout/plugins/RepeatingChildrenPlugin';
import type { BaseRow } from 'src/utils/layout/types';

export interface SetRowExtrasRequest<T extends CompTypes = CompTypes> {
  node: LayoutNode<T>;
  row: BaseRow;
  internalProp: string;
  extras: unknown;
}

export interface RepeatingChildrenStorePluginConfig {
  extraFunctions: {
    setRowExtras: (requests: SetRowExtrasRequest[]) => void;
    removeRow: (node: LayoutNode, row: BaseRow, internalProp: string) => void;
  };
  extraHooks: {
    useSetRowExtras: () => RepeatingChildrenStorePluginConfig['extraFunctions']['setRowExtras'];
    useRemoveRow: () => RepeatingChildrenStorePluginConfig['extraFunctions']['removeRow'];
  };
}

export class RepeatingChildrenStorePlugin extends NodeDataPlugin<RepeatingChildrenStorePluginConfig> {
  extraFunctions(set: NodeDataPluginSetState<NodesContext>): RepeatingChildrenStorePluginConfig['extraFunctions'] {
    return {
      setRowExtras: (requests) => {
        set((state) => {
          let changes = false;
          const nodeData = { ...state.nodeData };
          for (const { node, row, internalProp, extras } of requests) {
            if (typeof extras !== 'object' || !extras) {
              throw new Error('Extras must be an object');
            }

            const thisNode = nodeData[node.getId()];
            const existingRows = thisNode.item && (thisNode.item[internalProp] as RepChildrenRow[] | undefined);
            const existingRowIndex = existingRows?.findIndex((r) => r.uuid === row.uuid);
            const existingRow =
              existingRows && existingRowIndex !== undefined ? existingRows[existingRowIndex] : undefined;
            const nextRow = { ...existingRow, ...extras } as RepChildrenRow;
            if (existingRows && existingRow && deepEqual(existingRow, nextRow)) {
              continue;
            }

            if (existingRowIndex !== undefined) {
              changes = true;
              const newRows = [...(existingRows || [])];
              newRows[existingRowIndex] = nextRow;
              nodeData[node.getId()] = { ...thisNode, item: { ...thisNode.item, [internalProp]: newRows } as any };
            }
          }

          return changes ? { nodeData } : {};
        });
      },
      removeRow: (node, row, internalProp) => {
        set((state) => {
          const nodeData = { ...state.nodeData };
          const thisNode = nodeData[node.getId()];
          const existingRows = thisNode.item && (thisNode.item[internalProp] as RepChildrenRow[] | undefined);
          if (!existingRows) {
            return {};
          }
          const existingRowIndex = existingRows.findIndex((r) => r.uuid === row.uuid);
          if (existingRowIndex === -1) {
            return {};
          }
          const newRows = [...existingRows];
          newRows.splice(existingRowIndex, 1);
          nodeData[node.getId()] = { ...thisNode, item: { ...thisNode.item, [internalProp]: newRows } as any };

          return { nodeData, ready: false };
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
