import { getDataTaskDataTypeId } from 'src/utils/appMetadata';
import { convertDataBindingToModel } from 'src/utils/databindings';
import { resolvedLayoutsFromState } from 'src/utils/layout/hierarchy';
import {
  getValidator,
  validateEmptyFields,
  validateFormComponents,
  validateFormData,
} from 'src/utils/validation/validation';
import type { IRuntimeState } from 'src/types';

/**
 * Runs client side validations on state.
 * @param state
 */
export function runClientSideValidation(state: IRuntimeState) {
  const currentDataTaskDataTypeId = getDataTaskDataTypeId(
    state.instanceData.instance.process.currentTask.elementId,
    state.applicationMetadata.applicationMetadata.dataTypes,
  );
  const model = convertDataBindingToModel(state.formData.formData);
  const validator = getValidator(
    currentDataTaskDataTypeId,
    state.formDataModel.schemas,
  );

  const hiddenFields = new Set(state.formLayout.uiConfig.hiddenFields);

  const layouts = resolvedLayoutsFromState(state);
  const validationResult = validateFormData(
    model,
    layouts,
    state.formLayout.uiConfig.layoutOrder,
    validator,
    state.language.language,
    state.textResources.resources,
  );
  const componentSpecificValidations = validateFormComponents(
    state.attachments.attachments,
    layouts,
    state.formLayout.uiConfig.layoutOrder,
    state.formData.formData,
    state.language.language,
    hiddenFields,
  );
  const emptyFieldsValidations = validateEmptyFields(
    state.formData.formData,
    layouts,
    state.formLayout.uiConfig.layoutOrder,
    state.language.language,
    hiddenFields,
    state.textResources.resources,
  );
  return {
    model,
    validationResult,
    componentSpecificValidations,
    emptyFieldsValidations,
  };
}
