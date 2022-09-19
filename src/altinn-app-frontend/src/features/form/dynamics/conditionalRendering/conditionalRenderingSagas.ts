import { call, put, select } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { evalExpr } from 'src/features/form/layout/expressions';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { ValidationActions } from 'src/features/form/validation/validationSlice';
import { runConditionalRenderingRules } from 'src/utils/conditionalRendering';
import {
  dataSourcesFromState,
  resolvedLayoutsFromState,
} from 'src/utils/layout/hierarchy';
import type { IFormData } from 'src/features/form/data';
import type { IConditionalRenderingRules } from 'src/features/form/dynamics';
import type { ContextDataSources } from 'src/features/form/layout/expressions/LEContext';
import type {
  IHiddenLayoutsExpressions,
  IRuntimeState,
  IUiConfig,
  IValidations,
} from 'src/types';
import type { LayoutRootNodeCollection } from 'src/utils/layout/hierarchy';

export const ConditionalRenderingSelector = (store: IRuntimeState) =>
  store.formDynamics.conditionalRendering;
export const FormDataSelector = (state: IRuntimeState) =>
  state.formData.formData;
export const UiConfigSelector = (state: IRuntimeState) =>
  state.formLayout.uiConfig;
export const FormValidationSelector = (state: IRuntimeState) =>
  state.formValidations.validations;
export const ResolvedNodesSelector = (state: IRuntimeState) =>
  resolvedLayoutsFromState(state);
export const DataSourcesSelector = (state: IRuntimeState) =>
  dataSourcesFromState(state);

export function* checkIfConditionalRulesShouldRunSaga(): SagaIterator {
  try {
    const conditionalRenderingState: IConditionalRenderingRules = yield select(
      ConditionalRenderingSelector,
    );
    const formData: IFormData = yield select(FormDataSelector);
    const formValidations: IValidations = yield select(FormValidationSelector);
    const uiConfig: IUiConfig = yield select(UiConfigSelector);
    const resolvedNodes: LayoutRootNodeCollection<'resolved'> = yield select(
      ResolvedNodesSelector,
    );
    const dataSources = yield select(DataSourcesSelector);

    const present = new Set(uiConfig.hiddenFields);
    const future = runConditionalRenderingRules(
      conditionalRenderingState,
      formData,
      uiConfig.repeatingGroups,
    );

    runLayoutExpressionRules(resolvedNodes, present, future);
    const newLayoutOrder = runLayoutExpressionsForLayouts(
      resolvedNodes,
      uiConfig.hiddenLayoutsExpr,
      dataSources,
    );

    if (shouldHiddenFieldsUpdate(present, future)) {
      yield put(
        FormLayoutActions.updateHiddenComponents({
          componentsToHide: [...future.values()],
        }),
      );

      const newFormValidations = { ...formValidations };
      let validationsChanged = false;
      future.forEach((componentId) => {
        if (newFormValidations[componentId]) {
          delete newFormValidations[componentId];
          validationsChanged = true;
        }
      });
      if (validationsChanged) {
        ValidationActions.updateValidations({
          validations: newFormValidations,
        });
      }
    }

    if (shouldLayoutOrderUpdate(uiConfig.layoutOrder, newLayoutOrder)) {
      yield put(
        FormLayoutActions.calculatePageOrderAndMoveToNextPageFulfilled({
          order: newLayoutOrder,
        }),
      );
    }
  } catch (err) {
    yield call(console.error, err);
  }
}

function runLayoutExpressionRules(
  layouts: LayoutRootNodeCollection<'resolved'>,
  present: Set<string>,
  future: Set<string>,
) {
  for (const layout of Object.values(layouts.all())) {
    for (const node of layout.flat(true)) {
      if (node.item.hidden === true) {
        future.add(node.item.id);
      }
    }
  }
}

function runLayoutExpressionsForLayouts(
  nodes: LayoutRootNodeCollection<'resolved'>,
  hiddenLayoutsExpr: IHiddenLayoutsExpressions,
  dataSources: ContextDataSources,
): string[] {
  const newOrder: string[] = [];
  for (const key of Object.keys(hiddenLayoutsExpr)) {
    let isHidden = hiddenLayoutsExpr[key];
    if (typeof isHidden === 'object' && isHidden !== null) {
      isHidden = evalExpr(isHidden, nodes.findLayout(key), dataSources, {
        defaultValue: false,
      });
    }
    if (isHidden !== true) {
      newOrder.push(key);
    }
  }

  return newOrder;
}

function shouldHiddenFieldsUpdate(
  currentList: Set<string>,
  newList: Set<string>,
): boolean {
  if (currentList.size !== newList.size) {
    return true;
  }

  const present = [...currentList.values()].sort();
  const future = [...newList.values()].sort();

  return JSON.stringify(present) !== JSON.stringify(future);
}

function shouldLayoutOrderUpdate(
  currentList: string[],
  newList: string[],
): boolean {
  if (currentList.length !== newList.length) {
    return true;
  }

  return JSON.stringify(currentList.sort()) !== JSON.stringify(newList.sort());
}
