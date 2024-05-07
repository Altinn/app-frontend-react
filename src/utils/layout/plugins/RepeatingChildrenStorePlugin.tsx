import deepEqual from 'fast-deep-equal';

import { pickDataStorePath } from 'src/utils/layout/NodesContext';
import { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesDataContext, NodesDataStoreFull } from 'src/utils/layout/NodesContext';
import type { NodeDataPluginSetState } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { BaseRow } from 'src/utils/layout/types';

export interface RepeatingChildrenStorePluginConfig {
  extraFunctions: {
    setRowExtras: (node: LayoutNode, row: BaseRow, internalProp: string, extras: unknown) => void;
  };
  extraHooks: {
    useSetRowExtras: () => RepeatingChildrenStorePluginConfig['extraFunctions']['setRowExtras'];
  };
}

export class RepeatingChildrenStorePlugin extends NodeDataPlugin<RepeatingChildrenStorePluginConfig> {
  extraFunctions(set: NodeDataPluginSetState<NodesDataContext>): RepeatingChildrenStorePluginConfig['extraFunctions'] {
    return {
      setRowExtras: (node, row, internalProp, extras) => {
        set((state) => {
          const nodeStore = pickDataStorePath(state.pages, node);
          const existingRow = nodeStore[internalProp][row.uuid];
          if (deepEqual(existingRow.extras, extras)) {
            return;
          }

          const newRows = { ...nodeStore[internalProp] };
          newRows[row.uuid] = { ...nodeStore[internalProp][row.uuid], extras };
          nodeStore[internalProp] = newRows;
        });
      },
    };
  }

  extraHooks(store: NodesDataStoreFull): RepeatingChildrenStorePluginConfig['extraHooks'] {
    return {
      useSetRowExtras: () => store.useSelector((state) => state.setRowExtras),
    };
  }
}
