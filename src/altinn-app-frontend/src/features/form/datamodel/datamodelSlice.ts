import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

export interface IJsonSchemas {
  [id: string]: object;
}

export interface IDataModelState {
  schemas: IJsonSchemas;
  error: Error;
}

export interface IFetchJsonSchemaFulfilled {
  schema: object;
  id: string;
}

export interface IFetchJsonSchemaRejected {
  error: Error;
}

const initialState: IDataModelState = {
  schemas: {},
  error: null,
};

const moduleName = 'formDataModel';
const formDataModelSlice = createSlice({
  name: moduleName,
  initialState,
  reducers: {
    fetchJsonSchemaFulfilled: (
      state,
      action: PayloadAction<IFetchJsonSchemaFulfilled>,
    ) => {
      const { schema, id } = action.payload;
      state.schemas[id] = schema;
    },
    fetchJsonSchemaRejected: (
      state,
      action: PayloadAction<IFetchJsonSchemaRejected>,
    ) => {
      const { error } = action.payload;
      state.error = error;
    },
  },
});

export const fetchJsonSchema = createAction(`${moduleName}/fetchJsonSchema`);

export const { fetchJsonSchemaFulfilled, fetchJsonSchemaRejected } =
  formDataModelSlice.actions;

export default formDataModelSlice;
