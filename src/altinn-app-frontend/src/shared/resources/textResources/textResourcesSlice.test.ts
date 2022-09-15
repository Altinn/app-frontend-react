import slice, {
  initialState,
  TextResourcesActions,
} from 'src/shared/resources/textResources/textResourcesSlice';
import type { IFetchTextResourcesFulfilled } from 'src/shared/resources/textResources/index';

describe('textResourcesSlice', () => {
  it('handles fetchFulfilled with rtl language', () => {
    const state = initialState;
    const mockTextResources: IFetchTextResourcesFulfilled = {
      language: 'ar',
      resources: [],
    };
    const nextState = slice.reducer(
      state,
      TextResourcesActions.fetchFulfilled(mockTextResources),
    );
    expect(nextState).toEqual({
      ...mockTextResources,
      error: null,
      rtlLanguageDirection: true,
    });
  });
  it('handles fetchFulfilled with ltr language', () => {
    const state = initialState;
    const mockTextResources: IFetchTextResourcesFulfilled = {
      language: 'no',
      resources: [],
    };
    const nextState = slice.reducer(
      state,
      TextResourcesActions.fetchFulfilled(mockTextResources),
    );
    expect(nextState).toEqual({
      ...mockTextResources,
      error: null,
      rtlLanguageDirection: false,
    });
  });
});
