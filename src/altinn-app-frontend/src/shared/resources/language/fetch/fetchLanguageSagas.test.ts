import { call, take, all, select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import {
  fetchLanguageSaga,
  watchFetchLanguageSaga,
  allowAnonymousSelector,
} from './fetchLanguageSagas';
import { profileStateSelector } from 'src/selectors/simpleSelectors';
import LanguageActions from '../languageActions';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { getLanguageFromCode } from 'altinn-shared/language';
import type { IProfile } from 'altinn-shared/types';

describe('languageActions', () => {
  it('should create an action with correct type: FETCH_LANGUAGE', () => {
    const expectedAction = {
      type: 'LANGUAGE_DATA.FETCH_LANGUAGE',
    };
    expect(LanguageActions.fetchLanguage()).toEqual(expectedAction);
  });
  it('should create an action with correct type: FETCH_LANGUAGE_FULFILLED', () => {
    const expectedAction = {
      type: 'LANGUAGE_DATA.FETCH_LANGUAGE_FULFILLED',
      language: {},
    };
    expect(LanguageActions.fetchLanguageFulfilled({})).toEqual(expectedAction);
  });
  it('should create an action with correct type: FETCH_LANGUAGE_REJECTED', () => {
    const mockError: Error = new Error();
    const expectedAction = {
      type: 'LANGUAGE_DATA.FETCH_LANGUAGE_REJECTED',
      error: mockError,
    };
    expect(LanguageActions.fetchLanguageRejected(mockError)).toEqual(
      expectedAction,
    );
  });
});

describe('fetchLanguageSagas', () => {
  it('should dispatch action "LANGUAGE_DATA.FETCH_LANGUAGE" ', () => {
    const generator = watchFetchLanguageSaga();
    expect(generator.next().value).toEqual(
      all([
        take(FormLayoutActions.fetchLayoutSetsFulfilled),
        take('APPLICATION_METADATA.FETCH_APPLICATION_METADATA_FULFILLED'),
        take('LANGUAGE_DATA.FETCH_LANGUAGE'),
      ]),
    );
    expect(generator.next().value).toEqual(select(allowAnonymousSelector));
    expect(generator.next().value).toEqual(take('PROFILE.FETCH_PROFILE_FULFILLED'));
    expect(generator.next().value).toEqual(call(fetchLanguageSaga));
    expect(generator.next().done).toBeTruthy();
  });

  it('should fetch default language when allowAnonymous is true', () => {

    return expectSaga(fetchLanguageSaga)
      .provide([
        [select(allowAnonymousSelector), true],
      ])
      .call(LanguageActions.fetchLanguageFulfilled, getLanguageFromCode('nb'))
      .run();
  });

  it('should fetch language from profile settings when allowAnonymous is false', () => {
    const profileMock: IProfile = {
      userId: 1,
      userName: '',
      partyId: 1234,
      party: null,
      userType: 1,
      profileSettingPreference: {
        doNotPromptForParty: false,
        language: 'en',
        preSelectedPartyId: 0,
      }
    };
    return expectSaga(fetchLanguageSaga)
      .provide([
        [select(allowAnonymousSelector), false],
        [select(profileStateSelector), profileMock]
      ])
      .call(LanguageActions.fetchLanguageFulfilled, getLanguageFromCode('en'))
      .run();
  });
});
