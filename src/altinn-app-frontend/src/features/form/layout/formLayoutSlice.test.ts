import slice, {
  FormLayoutActions,
  initialState,
} from 'src/features/form/layout/formLayoutSlice';
import type { ILayoutState } from 'src/features/form/layout/formLayoutSlice';
import type { ILayoutSettings } from 'src/types';

describe('layoutSlice', () => {
  describe('fetchLayoutFulfilled', () => {
    const layouts = {};
    const navigationConfig = {};

    it('should set layout state accordingly', () => {
      const nextState = slice.reducer(
        initialState,
        FormLayoutActions.fetchFulfilled({
          layouts,
          navigationConfig,
        }),
      );

      expect(nextState.layouts).toEqual(layouts);
      expect(nextState.uiConfig.layoutOrder).toEqual(Object.keys(layouts));
      expect(nextState.uiConfig.navigationConfig).toEqual(navigationConfig);
    });

    it('should reset repeatingGroups if set', () => {
      const stateWithRepGroups: ILayoutState = {
        ...initialState,
        uiConfig: {
          ...initialState.uiConfig,
          repeatingGroups: {
            someId: {
              index: 2,
            },
          },
        },
      };
      const nextState = slice.reducer(
        stateWithRepGroups,
        FormLayoutActions.fetchFulfilled({
          layouts,
          navigationConfig,
        }),
      );

      expect(nextState.uiConfig.repeatingGroups).toEqual({});
    });

    it('should reset error if set', () => {
      const stateWithError: ILayoutState = {
        ...initialState,
        error: new Error('mock'),
      };
      const nextState = slice.reducer(
        stateWithError,
        FormLayoutActions.fetchFulfilled({
          layouts,
          navigationConfig,
        }),
      );

      expect(nextState.error).toEqual(null);
    });
  });

  describe('fetchFormLayoutSettingsFulfilled', () => {
    it('should hide CloseButton, Progress and LanguageSelector before fetch', () => {
      expect(initialState.uiConfig.hideCloseButton).toEqual(true);
      expect(initialState.uiConfig.showProgress).toEqual(false);
      expect(initialState.uiConfig.showLanguageSelector).toEqual(false);
    });

    it('should set hideCloseButton, showProgress and showLanguageSelector when set to true', () => {
      const settings: ILayoutSettings = {
        pages: {
          order: [],
          hideCloseButton: true,
          showProgress: true,
          showLanguageSelector: true,
        },
      };

      const nextState = slice.reducer(
        initialState,
        FormLayoutActions.fetchSettingsFulfilled({
          settings,
        }),
      );

      expect(nextState.uiConfig.hideCloseButton).toEqual(true);
      expect(nextState.uiConfig.showProgress).toEqual(true);
      expect(nextState.uiConfig.showLanguageSelector).toEqual(true);
    });

    it('should set hideCloseButton, showProgress and showLanguageSelector when set to false', () => {
      const settings: ILayoutSettings = {
        pages: {
          order: [],
          hideCloseButton: false,
          showProgress: false,
          showLanguageSelector: false,
        },
      };

      const nextState = slice.reducer(
        initialState,
        FormLayoutActions.fetchSettingsFulfilled({
          settings,
        }),
      );

      expect(nextState.uiConfig.hideCloseButton).toEqual(false);
      expect(nextState.uiConfig.showProgress).toEqual(false);
      expect(nextState.uiConfig.showLanguageSelector).toEqual(false);
    });

    it('should set hideCloseButton, showProgress and showLanguageSelector when not set', () => {
      const settings: ILayoutSettings = {
        pages: {
          order: [],
        },
      };

      const nextState = slice.reducer(
        initialState,
        FormLayoutActions.fetchSettingsFulfilled({
          settings,
        }),
      );

      expect(nextState.uiConfig.hideCloseButton).toEqual(false);
      expect(nextState.uiConfig.showProgress).toEqual(false);
      expect(nextState.uiConfig.showLanguageSelector).toEqual(false);
    });

    it('should set currentView to first page in settings.pages.order if no key is cached in localStorage', () => {
      const settings = {
        pages: {
          order: ['page1', 'page2'],
        },
      };
      const nextState = slice.reducer(
        initialState,
        FormLayoutActions.fetchSettingsFulfilled({
          settings,
        }),
      );

      expect(nextState.uiConfig.currentView).toEqual('page1');
    });

    it('should set currentView to cached key in localStorage if key exists in settings.pages.order', () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem');
      window.localStorage.__proto__.getItem = jest
        .fn()
        .mockReturnValue('page2');

      const settings = {
        pages: {
          order: ['page1', 'page2'],
        },
      };
      const nextState = slice.reducer(
        {
          ...initialState,
          uiConfig: {
            ...initialState.uiConfig,
            currentViewCacheKey: 'some-cache-key',
          },
        },
        FormLayoutActions.fetchSettingsFulfilled({
          settings,
        }),
      );

      expect(nextState.uiConfig.currentView).toEqual('page2');
    });

    it('should set currentView to first page in settings.pages.order if key is cached in localStorage but does not exist in order', () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem');
      window.localStorage.__proto__.getItem = jest
        .fn()
        .mockReturnValue('page3');

      const settings = {
        pages: {
          order: ['page1', 'page2'],
        },
      };
      const nextState = slice.reducer(
        {
          ...initialState,
          uiConfig: {
            ...initialState.uiConfig,
            currentViewCacheKey: 'some-cache-key',
          },
        },
        FormLayoutActions.fetchSettingsFulfilled({
          settings,
        }),
      );

      expect(nextState.uiConfig.currentView).toEqual('page1');
    });
  });
});
