import React, { useEffect, useMemo } from 'react';

import { useDynamics } from 'src/features/form/dynamics/DynamicsContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useDataModelBindingTranspose } from 'src/utils/layout/useDataModelBindingTranspose';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { useNodeTraversal } from 'src/utils/layout/useNodeTraversal';
import { splitDashedKey } from 'src/utils/splitDashedKey';
import type { IConditionalRenderingRule } from 'src/features/form/dynamics/index';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * This replaces checkIfConditionalRulesShouldRunSaga(), and fixes a problem that was hard to solve in sagas;
 * namely, that expressions that cause a component to suddenly be visible might also cause other component lookups
 * to start producing a value, so we don't really know how many times we need to run the expressions to reach
 * a stable state. As React hooks are...reactive, we can just run the expressions again when the data changes, and
 * thus continually run the expressions until they stabilize. You _could_ run into an infinite loop if you
 * have a circular dependency in your expressions, but that's a problem with your form, not this code.
 */
export function HiddenComponentsProvider() {
  const rules = useDynamics()?.conditionalRendering ?? null;

  if (!window.conditionalRuleHandlerObject || !rules) {
    // Rules have not been initialized
    return null;
  }

  return (
    <>
      {Object.keys(rules).map((key) =>
        rules[key].repeatingGroup?.groupId && rules[key].repeatingGroup?.childGroupId ? (
          <RuleRunnerNestedGroup
            key={key}
            name={key}
          />
        ) : rules[key].repeatingGroup?.groupId ? (
          <RuleRunnerTopLevelGroup
            key={key}
            name={key}
          />
        ) : (
          <RuleRunnerTopLevel
            key={key}
            name={key}
          />
        ),
      )}
    </>
  );
}

function useRule(name: string): IConditionalRenderingRule {
  const rules = useDynamics()!.conditionalRendering!;
  return rules[name]!;
}

interface RuleRunnerProps {
  name: string;
}

interface RuleRunnerWithNodeProps<T extends CompTypes = CompTypes> extends RuleRunnerProps {
  node: LayoutNode<T>;
}

function RuleRunnerNestedGroup({ name }: RuleRunnerProps) {
  const childId = useRule(name).repeatingGroup!.childGroupId;
  return (
    <RuleRunnerTopLevelGroup
      name={name}
      childId={childId}
    />
  );
}

function RuleRunnerTopLevelGroup({ name, childId }: RuleRunnerProps & { childId?: string }) {
  const rule = useRule(name);
  const groupId = rule.repeatingGroup!.groupId!;
  const node = useNodeTraversal((t) => t.findById(groupId));

  if (!node || !node.isType('RepeatingGroup') || node.parent !== node.page) {
    window.logWarn(`Failed to run rule '${name}': Found no top level RepeatingGroup with id '${groupId}'`);
    return null;
  }

  return (
    <RuleRunnerGroup
      name={name}
      node={node}
      childId={childId}
    />
  );
}

interface RuleRunnerGroupProps extends RuleRunnerWithNodeProps<'RepeatingGroup'> {
  childId?: string;
}

function RuleRunnerGroup({ name, node, childId }: RuleRunnerGroupProps) {
  const rows = useNodeItem(node, (i) => i.rows);

  return (
    <>
      {rows.map((row) => {
        const childNode = childId ? row.items.find((item) => item.baseId === childId) : row.items[0];
        if (!childNode && childId) {
          window.logWarn(
            `Failed to run rule '${name}': Found no child node with id '${childId}' in row with uuid '${row.uuid}'`,
          );
          return null;
        }
        if (!childNode) {
          window.logWarn(`Failed to run rule '${name}': Found no first child node in row with uuid '${row.uuid}'`);
          return null;
        }

        if (childId && childNode && childNode.isType('RepeatingGroup')) {
          // Support for nested groups
          return (
            <RuleRunnerGroup
              key={row.uuid}
              name={name}
              node={childNode}
            />
          );
        }

        return (
          <RuleRunnerWithNode
            key={row.uuid}
            name={name}
            node={childNode}
          />
        );
      })}
    </>
  );
}

function RuleRunnerTopLevel({ name }: RuleRunnerProps) {
  const topLevelNode = useNodeTraversal((t) => {
    const firstPage = t.firstChild();
    if (!firstPage) {
      return undefined;
    }
    return t.with(firstPage).firstChild();
  });

  if (!topLevelNode) {
    window.logWarn(`Failed to run rule '${name}': Found no top-level components to base the rule on.`);
    return null;
  }

  return (
    <RuleRunnerWithNode
      name={name}
      node={topLevelNode}
    />
  );
}

function RuleRunnerWithNode({ name, node }: RuleRunnerWithNodeProps) {
  const rule = useRule(name);
  const transposeSelector = useDataModelBindingTranspose();
  const formDataSelector = FD.useDebouncedSelector();
  const { inputParams, selectedFunction, selectedAction, selectedFields } = rule;
  const markHidden = NodesInternal.useMarkHiddenViaRule();

  const [action, result] = useMemo(() => {
    const inputKeys = Object.keys(inputParams);

    const inputObj = {} as Record<string, string | number | boolean | null>;
    for (const key of inputKeys) {
      const param = inputParams[key].replace(/{\d+}/g, '');
      const transposed = node ? transposeSelector(node, param) : param;
      const value = formDataSelector(transposed);

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        inputObj[key] = value;
      } else {
        inputObj[key] = null;
      }
    }

    const action = selectedAction;
    const result = window.conditionalRuleHandlerObject[selectedFunction](inputObj);

    return [action, result];
  }, [formDataSelector, node, inputParams, selectedAction, selectedFunction, transposeSelector]);

  useEffect(() => {
    const hide = (action === 'Show' && !result) || (action === 'Hide' && result);

    const splitId = splitDashedKey(node.id);
    for (const elementToPerformActionOn of Object.keys(selectedFields)) {
      const elementId = selectedFields[elementToPerformActionOn].replace(/{\d+}/g, (match) => {
        const index = match.replace(/[{}]/g, '');
        return `-${splitId.depth[index]}`;
      });
      if (elementToPerformActionOn) {
        markHidden(elementId, hide);
      }
    }
  }, [action, markHidden, node.id, result, selectedFields]);

  return null;
}
