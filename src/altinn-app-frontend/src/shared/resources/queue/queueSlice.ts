import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { IQueueError, IQueueState } from '.';

const commonState = { isDone: null, error: null };
export const initialState: IQueueState = {
  dataTask: { ...commonState },
  appTask: { ...commonState },
  userTask: { ...commonState },
  infoTask: { ...commonState },
  stateless: { ...commonState },
};

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    appTaskQueueError: (state, action: PayloadAction<IQueueError>) => {
      const { error } = action.payload;
      state.appTask.error = error;
    },
    userTaskQueueError: (state, action: PayloadAction<IQueueError>) => {
      const { error } = action.payload;
      state.userTask.error = error;
    },
    dataTaskQueueError: (state, action: PayloadAction<IQueueError>) => {
      const { error } = action.payload;
      state.dataTask.error = error;
    },
    infoTaskQueueError: (state, action: PayloadAction<IQueueError>) => {
      const { error } = action.payload;
      state.infoTask.error = error;
    },
    statelessQueueError: (state, action: PayloadAction<IQueueError>) => {
      const { error } = action.payload;
      state.stateless.error = error;
    },
    startInitialAppTaskQueue: (state) => {
      state.appTask.isDone = false;
    },
    startInitialAppTaskQueueFulfilled: (state) => {
      state.appTask.isDone = true;
    },
    startInitialUserTaskQueue: (state) => {
      state.userTask.isDone = false;
    },
    startInitialUserTaskQueueFulfilled: (state) => {
      state.userTask.isDone = true;
    },
    startInitialDataTaskQueue: (state) => {
      state.dataTask.isDone = false;
    },
    startInitialDataTaskQueueFulfilled: (state) => {
      state.dataTask.isDone = true;
    },
    startInitialInfoTaskQueue: (state) => {
      state.infoTask.isDone = false;
    },
    startInitialInfoTaskQueueFulfilled: (state) => {
      state.infoTask.isDone = true;
    },
    startInitialStatelessQueue: (state) => {
      state.stateless.isDone = false;
    },
    startInitialStatelessQueueFulfilled: (state) => {
      state.stateless.isDone = true;
    },
  },
});

export const QueueActions = queueSlice.actions;
export default queueSlice;
