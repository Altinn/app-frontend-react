import type { IRuleConnections } from 'src/features/dynamics';
import type { IFormData } from 'src/features/formData';
import type { DataModelChange } from 'src/features/formData2/StateMachine';

/**
 * This function has been copied from checkIfRuleShouldRun() and modified to work with the new formData feature.
 * It runs the legacy rules after a field has been updated.
 *
 * @see checkIfRuleShouldRun
 */
export function runLegacyRules(
  ruleConnectionState: IRuleConnections | null,
  formData: IFormData,
  updatedDateBindings: Set<string>,
) {
  const changes: DataModelChange[] = [];
  if (!ruleConnectionState) {
    return changes;
  }

  for (const connection of Object.keys(ruleConnectionState)) {
    if (!connection) {
      continue;
    }

    const connectionDef = ruleConnectionState[connection];
    const functionToRun: string = connectionDef.selectedFunction;
    let shouldRunFunction = false;

    for (const inputParam of Object.keys(connectionDef.inputParams)) {
      if (inputParam && updatedDateBindings.has(connectionDef.inputParams[inputParam])) {
        shouldRunFunction = true;
      }
    }

    for (const outParam of Object.keys(connectionDef.outParams)) {
      if (!outParam) {
        shouldRunFunction = false;
      }
    }

    if (!shouldRunFunction) {
      continue;
    }

    const objectToUpdate = window.ruleHandlerHelper[functionToRun]();
    if (Object.keys(objectToUpdate).length < 1) {
      continue;
    }

    const newObj = Object.keys(objectToUpdate).reduce((acc, elem) => {
      const inputParamBinding = connectionDef.inputParams[elem];
      acc[elem] = formData && formData[inputParamBinding];
      return acc;
    }, {});

    const result = window.ruleHandlerObject[functionToRun](newObj);
    const updatedDataBinding = connectionDef.outParams.outParam0;

    if (updatedDataBinding) {
      changes.push({
        path: updatedDataBinding,
        newValue: result.toString(),
      });
    }
  }

  return changes;
}
