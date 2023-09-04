import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { makeGetHasErrorsSelector } from 'src/selectors/getErrors';
import type { IApplicationMetadataState } from 'src/features/applicationMetadata';

describe('selectors > getErrors', () => {
  it('should return true if error is present', () => {
    const initialState = getInitialStateMock({
      applicationMetadata: {
        error: new Error('mock'),
      } as IApplicationMetadataState,
    });
    const getError = makeGetHasErrorsSelector();
    const result = getError(initialState);
    expect(result).toEqual(true);
  });
});
