import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { pickDataStorePath } from 'src/utils/layout/NodesContext';
import { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { AttachmentValidation, ComponentValidation, FieldValidation } from 'src/features/validation/index';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesDataContext, NodesDataStoreFull } from 'src/utils/layout/NodesContext';
import type { NodeDataPluginSetState } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { NodeData } from 'src/utils/layout/types';

type Validations = ComponentValidation | AttachmentValidation | FieldValidation;
export type ValidationVisibilitySelector = (node: LayoutNode) => number;
export type ValidationsSelector = (node: LayoutNode) => Validations[];

export interface ValidationStorePluginConfig {
  extraFunctions: {
    setNodeVisibility: (nodes: LayoutNode[], newVisibility: number, rowIndex?: number) => void;
    setAttachmentVisibility: (attachmentId: string, node: LayoutNode, newVisibility: number) => void;
  };
  extraHooks: {
    useSetNodeVisibility: () => ValidationStorePluginConfig['extraFunctions']['setNodeVisibility'];
    useSetAttachmentVisibility: () => ValidationStorePluginConfig['extraFunctions']['setAttachmentVisibility'];
    useValidationVisibility: (node: LayoutNode | undefined) => number;
    useValidations: (node: LayoutNode | undefined) => Validations[];
    useValidationVisibilitySelector: () => ValidationVisibilitySelector;
    useValidationsSelector: () => ValidationsSelector;
  };
}

const emptyArray: never[] = [];

export class ValidationStorePlugin extends NodeDataPlugin<ValidationStorePluginConfig> {
  extraFunctions(set: NodeDataPluginSetState<NodesDataContext>) {
    const out: ValidationStorePluginConfig['extraFunctions'] = {
      setNodeVisibility: (nodes, newVisibility, _rowIndex) => {
        set((state) => {
          for (const node of nodes) {
            const nodeStore = pickDataStorePath(state.pages, node) as NodeData;
            (nodeStore as any).validationVisibility = newVisibility;
          }
        });
      },
      setAttachmentVisibility: (_attachmentId, _node, _newVisibility) => {
        set((_state) => {
          throw new Error('Method not implemented.');
        });
      },
    };

    return { ...out };
  }

  extraHooks(store: NodesDataStoreFull) {
    const out: ValidationStorePluginConfig['extraHooks'] = {
      useSetNodeVisibility: () => store.useSelector((state) => state.setNodeVisibility),
      useSetAttachmentVisibility: () => store.useSelector((state) => state.setAttachmentVisibility),
      useValidationVisibility: (node) =>
        store.useSelector((state) => {
          if (!node) {
            return 0;
          }
          const nodeStore = pickDataStorePath(state.pages, node) as NodeData;
          return 'validationVisibility' in nodeStore ? nodeStore.validationVisibility : 0;
        }),
      useValidations: (node) =>
        store.useSelector((state) => {
          if (!node) {
            return emptyArray;
          }
          const nodeStore = pickDataStorePath(state.pages, node) as NodeData;
          return 'validations' in nodeStore ? nodeStore.validations : emptyArray;
        }),
      useValidationVisibilitySelector: () =>
        store.useDelayedMemoSelectorFactory((node: LayoutNode) => (state) => {
          try {
            const nodeStore = pickDataStorePath(state.pages, node) as NodeData;
            return 'validationVisibility' in nodeStore ? nodeStore.validationVisibility : 0;
          } catch (e) {
            if (e instanceof NodePathNotFound) {
              return 0;
            }
            throw e;
          }
        }),
      useValidationsSelector: () =>
        store.useDelayedMemoSelectorFactory((node: LayoutNode) => (state) => {
          try {
            const nodeStore = pickDataStorePath(state.pages, node) as NodeData;
            return 'validations' in nodeStore ? nodeStore.validations : emptyArray;
          } catch (e) {
            if (e instanceof NodePathNotFound) {
              return emptyArray;
            }
            throw e;
          }
        }),
    };

    return { ...out };
  }
}
