import { watchFetchJsonSchemaSaga } from 'src/features/datamodel/fetchFormDatamodelSagas';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type {
  IDataModelState,
  IFetchJsonSchemaFulfilled,
  IFetchJsonSchemaRejected,
} from 'src/features/datamodel/index';
import type { MkActionType } from 'src/redux/sagaSlice';

const initialState: IDataModelState = {
  schemas: {},
  error: null,
};

export const formDataModelSlice = createSagaSlice((mkAction: MkActionType<IDataModelState>) => ({
  name: 'formDataModel',
  initialState,
  actions: {
    fetchJsonSchema: mkAction<void>({
      saga: () => watchFetchJsonSchemaSaga,
    }),
    fetchJsonSchemaFulfilled: mkAction<IFetchJsonSchemaFulfilled>({
      reducer: (state, action) => {
        const { schema, id } = action.payload;
        state.schemas[id] = schema;
      },
    }),
    fetchJsonSchemaRejected: mkAction<IFetchJsonSchemaRejected>({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
  },
}));

export const DataModelActions = formDataModelSlice.actions;
