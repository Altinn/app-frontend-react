import dot from 'dot-object';
import deepEqual from 'fast-deep-equal';
import { applyPatch } from 'fast-json-patch';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { convertData } from 'src/features/formData/convertData';
import { createPatch } from 'src/features/formData/jsonPatch/createPatch';
import { runLegacyRules } from 'src/features/formData/LegacyRules';
import { DEFAULT_DEBOUNCE_TIMEOUT } from 'src/features/formData/types';
import type { SchemaLookupTool } from 'src/features/datamodel/DataModelSchemaProvider';
import type { IRuleConnections } from 'src/features/form/dynamics';
import type { FDLeafValue } from 'src/features/formData/FormDataWrite';
import type { FormDataWriteProxies, Proxy } from 'src/features/formData/FormDataWriteProxies';
import type { JsonPatch } from 'src/features/formData/jsonPatch/types';
import type { BackendValidationIssueGroups } from 'src/features/validation';
import type { IDataModelReference } from 'src/layout/common.generated';

export interface DataModelState {
  // These values contain the current data model, with the values immediately available whenever the user is typing.
  // Use these values to render the form, and for other cases where you need the current data model immediately.
  currentData: object;

  // This is a partial object containing potential invalid data, In the currentData object, these values will be
  // missing/undefined. The point of these values is for the data model to _seem like_ it can store anything, even
  // though some values are simply not valid according to the JsonSchema we need to follow. This is useful for example
  // when the user is typing a number, as the current model is updated for every keystroke, but if the user
  // types '-5', the model will be invalid until the user types the '5' as well. This way we can show the user the
  // value they are typing, as they are typing it, while also keeping it away from the data model until it is valid
  // to store in it.
  invalidCurrentData: object;

  // These values contain the current data model, with the values debounced at 400ms. This means that if the user is
  // typing, the values will be updated 400ms after the user stopped typing. Use these values when you need to perform
  // expensive operations on the data model, such as validation, calculations, or sending a request to save the model.
  debouncedCurrentData: object;

  // This is a debounced variant of the invalidCurrentData model. This is useful for example when you want to show
  // validation errors to the user, but you don't want to show them immediately as the user is typing. Instead,
  // should wait until the user has stopped typing for a while, and then show the validation errors based off of
  // this model.
  invalidDebouncedCurrentData: object;

  // These values contain the last saved data model, with the values that were last saved to the server. We use this
  // to determine if there are any unsaved changes, and to diff the current data model against the last saved data
  // model when saving. You probably don't need to use these values directly unless you know what you're doing.
  lastSavedData: object;

  // This contains the validation issues we receive from the server last time we saved the data model.
  validationIssues: BackendValidationIssueGroups | undefined;

  // The time in milliseconds to debounce the currentData model. This is used to determine how long to wait after the
  // user has stopped typing before updating that data into the debouncedCurrentData model. Usually this will follow
  // the default value, it can also be changed at any time by each component that uses the FormDataWriter.
  debounceTimeout: number;

  // This is the url to use when saving the data model to the server. This can also be used to uniquely identify
  // the data model, so that we can save multiple data models to the server at the same time.
  saveUrl: string;

  // This identifies the specific data element in storage. This is needed for identifying the correct model when receiving updates from the server.
  dataElementId: string;
}

type FormDataState = {
  // Data model state
  dataModels: { [dataType: string]: DataModelState };

  // Auto-saving is turned on by default, and will automatically save the data model to the server whenever the
  // debouncedCurrentData model changes. This can be turned off when, for example, you want to save the data model
  // only when the user navigates to another page.
  autoSaving: boolean;

  // This is used to track whether the user has requested a manual save. When auto-saving is turned off, this is
  // the way we track when to save the data model to the server. It can also be used to trigger a manual save
  // as a way to immediately save the data model to the server, for example before locking the data model.
  manualSaveRequested: boolean;

  // This is used to track which component is currently blocking the auto-saving feature. If this is set to a string
  // value, auto-saving will be disabled, even if the autoSaving flag is set to true. This is useful when you want
  // to temporarily disable auto-saving, for example when clicking a CustomButton and waiting for the server to
  // respond. The server might read the data model, change it, and return changes back to the client, which could
  // cause data loss if we were to auto-save the data model while the server is still processing the request.
  lockedBy: string | undefined;
};

export interface FDChange {
  // Overrides the timeout before the change is applied to the debounced data model. If not set, the default
  // timeout is used. The debouncing may also happen sooner than you think, if the user continues typing in
  // a form field that has a lower timeout. This is because the debouncing is global, not per field.
  debounceTimeout?: number;
}

