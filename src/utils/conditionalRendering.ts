import { splitDashedKey } from 'src/utils/splitDashedKey';
import type { IConditionalRenderingRule, IConditionalRenderingRules } from 'src/features/form/dynamics';
import type { FormDataSelector } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';
import type { NodeTraversalSelectorSilent } from 'src/utils/layout/useNodeTraversal';

/**
 * Runs conditional rendering rules, returns Set of hidden component IDs
 */
export function runConditionalRenderingRules(
  rules: IConditionalRenderingRules | null,
  nodes: LayoutPages,
  formDataSelector: FormDataSelector,
  nodeTraversal: NodeTraversalSelectorSilent,
): Set<string> {
  const componentsToHide = new Set<string>();
  if (!window.conditionalRuleHandlerObject) {
    // rules have not been initialized
    return componentsToHide;
  }

  if (!rules || Object.keys(rules).length === 0) {
    return componentsToHide;
  }

  const topLevelNode = nodeTraversal((t) => {
    const firstPage = t.firstChild();
    if (!firstPage) {
      return undefined;
    }
    return t.with(firstPage).firstChild();
  }, []) as LayoutNode | undefined;

  for (const key of Object.keys(rules)) {
    if (!key) {
      continue;
    }

    const connection: IConditionalRenderingRule = rules[key];
    if (connection.repeatingGroup) {
      const groupId = connection.repeatingGroup.groupId;
      const node = nodeTraversal((t) => t.findById(groupId), [groupId]);
      if (node?.isType('RepeatingGroup')) {
        for (const row of node.item.rows) {
          const firstChild = row.items[0];
          const firstChildId = firstChild?.nodeRef;
          const firstChildNode = nodeTraversal((t) => t.findById(firstChildId), [firstChildId]);
          runConditionalRenderingRule(connection, firstChildNode, componentsToHide, formDataSelector);
          if (connection.repeatingGroup.childGroupId) {
            const childGroupId = connection.repeatingGroup.childGroupId;
            const childNode = nodeTraversal(
              (t) =>
                t.with(node).flat((i) => i.type === 'node' && i.item.baseComponentId === childGroupId, {
                  onlyInRowUuid: row.uuid,
                })?.[0],
              [node, childGroupId, row.uuid],
            );
            if (childNode && childNode.isType('RepeatingGroup')) {
              for (const childRow of childNode.item.rows) {
                const firstNestedChild = childRow.items[0];
                const firstNestedChildNode = nodes.findById(firstNestedChild?.nodeRef);
                runConditionalRenderingRule(connection, firstNestedChildNode, componentsToHide, formDataSelector);
              }
            }
          }
        }
      }
    } else {
      runConditionalRenderingRule(connection, topLevelNode, componentsToHide, formDataSelector);
    }
  }

  return componentsToHide;
}

function runConditionalRenderingRule(
  rule: IConditionalRenderingRule,
  node: LayoutNode | undefined,
  hiddenFields: Set<string>,
  formDataSelector: FormDataSelector,
) {
  const functionToRun = rule.selectedFunction;
  const inputKeys = Object.keys(rule.inputParams);

  const inputObj = {} as Record<string, string | number | boolean | null>;
  for (const key of inputKeys) {
    const param = rule.inputParams[key].replace(/{\d+}/g, '');
    const transposed = node?.transposeDataModel(param) ?? param;
    const value = formDataSelector(transposed);

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      inputObj[key] = value;
    } else {
      inputObj[key] = null;
    }
  }

  const result = window.conditionalRuleHandlerObject[functionToRun](inputObj);
  const action = rule.selectedAction;
  const hide = (action === 'Show' && !result) || (action === 'Hide' && result);

  const splitId = splitDashedKey(node?.getId() ?? '');
  for (const elementToPerformActionOn of Object.keys(rule.selectedFields)) {
    if (elementToPerformActionOn && hide) {
      const elementId = rule.selectedFields[elementToPerformActionOn].replace(/{\d+}/g, (match) => {
        const index = match.replace(/[{}]/g, '');
        return `-${splitId.depth[index]}`;
      });

      hiddenFields.add(elementId);
    }
  }
}
