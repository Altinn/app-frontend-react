import { produce } from 'immer';

import { selectValidations } from 'src/features/validation/utils';
import { pickDataStorePath } from 'src/utils/layout/NodesContext';
import { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import type {
  AnyValidation,
  AttachmentValidation,
  ValidationMask,
  ValidationSeverity,
} from 'src/features/validation/index';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesContext, NodesStoreFull } from 'src/utils/layout/NodesContext';
import type { NodeDataPluginSetState } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { NodeData } from 'src/utils/layout/types';

export type ValidationsSelector = (
  node: LayoutNode,
  mask: ValidationMask | 'visible',
  severity?: ValidationSeverity,
) => AnyValidation[];

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
    useVisibleValidations: (node: LayoutNode | undefined, severity?: ValidationSeverity) => AnyValidation[];
    useValidationsSelector: () => ValidationsSelector;
  };
}

const emptyArray: never[] = [];

export class ValidationStorePlugin extends NodeDataPlugin<ValidationStorePluginConfig> {
  extraFunctions(set: NodeDataPluginSetState<NodesContext>) {
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
      useVisibleValidations: (node, severity) =>
        store.useSelector((state) => {
          if (!node) {
            return emptyArray;
          }
          const nodeStore = pickDataStorePath(state, node) as NodeData;
          const visibility = 'validationVisibility' in nodeStore ? nodeStore.validationVisibility : 0;
          return 'validations' in nodeStore
            ? selectValidations(nodeStore.validations, visibility, severity)
            : emptyArray;
        }),
      useValidationsSelector: () =>
        store.useDelayedSelector({
          mode: 'simple',
          selector: (node: LayoutNode, mask: ValidationMask | 'visible', severity?: ValidationSeverity) => (state) => {
            const nodeStore = state.nodeData[node.getId()];
            if (!nodeStore) {
              return emptyArray;
            }
            const visibility = 'validationVisibility' in nodeStore ? nodeStore.validationVisibility : 0;
            return 'validations' in nodeStore
              ? selectValidations(nodeStore.validations, mask === 'visible' ? visibility : mask, severity)
              : emptyArray;
          },
        }),
    };

    return { ...out };
  }
}