export interface FDNewValue extends FDChange {
  reference: IDataModelReference;
  newValue: FDLeafValue;
}

export interface FDNewValues extends FDChange {
  changes: FDNewValue[];
}

export interface FDAppendToListUnique {
  reference: IDataModelReference;
  newValue: any;
}

export interface FDAppendToList {
  reference: IDataModelReference;
  newValue: any;
}

export interface FDRemoveIndexFromList {
  reference: IDataModelReference;
  index: number;
}

export interface FDRemoveValueFromList {
  reference: IDataModelReference;
  value: any;
}

export interface FDRemoveFromListCallback {
  reference: IDataModelReference;
  startAtIndex?: number;
  callback: (value: any) => boolean;
}

export interface FDSaveResult {
  newDataModel: object;
  validationIssues: BackendValidationIssueGroups | undefined;
}

export interface FDActionResult {
  updatedDataModels: {
    [dataElementId: string]: object;
  };
  updatedValidationIssues: {
    [dataElementId: string]: BackendValidationIssueGroups | undefined;
  };
}

export interface FDSaveFinished extends FDSaveResult {
  patch?: JsonPatch;
  savedData: object;
}

export interface FormDataMethods {
  // Methods used for updating the data model. These methods will update the currentData model, and after
  // the debounce() method is called, the debouncedCurrentData model will be updated as well.
  setLeafValue: (change: FDNewValue) => void;
  setMultiLeafValues: (changes: FDNewValues) => void;
  appendToListUnique: (change: FDAppendToListUnique) => void;
  appendToList: (change: FDAppendToList) => void;
  removeIndexFromList: (change: FDRemoveIndexFromList) => void;
  removeValueFromList: (change: FDRemoveValueFromList) => void;
  removeFromListCallback: (change: FDRemoveFromListCallback) => void;

  // Internal utility methods
  debounce: (dataType: string) => void;
  cancelSave: (dataType: string) => void;
  saveFinished: (dataType: string, props: FDSaveFinished) => void;
  requestManualSave: (setTo?: boolean) => void;
  lock: (lockName: string) => void;
  unlock: (saveResult?: FDActionResult) => void;
}

export type FormDataContext = FormDataState & FormDataMethods;

