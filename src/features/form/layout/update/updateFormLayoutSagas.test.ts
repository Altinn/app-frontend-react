import mockAxios from 'jest-mock-axios';
import { select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import {
  findAndMoveToNextVisibleLayout,
  selectAllLayouts,
  selectCurrentLayout,
} from 'src/features/form/layout/update/updateFormLayoutSagas';
import { selectLayoutOrder } from 'src/selectors/getLayoutOrder';

describe('updateLayoutSagas', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  describe('findAndMoveToNextVisibleLayout', () => {
    const allLayouts = ['a', 'b', 'c', 'd'];
    it.each([
      {
        name: 'should do nothing if current page is visible',
        current: 'b',
        visible: allLayouts,
        expected: undefined,
      },
      {
        name: 'should move to c if b is not visible',
        current: 'b',
        visible: ['a', 'c', 'd'],
        expected: 'c',
      },
      {
        name: 'should move to d if b,c is not visible',
        current: 'b',
        visible: ['a', 'd'],
        expected: 'd',
      },
      {
        name: 'should move to a if c,d is not visible',
        current: 'c',
        visible: ['a', 'b'],
        expected: 'a',
      },
      {
        name: 'should do nothing if visible state is broken',
        current: 'a',
        visible: ['whatever'],
        expected: undefined,
      },
    ])('$name', ({ current, visible, expected }) => {
      const ret = expectSaga(findAndMoveToNextVisibleLayout).provide([
        [select(selectAllLayouts), allLayouts],
        [select(selectLayoutOrder), visible],
        [select(selectCurrentLayout), current],
      ]);

      if (expected) {
        ret.put(
          FormLayoutActions.updateCurrentViewFulfilled({
            newView: expected,
          }),
        );
      }

      return ret.run();
    });
  });
});
