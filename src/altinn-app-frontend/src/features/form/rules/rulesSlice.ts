import type {
  IFormRuleState,
  IFetchRuleModelFulfilled,
  IFetchRuleModelRejected,
} from 'src/features/form/rules/index';
import type { MkActionType } from 'src/shared/resources/utils/sagaSlice';
import { createSagaSlice } from 'src/shared/resources/utils/sagaSlice';
import { fetchRuleModelSaga } from 'src/features/form/rules/fetch/fetchRulesSagas';

const initialState: IFormRuleState = {
  model: [],
  fetching: false,
  fetched: false,
  error: null,
};

const name = 'formRules';
const rulesSlice = createSagaSlice(
  (mkAction: MkActionType<IFormRuleState>) => ({
    name,
    initialState,
    actions: {
      fetch: mkAction<void>({
        takeLatest: fetchRuleModelSaga,
        reducer: (state) => {
          state.fetched = false;
          state.fetching = true;
          state.error = null;
        },
      }),
      fetchFulfilled: mkAction<IFetchRuleModelFulfilled>({
        reducer: (state, action) => {
          state.fetched = true;
          state.fetching = false;
          state.error = null;
          state.model = action.payload.ruleModel;
        },
      }),
      fetchRejected: mkAction<IFetchRuleModelRejected>({
        reducer: (state, action) => {
          state.fetched = false;
          state.fetching = false;
          state.error = action.payload.error;
        },
      }),
    },
  }),
);

export const FormRulesActions = rulesSlice.actions;
export default rulesSlice;