function makeActions(
  set: (fn: (state: FormDataContext) => void) => void,
  ruleConnections: IRuleConnections | null,
  schemaLookup: SchemaLookupTool,
): FormDataMethods {
  function setDebounceTimeout(state: FormDataContext, dataType: string, change: FDChange) {
    state.dataModels[dataType].debounceTimeout = change.debounceTimeout ?? DEFAULT_DEBOUNCE_TIMEOUT;
  }

  /**
   * Deduplicate the current data model and the debounced data model. This is used to prevent unnecessary
   * copies of the data model when the content inside them is the same. We do this when debouncing and saving,
   * as deepEqual is a fairly expensive operation, and the object references has to be the same for hasUnsavedChanges
   * to work properly.
   */
  function deduplicateModels(state: FormDataContext, dataType: string) {
    const { currentData, debouncedCurrentData, lastSavedData } = state.dataModels[dataType];
    const models = [
      { key: 'currentData', model: currentData },
      { key: 'debouncedCurrentData', model: debouncedCurrentData },
      { key: 'lastSavedData', model: lastSavedData },
    ];

    const currentIsDebounced = currentData === debouncedCurrentData;
    const currentIsSaved = currentData === lastSavedData;
    const debouncedIsSaved = debouncedCurrentData === lastSavedData;
    if (currentIsDebounced && currentIsSaved && debouncedIsSaved) {
      return;
    }

    for (const modelA of models) {
      for (const modelB of models) {
        if (modelA.model === modelB.model) {
          continue;
        }
        if (deepEqual(modelA.model, modelB.model)) {
          state.dataModels[dataType][modelB.key] = modelA.model;
          modelB.model = modelA.model;
        }
      }
    }
  }

  function processChanges(
    state: FormDataContext,
    dataType: string,
    { newDataModel, savedData }: Pick<FDSaveFinished, 'newDataModel' | 'patch' | 'savedData'>,
  ) {
    if (newDataModel) {
      const backendChangesPatch = createPatch({
        prev: savedData,
        next: newDataModel,
        current: state.dataModels[dataType].currentData,
      });
      applyPatch(state.dataModels[dataType].currentData, backendChangesPatch);
      state.dataModels[dataType].lastSavedData = newDataModel;

      // Run rules again, against current data. Now that we have updates from the backend, some rules may
      // have caused data to change.
      const ruleResults = runLegacyRules(ruleConnections, savedData, state.dataModels[dataType].currentData, dataType);
      for (const { reference, newValue } of ruleResults) {
        dot.str(reference.property, newValue, state.dataModels[dataType].currentData);
      }
    } else {
      state.dataModels[dataType].lastSavedData = savedData;
    }
    deduplicateModels(state, dataType);
  }

  function debounce(state: FormDataContext, dataType: string) {
    state.dataModels[dataType].invalidDebouncedCurrentData = state.dataModels[dataType].invalidCurrentData;
    if (deepEqual(state.dataModels[dataType].debouncedCurrentData, state.dataModels[dataType].currentData)) {
      state.dataModels[dataType].debouncedCurrentData = state.dataModels[dataType].currentData;
      return;
    }

    const ruleChanges = runLegacyRules(
      ruleConnections,
      state.dataModels[dataType].debouncedCurrentData,
      state.dataModels[dataType].currentData,
      dataType,
    );
    for (const { reference, newValue } of ruleChanges) {
      dot.str(reference.property, newValue, state.dataModels[dataType].currentData);
    }

    state.dataModels[dataType].debouncedCurrentData = state.dataModels[dataType].currentData;
  }

  function setValue(props: { reference: IDataModelReference; newValue: FDLeafValue; state: FormDataContext }) {
    const { reference, newValue, state } = props;
    if (newValue === '' || newValue === null || newValue === undefined) {
      dot.delete(reference.property, state.dataModels[reference.dataType].currentData);
      dot.delete(reference.property, state.dataModels[reference.dataType].invalidCurrentData);
    } else {
      const schema = schemaLookup.getSchemaForPath(reference.property)[0];
      const { newValue: convertedValue, error } = convertData(newValue, schema);
      if (error) {
        dot.delete(reference.property, state.dataModels[reference.dataType].currentData);
        dot.str(reference.property, newValue, state.dataModels[reference.dataType].invalidCurrentData);
      } else {
        dot.delete(reference.property, state.dataModels[reference.dataType].invalidCurrentData);
        dot.str(reference.property, convertedValue, state.dataModels[reference.dataType].currentData);
      }
    }
  }

  return {
    debounce: (dataType) =>
      set((state) => {
        debounce(state, dataType);
      }),
    cancelSave: (dataType) =>
      set((state) => {
        // TODO(Datamodels): How should this be handled?
        // state.dataModels[dataType].controlState.manualSaveRequested = false;
        // First try:
        state.manualSaveRequested = false;
        deduplicateModels(state, dataType);
      }),
    saveFinished: (dataType, props) =>
      set((state) => {
        const { validationIssues } = props;
        state.dataModels[dataType].validationIssues = validationIssues;
        // TODO(Datamodels): How should this be handled?
        // state.dataModels[dataType].controlState.manualSaveRequested = false;
        // First try:
        state.manualSaveRequested = false;
        processChanges(state, dataType, props);
      }),
    setLeafValue: ({ reference, newValue, ...rest }) =>
      set((state) => {
        const existingValue = dot.pick(reference.property, state.dataModels[reference.dataType].currentData);
        if (existingValue === newValue) {
          return;
        }

        setDebounceTimeout(state, reference.dataType, rest);
        setValue({ newValue, reference, state });
      }),

    // All the list methods perform their work immediately, without debouncing, so that UI updates for new/removed
    // list items are immediate.
    appendToListUnique: ({ reference, newValue }) =>
      set((state) => {
        const existingValue = dot.pick(reference.property, state.dataModels[reference.dataType].currentData);
        if (Array.isArray(existingValue) && existingValue.includes(newValue)) {
          return;
        }

        if (Array.isArray(existingValue)) {
          existingValue.push(newValue);
        } else {
          dot.str(reference.property, [newValue], state.dataModels[reference.dataType].currentData);
        }
      }),
    appendToList: ({ reference, newValue }) =>
      set((state) => {
        const existingValue = dot.pick(reference.property, state.dataModels[reference.dataType].currentData);

        if (Array.isArray(existingValue)) {
          existingValue.push(newValue);
        } else {
          dot.str(reference.property, [newValue], state.dataModels[reference.dataType].currentData);
        }
      }),
    removeIndexFromList: ({ reference, index }) =>
      set((state) => {
        const existingValue = dot.pick(reference.property, state.dataModels[reference.dataType].currentData);
        if (index >= existingValue.length) {
          return;
        }

        existingValue.splice(index, 1);
      }),
    removeValueFromList: ({ reference, value }) =>
      set((state) => {
        const existingValue = dot.pick(reference.property, state.dataModels[reference.dataType].currentData);
        if (!existingValue.includes(value)) {
          return;
        }

        existingValue.splice(existingValue.indexOf(value), 1);
      }),
    removeFromListCallback: ({ reference, startAtIndex, callback }) =>
      set((state) => {
        const existingValue = dot.pick(reference.property, state.dataModels[reference.dataType].currentData);
        if (!Array.isArray(existingValue)) {
          return;
        }

        if (
          startAtIndex !== undefined &&
          startAtIndex >= 0 &&
          startAtIndex < existingValue.length &&
          callback(existingValue[startAtIndex])
        ) {
          existingValue.splice(startAtIndex, 1);
          return;
        }

        // Continue looking for the item to remove from the start of the list if we didn't find it at the start index
        let index = 0;
        while (index < existingValue.length) {
          if (callback(existingValue[index])) {
            existingValue.splice(index, 1);
            return;
          }
          index++;
        }
      }),

    setMultiLeafValues: ({ changes, ...rest }) =>
      set((state) => {
        const changedTypes = new Set<string>();
        for (const { reference, newValue } of changes) {
          const existingValue = dot.pick(reference.property, state.dataModels[reference.dataType].currentData);
          if (existingValue === newValue) {
            continue;
          }
          setValue({ newValue, reference, state });
          changedTypes.add(reference.dataType);
        }
        for (const dataType of changedTypes) {
          setDebounceTimeout(state, dataType, rest);
        }
      }),
    requestManualSave: (setTo = true) =>
      set((state) => {
        state.manualSaveRequested = setTo;
      }),
    lock: (lockName) =>
      set((state) => {
        state.lockedBy = lockName;
      }),
    unlock: (actionResult) =>
      set((state) => {
        state.lockedBy = undefined;
        // Update form data
        if (actionResult?.updatedDataModels) {
          // TODO(Datamodels): How should this be handled?
          // state.dataModels[dataType].controlState.manualSaveRequested = false;
          // First try:
          state.manualSaveRequested = false;
          for (const [dataElementId, newDataModel] of Object.entries(actionResult.updatedDataModels)) {
            if (newDataModel) {
              const dataModelTuple = Object.entries(state.dataModels).find(
                ([_, dataModel]) => dataModel.dataElementId === dataElementId,
              );
              if (dataModelTuple) {
                const [dataType, dataModel] = dataModelTuple;
                processChanges(state, dataType, { newDataModel, savedData: dataModel.lastSavedData });
              } else {
                window.logError(
                  `Tried to update form data for data element '${dataElementId}', but no such data element was found in the FormDataWrite context.`,
                );
              }
            }
          }
        }
        // Update validation issues
        if (actionResult?.updatedValidationIssues) {
          for (const [dataElementId, validationIssues] of Object.entries(actionResult.updatedValidationIssues)) {
            if (validationIssues) {
              const dataModel = Object.values(state.dataModels).find(
                (dataModel) => dataModel.dataElementId === dataElementId,
              );
              if (dataModel) {
                dataModel.validationIssues = validationIssues;
              } else {
                window.logError(
                  `Tried to update validationIssues for data element '${dataElementId}', but no such data element was found in the FormDataWrite context.`,
                );
              }
            }
          }
        }
      }),
  };
}

