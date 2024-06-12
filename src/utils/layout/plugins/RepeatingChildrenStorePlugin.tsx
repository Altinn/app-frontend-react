import deepEqual from 'fast-deep-equal';
import { produce } from 'immer';

import { pickDataStorePath } from 'src/utils/layout/NodesContext';
import { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesDataContext, NodesDataStoreFull } from 'src/utils/layout/NodesContext';
import type { NodeDataPluginSetState } from 'src/utils/layout/plugins/NodeDataPlugin';
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
  extraFunctions(set: NodeDataPluginSetState<NodesDataContext>): RepeatingChildrenStorePluginConfig['extraFunctions'] {
    return {
      setRowExtras: (requests) => {
        set(
          produce((state) => {
            for (const { node, row, internalProp, extras } of requests) {
              const nodeStore = pickDataStorePath(state, node);
              const existingRow = nodeStore[internalProp][row.uuid];
              if (existingRow && deepEqual(existingRow.extras, extras)) {
                continue;
              }

              const newRows = { ...nodeStore[internalProp] };
              newRows[row.uuid] = { ...nodeStore[internalProp][row.uuid], extras };
              nodeStore[internalProp] = newRows;
            }
          }),
        );
      },
      removeRow: (node, row, internalProp) => {
        set(
          produce((state) => {
            const nodeStore = pickDataStorePath(state, node);
            const newRows = { ...nodeStore[internalProp] };
            delete newRows[row.uuid];
            nodeStore[internalProp] = newRows;
            state.ready = false;
            state.addRemoveCounter += 1;
          }),
        );
      },
    };
  }

  extraHooks(store: NodesDataStoreFull): RepeatingChildrenStorePluginConfig['extraHooks'] {
    return {
      useSetRowExtras: () => store.useSelector((state) => state.setRowExtras),
      useRemoveRow: () => store.useSelector((state) => state.removeRow),
    };
  }
}
