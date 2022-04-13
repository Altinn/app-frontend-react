import { expectSaga } from "redux-saga-test-plan";
import { applicationMetadataSelector, fetchLayoutSaga, instanceSelector, layoutSetsSelector } from "./fetchFormLayoutSagas";
import * as networking from '../../../../utils/networking';
import type { IApplication, IInstance } from "altinn-shared/types";
import { select } from "redux-saga/effects";
import { FormLayoutActions } from '../formLayoutSlice';

describe('features / form / layout / fetch / fetchFormLayoutSagas', () => {

  describe('fetchLayoutSaga', () => {
    const instance = {
      id: 'some-instance-id'
    } as IInstance;
    const application = {
      id: 'someOrg/someApp'
    } as IApplication;

    it('should call relevant actions when layout is fetched successfully', () => {
      const mockResponse = {
        page1: {
          data: {
            layout: []
          }
        }
      };
      jest.spyOn(networking, 'get').mockResolvedValue(mockResponse);

      return expectSaga(fetchLayoutSaga)
        .provide([
          [select(layoutSetsSelector), undefined],
          [select(instanceSelector), instance],
          [select(applicationMetadataSelector), application]
        ])
        .put(FormLayoutActions.setCurrentViewCacheKey({ key: instance.id }))
        .put(FormLayoutActions.fetchLayoutFulfilled({ layouts: { page1: [] }, navigationConfig: { page1: undefined } }))
        .put(FormLayoutActions.updateAutoSave({ autoSave: undefined }))
        .put(FormLayoutActions.updateCurrentView({ newView: 'page1', skipPageCaching: true }))
        .run();
    });

    it('should call fetchLayoutRejected when fetching layout fails', () => {
      jest.spyOn(networking, 'get').mockRejectedValue(new Error('some error'));

      return expectSaga(fetchLayoutSaga)
        .provide([
          [select(layoutSetsSelector), undefined],
          [select(instanceSelector), instance],
          [select(applicationMetadataSelector), application]
        ])
        .put(FormLayoutActions.fetchLayoutRejected({ error: new Error('some error') }))
        .run();
    });

    it('should set current view to cached key if key exists in fetched layout', () => {
      const mockResponse = {
        page1: {
          data: {
            layout: []
          }
        },
        page2: {
          data: {
            layout: []
          }
        },
      };
      jest.spyOn(networking, 'get').mockResolvedValue(mockResponse);
      jest.spyOn(window.localStorage.__proto__, 'getItem');
      window.localStorage.__proto__.getItem = jest.fn().mockReturnValue('page2');

      return expectSaga(fetchLayoutSaga)
        .provide([
          [select(layoutSetsSelector), undefined],
          [select(instanceSelector), instance],
          [select(applicationMetadataSelector), application]
        ])
        .put(FormLayoutActions.setCurrentViewCacheKey({ key: instance.id }))
        .put(FormLayoutActions.fetchLayoutFulfilled({ layouts: { page1: [], page2: [] }, navigationConfig: { page1: undefined, page2: undefined } }))
        .put(FormLayoutActions.updateAutoSave({ autoSave: undefined }))
        .put(FormLayoutActions.updateCurrentView({ newView: 'page2', skipPageCaching: true }))
        .run();
    });
    
    it('should set current view to first page in layout if a cached key exists but no longer exists in layout order', () => {
      const mockResponse = {
        page1: {
          data: {
            layout: []
          }
        },
        page2: {
          data: {
            layout: []
          }
        },
      };
      jest.spyOn(networking, 'get').mockResolvedValue(mockResponse);
      jest.spyOn(window.localStorage.__proto__, 'getItem');
      window.localStorage.__proto__.getItem = jest.fn().mockReturnValue('page3');

      return expectSaga(fetchLayoutSaga)
        .provide([
          [select(layoutSetsSelector), undefined],
          [select(instanceSelector), instance],
          [select(applicationMetadataSelector), application]
        ])
        .put(FormLayoutActions.setCurrentViewCacheKey({ key: instance.id }))
        .put(FormLayoutActions.fetchLayoutFulfilled({ layouts: { page1: [], page2: [] }, navigationConfig: { page1: undefined, page2: undefined } }))
        .put(FormLayoutActions.updateAutoSave({ autoSave: undefined }))
        .put(FormLayoutActions.updateCurrentView({ newView: 'page1', skipPageCaching: true }))
        .run();
    });
  });
});
