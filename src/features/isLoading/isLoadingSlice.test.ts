import { initialState, IsLoadingActions, isLoadingSlice } from 'src/features/isLoading/isLoadingSlice';
import type { IIsLoadingState } from 'src/features/isLoading/isLoadingSlice';

describe('isLoadingSlice', () => {
  let state: IIsLoadingState;
  beforeAll(() => {
    state = initialState;
  });

  it('handles startDataTaskIsLoading action', () => {
    const nextState = isLoadingSlice.reducer(state, IsLoadingActions.startDataTaskIsLoading);
    expect(nextState.dataTask).toBeTruthy();
  });

  it('handles finishDataTaskIsLoading action', () => {
    const nextState = isLoadingSlice.reducer(
      { dataTask: true, stateless: true },
      IsLoadingActions.finishDataTaskIsLoading,
    );
    expect(nextState.dataTask).toBeFalsy();
  });
});
