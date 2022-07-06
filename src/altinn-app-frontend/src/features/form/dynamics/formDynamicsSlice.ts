import type {
  IFormDynamicState,
  IFetchServiceConfigFulfilled,
  IFetchServiceConfigRejected,
  ICheckIfConditionalRulesShouldRun,
} from 'src/features/form/dynamics/index';
import { createSagaSlice } from 'src/features/form/dynamics/experiment';
import { takeLatest, call, all, take } from 'redux-saga/effects';
import { fetchDynamicsSaga } from 'src/features/form/dynamics/fetch/fetchFormDynamicsSagas';
import { checkIfConditionalRulesShouldRunSaga } from 'src/features/form/dynamics/conditionalRendering/conditionalRenderingSagas';
import { FormRulesActions } from '../rules/rulesSlice';
import { FormDataActions } from '../data/formDataSlice';
import { FormLayoutActions } from '../layout/formLayoutSlice';

const initialState: IFormDynamicState = {
  ruleConnection: {},
  conditionalRendering: {},
  apis: undefined,
  error: null,
};

const slice = createSagaSlice(
  {
    name: 'formDynamics',
    initialState,
  },
  (mkAction) => ({
    checkIfConditionalRulesShouldRun:
      mkAction<ICheckIfConditionalRulesShouldRun>({
        saga: [
          function* () {
            yield takeLatest(
              FormDynamicsActions.checkIfConditionalRulesShouldRun,
              checkIfConditionalRulesShouldRunSaga,
            );
          },
          function* () {
            while (true) {
              yield all([
                take(FormLayoutActions.fetchFulfilled),
                take(FormDataActions.fetchFulfilled),
                take(FormDynamicsActions.fetchFulfilled),
                take(FormRulesActions.fetchFulfilled),
              ]);
              yield call(checkIfConditionalRulesShouldRunSaga);
            }
          },
        ],
      }),
    fetch: mkAction<IFetchServiceConfigFulfilled>({
      saga: function* () {
        yield takeLatest(
          FormDynamicsActions.fetchFormDynamics,
          fetchDynamicsSaga,
        );
      },
    }),
    fetchFulfilled: mkAction<IFetchServiceConfigFulfilled>({
      reducer: (state, action) => {
        state.apis = action.payload.apis;
        state.ruleConnection = action.payload.ruleConnection;
        state.conditionalRendering = action.payload.conditionalRendering;
        state.error = null;
      },
    }),
    fetchRejected: mkAction<IFetchServiceConfigRejected>({
      reducer: (state, action) => {
        state.error = action.payload.error;
      },
    }),
  }),
);

export const FormDynamicsActions = slice.actions;
export default slice;