export const createFormDataWriteStore = (
  url: string,
  dataElementId: string,
  initialData: object,
  autoSaving: boolean,
  proxies: FormDataWriteProxies,
  ruleConnections: IRuleConnections | null,
  schemaLookup: SchemaLookupTool,
) =>
  createStore<FormDataContext>()(
    immer((set) => {
      const actions = makeActions(set, ruleConnections, schemaLookup);
      for (const name of Object.keys(actions)) {
        const fnName = name as keyof FormDataMethods;
        const original = actions[fnName];
        const proxyFn = proxies[fnName] as Proxy<keyof FormDataMethods>;
        const { proxy, method } = proxyFn(original);
        actions[fnName] = (...args: any[]) => {
          proxy({ args: args as any, toCall: method });
        };
      }

      const emptyInvalidData = {};
      return {
        dataModels: {
          // TODO(Datamodels): Fix this somehow
          __default__: {
            currentData: initialData,
            invalidCurrentData: emptyInvalidData,
            debouncedCurrentData: initialData,
            invalidDebouncedCurrentData: emptyInvalidData,
            lastSavedData: initialData,
            hasUnsavedChanges: false,
            validationIssues: undefined,
            debounceTimeout: DEFAULT_DEBOUNCE_TIMEOUT,
            saveUrl: url,
            dataElementId,
          },
        },
        autoSaving,
        manualSaveRequested: false,
        lockedBy: undefined,
        ...actions,
      };
    }),
  );
