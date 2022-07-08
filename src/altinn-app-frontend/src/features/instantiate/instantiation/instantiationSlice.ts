import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAction } from '@reduxjs/toolkit';
import type {
  IInstantiationState,
  IInstantiateFulfilled,
  IInstantiateRejected,
  IInstantiate,
} from '.';

const initialState: IInstantiationState = {
  instantiating: false,
  instanceId: null,
  error: null,
};

const name = 'instantiation';
const instantiationSlice = createSlice({
  name,
  initialState,
  reducers: {
    instantiateFulfilled: (
      state,
      action: PayloadAction<IInstantiateFulfilled>,
    ) => {
      state.instanceId = action.payload.instanceId;
    },
    instantiateRejected: (
      state,
      action: PayloadAction<IInstantiateRejected>,
    ) => {
      state.error = action.payload.error;
      state.instantiating = false;
    },
    instantiateToggle: (state) => {
      state.instantiating = !state.instantiating;
    },
  },
});

const actions = {
  instantiate: createAction<IInstantiate>(`${name}/instantiate`),
};

export const InstantiationActions = {
  ...instantiationSlice.actions,
  ...actions,
};
export default instantiationSlice;
