import { selectValidations } from 'src/features/validation/utils';
import { Hidden, nodesProduce } from 'src/utils/layout/NodesContext';
import { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import { TraversalTask } from 'src/utils/layout/useNodeTraversal';
import type { ContextNotProvided } from 'src/core/contexts/context';
import type {
  AnyValidation,
  AttachmentValidation,
  ValidationMask,
  ValidationSeverity,
} from 'src/features/validation/index';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IsHiddenOptions, NodesStoreFull } from 'src/utils/layout/NodesContext';
import type { NodeDataPluginSetState } from 'src/utils/layout/plugins/NodeDataPlugin';

export type ValidationsSelector = (
  node: LayoutNode,
  mask: ValidationMask | 'visible',
  severity?: ValidationSeverity,
  includeHidden?: boolean, // Defaults to false
) => AnyValidation[];

export interface ValidationStorePluginConfig {
  extraFunctions: {
    setNodeVisibility: (nodes: LayoutNode[], newVisibility: number) => void;
    setAllNodesVisibility: (newVisibility: number) => void;
    setAttachmentVisibility: (attachmentId: string, node: LayoutNode, newVisibility: number) => void;
  };
  extraHooks: {
    useSetNodeVisibility: () => ValidationStorePluginConfig['extraFunctions']['setNodeVisibility'];
    useLaxSetNodeVisibility: () =>
      | ValidationStorePluginConfig['extraFunctions']['setNodeVisibility']
      | typeof ContextNotProvided;
    useLaxSetAllNodesVisibility: () =>
      | ValidationStorePluginConfig['extraFunctions']['setAllNodesVisibility']
      | typeof ContextNotProvided;
    useSetAttachmentVisibility: () => ValidationStorePluginConfig['extraFunctions']['setAttachmentVisibility'];
    useRawValidationVisibility: (node: LayoutNode | undefined) => number;
    useRawValidations: (node: LayoutNode | undefined) => AnyValidation[];
    useRawDataModelValidationsForAllNodes: () => AnyValidation[];
    useVisibleValidations: (node: LayoutNode | undefined, severity?: ValidationSeverity) => AnyValidation[];
    useValidationsSelector: () => ValidationsSelector;
    useLaxValidationsSelector: () => ValidationsSelector | typeof ContextNotProvided;
  };
}

const emptyArray: never[] = [];
const hiddenOptions: IsHiddenOptions = { respectTracks: true };

export class ValidationStorePlugin extends NodeDataPlugin<ValidationStorePluginConfig> {
  extraFunctions(set: NodeDataPluginSetState) {
    const out: ValidationStorePluginConfig['extraFunctions'] = {
      setNodeVisibility: (nodes, newVisibility) => {
        set(
          nodesProduce((state) => {
            for (const node of nodes) {
              const nodeData = state.nodeData[node.id];
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (nodeData as any).validationVisibility = newVisibility;
            }
          }),
        );
      },
      setAllNodesVisibility: (newVisibility) => {
        set(
          nodesProduce((state) => {
            for (const node of state.nodes?.allNodes(new TraversalTask(state, state.nodes, undefined, undefined)) ??
              []) {
              const nodeData = state.nodeData[node.id];
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (nodeData as any).validationVisibility = newVisibility;
            }
          }),
        );
      },
      setAttachmentVisibility: (attachmentId, node, newVisibility) => {
        set(
          nodesProduce((state) => {
            const nodeData = state.nodeData[node.id];
            if (nodeData && 'validations' in nodeData) {
              for (const validation of nodeData.validations) {
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
    const selectorArgs = (
      hiddenSelector: ReturnType<(typeof Hidden)['useIsHiddenSelector']>,
    ): Parameters<(typeof store)['useDelayedSelector']> => [
      {
        mode: 'simple',
        selector:
          (node: LayoutNode, mask: ValidationMask | 'visible', severity?: ValidationSeverity, includeHidden = false) =>
          (state) => {
            const nodeData = state.nodeData[node.id];
            if (!nodeData || (!includeHidden && hiddenSelector(node, hiddenOptions))) {
              return emptyArray;
            }
            const visibility = 'validationVisibility' in nodeData ? nodeData.validationVisibility : 0;
            return 'validations' in nodeData
              ? selectValidations(nodeData.validations, mask === 'visible' ? visibility : mask, severity)
              : emptyArray;
          },
      },
      [hiddenSelector],
    ];

    const out: ValidationStorePluginConfig['extraHooks'] = {
      useSetNodeVisibility: () => store.useSelector((state) => state.setNodeVisibility),
      useLaxSetNodeVisibility: () => store.useLaxSelector((state) => state.setNodeVisibility),
      useLaxSetAllNodesVisibility: () => store.useLaxSelector((state) => state.setAllNodesVisibility),
      useSetAttachmentVisibility: () => store.useSelector((state) => state.setAttachmentVisibility),
      useRawValidationVisibility: (node) =>
        store.useSelector((state) => {
          if (!node) {
            return 0;
          }
          const nodeData = state.nodeData[node.id];
          if (!nodeData) {
            return 0;
          }
          return 'validationVisibility' in nodeData ? nodeData.validationVisibility : 0;
        }),
      useRawValidations: (node) =>
        store.useSelector((state) => {
          if (!node) {
            return emptyArray;
          }
          const nodeData = state.nodeData[node.id];
          if (!nodeData) {
            return emptyArray;
          }
          const out = 'validations' in nodeData ? nodeData.validations : undefined;
          return out && out.length > 0 ? out : emptyArray;
        }),
      // Used to identify validation errors bound to a node
      useRawDataModelValidationsForAllNodes: () =>
        store.useSelector((state) => {
          const nodes = state.nodes?.allNodes(new TraversalTask(state, state.nodes, undefined, undefined));
          if (!nodes) {
            return emptyArray;
          }
          const out: AnyValidation[] = [];
          for (const node of nodes) {
            const nodeData = state.nodeData[node.id];
            if (!nodeData) {
              continue;
            }
            if ('validations' in nodeData) {
              out.push(...nodeData.validations.filter((v) => '_raw' in v).map((v) => v._raw as AnyValidation));
            }
          }

          return out.length ? out : emptyArray;
        }),
      useVisibleValidations: (node, severity) => {
        const isHidden = Hidden.useIsHidden(node);
        return store.useSelector((state) => {
          if (!node || isHidden) {
            return emptyArray;
          }
          const nodeData = state.nodeData[node.id];
          if (!nodeData) {
            return emptyArray;
          }
          const visibility = 'validationVisibility' in nodeData ? nodeData.validationVisibility : 0;
          const out =
            'validations' in nodeData ? selectValidations(nodeData.validations, visibility, severity) : undefined;
          return out && out.length > 0 ? out : emptyArray;
        });
      },
      useValidationsSelector: () => {
        const hiddenSelector = Hidden.useIsHiddenSelector();
        return store.useDelayedSelector(...selectorArgs(hiddenSelector)) as unknown as ValidationsSelector;
      },
      useLaxValidationsSelector: () => {
        const hiddenSelector = Hidden.useLaxIsHiddenSelector();
        return store.useLaxDelayedSelector(...selectorArgs(hiddenSelector)) as unknown as ValidationsSelector;
      },
    };

    return { ...out };
  }
}
