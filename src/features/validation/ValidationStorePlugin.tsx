import { produce } from 'immer';

import { ignoreNodePathNotFound, pickDataStorePath } from 'src/utils/layout/NodesContext';
import { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { AnyValidation, AttachmentValidation } from 'src/features/validation/index';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesDataContext, NodesStoreFull } from 'src/utils/layout/NodesContext';
import type { NodeDataPluginSetState } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { NodeData } from 'src/utils/layout/types';

export type ValidationVisibilitySelector = (node: LayoutNode) => number;
export type ValidationsSelector = (node: LayoutNode) => AnyValidation[];

export interface ValidationStorePluginConfig {
  extraFunctions: {
    setNodeVisibility: (nodes: LayoutNode[], newVisibility: number, rowIndex?: number) => void;
    setAttachmentVisibility: (attachmentId: string, node: LayoutNode, newVisibility: number) => void;
  };
  extraHooks: {
    useSetNodeVisibility: () => ValidationStorePluginConfig['extraFunctions']['setNodeVisibility'];
    useSetAttachmentVisibility: () => ValidationStorePluginConfig['extraFunctions']['setAttachmentVisibility'];
    useValidationVisibility: (node: LayoutNode | undefined) => number;
    useValidations: (node: LayoutNode | undefined) => AnyValidation[];
    useValidationVisibilitySelector: () => ValidationVisibilitySelector;
    useValidationsSelector: () => ValidationsSelector;
  };
}

const emptyArray: never[] = [];

export class ValidationStorePlugin extends NodeDataPlugin<ValidationStorePluginConfig> {
  extraFunctions(set: NodeDataPluginSetState<NodesDataContext>) {
    const out: ValidationStorePluginConfig['extraFunctions'] = {
      setNodeVisibility: (nodes, newVisibility, _rowIndex) => {
        set(
          produce((state) => {
            for (const node of nodes) {
              const nodeStore = pickDataStorePath(state, node) as NodeData;
              (nodeStore as any).validationVisibility = newVisibility;
            }
          }),
        );
      },
      setAttachmentVisibility: (attachmentId, node, newVisibility) => {
        set(
          produce((state) => {
            const nodeStore = pickDataStorePath(state, node) as NodeData;
            if ('validations' in nodeStore) {
              for (const validation of nodeStore.validations) {
                if ('attachmentId' in validation && validation.attachmentId === attachmentId) {
                  const v = validation as AttachmentValidation;
                  v.visibility = newVisibility;
                }
              }
            }
          }),
        );
      },
    };

    return { ...out };
  }

  extraHooks(store: NodesStoreFull) {
    const out: ValidationStorePluginConfig['extraHooks'] = {
      useSetNodeVisibility: () => store.useSelector((state) => state.setNodeVisibility),
      useSetAttachmentVisibility: () => store.useSelector((state) => state.setAttachmentVisibility),
      useValidationVisibility: (node) =>
        store.useSelector((state) => {
          if (!node) {
            return 0;
          }
          const nodeStore = pickDataStorePath(state, node) as NodeData;
          return 'validationVisibility' in nodeStore ? nodeStore.validationVisibility : 0;
        }),
      useValidations: (node) =>
        store.useSelector((state) => {
          if (!node) {
            return emptyArray;
          }
          const nodeStore = pickDataStorePath(state, node) as NodeData;
          return 'validations' in nodeStore ? nodeStore.validations : emptyArray;
        }),
      useValidationVisibilitySelector: () =>
        store.useDelayedSelector({
          mode: 'simple',
          selector: (node: LayoutNode) => (state) =>
            ignoreNodePathNotFound(() => {
              const nodeStore = pickDataStorePath(state, node) as NodeData;
              return 'validationVisibility' in nodeStore ? nodeStore.validationVisibility : 0;
            }, 0),
        }),
      useValidationsSelector: () =>
        store.useDelayedSelector({
          mode: 'simple',
          selector: (node: LayoutNode) => (state) =>
            ignoreNodePathNotFound(() => {
              const nodeStore = pickDataStorePath(state, node) as NodeData;
              return 'validations' in nodeStore ? nodeStore.validations : emptyArray;
            }, emptyArray),
        }),
    };

    return { ...out };
  }
}
