import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAction } from '@reduxjs/toolkit';
import type { IFormDynamicState } from 'src/features/form/dynamics/index';
import type { ICheckIfConditionalRulesShouldRun } from 'src/features/form/dynamics/conditionalRendering/conditionalRenderingActions';
import type {
  IFetchServiceConfigFulfilled,
  IFetchServiceConfigRejected,
} from 'src/features/form/dynamics/fetch/fetchFormDynamicsActions';

const moduleName = 'formDynamics';

const initialState: IFormDynamicState = {
  ruleConnection: {},
  conditionalRendering: {},
  apis: undefined,
  error: null,
};

const formDynamicsSlice = createSlice({
  name: moduleName,
  initialState,
  reducers: {
    fetchFormDynamicsFulfilled: (
      state,
      action: PayloadAction<IFetchServiceConfigFulfilled>,
    ) => {
      state.apis = action.payload.apis;
      state.ruleConnection = action.payload.ruleConnection;
      state.conditionalRendering = action.payload.conditionalRendering;
      state.error = null;
    },
    fetchFormDynamicsRejected: (
      state,
      action: PayloadAction<IFetchServiceConfigRejected>,
    ) => {
      state.error = action.payload.error;
    },
  },
});

const actions = {
  checkIfConditionalRulesShouldRun:
    createAction<ICheckIfConditionalRulesShouldRun>(
      `${moduleName}/checkIfConditionalRulesShouldRun`,
    ),
  fetchFormDynamics: createAction(`${moduleName}/fetchFormDynamics`),
};

export const FormDynamicsActions = {
  ...actions,
  ...formDynamicsSlice.actions,
};
export default formDynamicsSlice.reducer;
