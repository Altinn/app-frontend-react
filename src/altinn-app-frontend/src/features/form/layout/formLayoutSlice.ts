import type { ILayoutSets, IUiConfig } from 'src/types';
import type { ILayouts } from './index';
import { createSagaSlice } from 'src/shared/resources/utils/sagaSlice';
import type * as LayoutTypes from './formLayoutTypes';

export interface ILayoutState {
  layouts: ILayouts;
  error: Error;
  uiConfig: IUiConfig;
  layoutsets: ILayoutSets;
}

export const initialState: ILayoutState = {
  layouts: null,
  error: null,
  uiConfig: {
    focus: null,
    hiddenFields: [],
    autoSave: null,
    repeatingGroups: {},
    fileUploadersWithTag: {},
    currentView: 'FormLayout',
    navigationConfig: {},
    layoutOrder: null,
    pageTriggers: [],
  },
  layoutsets: null,
};

const moduleName = 'formLayout';

const formLayoutSlice = createSagaSlice((mkAction) => ({
  name: moduleName,
  initialState,
  actions: {
    fetch: mkAction<ILayoutState, void>({}),
    fetchFulfilled: mkAction<ILayoutState, LayoutTypes.IFetchLayoutFulfilled>({
      reducer: (state, action) => {
        const { layouts, navigationConfig } = action.payload;
        state.layouts = layouts;
        state.uiConfig.navigationConfig = navigationConfig;
        state.uiConfig.layoutOrder = Object.keys(layouts);
        state.error = null;
        state.uiConfig.repeatingGroups = {};
      },
    }),
    fetchRejected: mkAction<
      ILayoutState,
      LayoutTypes.IFormLayoutActionRejected
    >({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
    fetchSets: mkAction<ILayoutState, void>({}),
    fetchSetsFulfilled: mkAction<
      ILayoutState,
      LayoutTypes.IFetchLayoutSetsFulfilled
    >({
      reducer: (state, action) => {
        const { layoutSets } = action.payload;
        state.layoutsets = layoutSets;
      },
    }),
    fetchSetsRejected: mkAction<
      ILayoutState,
      LayoutTypes.IFormLayoutActionRejected
    >({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
    fetchSettings: mkAction<ILayoutState, void>({}),
    fetchSettingsFulfilled: mkAction<
      ILayoutState,
      LayoutTypes.IFetchLayoutSettingsFulfilled
    >({
      reducer: (state, action) => {
        const { settings } = action.payload;
        if (settings && settings.pages) {
          state.uiConfig.hideCloseButton = settings?.pages?.hideCloseButton;
          state.uiConfig.showProgress = settings.pages.showProgress;
          state.uiConfig.showLanguageSelector =
            settings?.pages?.showLanguageSelector;
          state.uiConfig.pageTriggers = settings.pages.triggers;
          if (settings.pages.order) {
            state.uiConfig.layoutOrder = settings.pages.order;
            if (state.uiConfig.currentViewCacheKey) {
              let currentView: string;
              const lastVisitedPage = localStorage.getItem(
                state.uiConfig.currentViewCacheKey,
              );
              if (
                lastVisitedPage &&
                settings.pages.order.includes(lastVisitedPage)
              ) {
                currentView = lastVisitedPage;
              } else {
                currentView = settings.pages.order[0];
              }
              state.uiConfig.currentView = currentView;
            } else {
              state.uiConfig.currentView = settings.pages.order[0];
            }
          }
        }
      },
    }),
    fetchSettingsRejected: mkAction<
      ILayoutState,
      LayoutTypes.IFormLayoutActionRejected
    >({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
    setCurrentViewCacheKey: mkAction<
      ILayoutState,
      LayoutTypes.ISetCurrentViewCacheKey
    >({
      reducer: (state, action) => {
        const { key } = action.payload;
        state.uiConfig.currentViewCacheKey = key;
      },
    }),
    updateAutoSave: mkAction<ILayoutState, LayoutTypes.IUpdateAutoSave>({
      reducer: (state, action) => {
        const { autoSave } = action.payload;
        state.uiConfig.autoSave = autoSave;
      },
    }),
    updateCurrentView: mkAction<ILayoutState, LayoutTypes.IUpdateCurrentView>(
      {},
    ),
    updateCurrentViewFulfilled: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateCurrentViewFulfilled
    >({
      reducer: (state, action) => {
        const { newView, returnToView } = action.payload;
        state.uiConfig.currentView = newView;
        state.uiConfig.returnToView = returnToView;
      },
    }),
    updateCurrentViewRejected: mkAction<
      ILayoutState,
      LayoutTypes.IFormLayoutActionRejected
    >({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
    updateFocus: mkAction<ILayoutState, LayoutTypes.IUpdateFocus>({}),
    updateFocusFulfilled: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateFocusFulfilled
    >({
      reducer: (state, action) => {
        const { focusComponentId } = action.payload;
        state.uiConfig.focus = focusComponentId;
      },
    }),
    updateFocusRejected: mkAction<
      ILayoutState,
      LayoutTypes.IFormLayoutActionRejected
    >({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
    updateHiddenComponents: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateHiddenComponents
    >({
      reducer: (state, action) => {
        const { componentsToHide } = action.payload;
        state.uiConfig.hiddenFields = componentsToHide;
      },
    }),
    updateRepeatingGroups: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateRepeatingGroups
    >({
      reducer: (state, action) => {
        const { layoutElementId, remove, index } = action.payload;
        if (remove) {
          state.uiConfig.repeatingGroups[layoutElementId].deletingIndex =
            state.uiConfig.repeatingGroups[layoutElementId].deletingIndex || [];
          state.uiConfig.repeatingGroups[layoutElementId].deletingIndex.push(
            index,
          );
        }
      },
    }),
    updateRepeatingGroupsFulfilled: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateRepeatingGroupsFulfilled
    >({
      reducer: (state, action) => {
        const { repeatingGroups } = action.payload;
        state.uiConfig.repeatingGroups = repeatingGroups;
      },
    }),
    updateRepeatingGroupsRemoveCancelled: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateRepeatingGroupsRemoveCancelled
    >({
      reducer: (state, action) => {
        const { layoutElementId, index } = action.payload;
        state.uiConfig.repeatingGroups[layoutElementId].deletingIndex = (
          state.uiConfig.repeatingGroups[layoutElementId].deletingIndex || []
        ).filter((value) => value !== index);
      },
    }),
    updateRepeatingGroupsRejected: mkAction<
      ILayoutState,
      LayoutTypes.IFormLayoutActionRejected
    >({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
    updateRepeatingGroupsEditIndex: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateRepeatingGroupsEditIndex
    >({}),
    updateRepeatingGroupsEditIndexFulfilled: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateRepeatingGroupsEditIndexFulfilled
    >({
      reducer: (state, action) => {
        const { group, index } = action.payload;
        state.uiConfig.repeatingGroups[group].editIndex = index;
      },
    }),
    updateRepeatingGroupsEditIndexRejected: mkAction<
      ILayoutState,
      LayoutTypes.IFormLayoutActionRejected
    >({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
    updateFileUploadersWithTagFulfilled: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateFileUploadersWithTagFulfilled
    >({
      reducer: (state, action) => {
        const { uploaders } = action.payload;
        state.uiConfig.fileUploadersWithTag = uploaders;
      },
    }),
    updateFileUploaderWithTagRejected: mkAction<
      ILayoutState,
      LayoutTypes.IFormLayoutActionRejected
    >({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
    updateFileUploaderWithTagEditIndex: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateFileUploaderWithTagEditIndex
    >({}),
    updateFileUploaderWithTagEditIndexFulfilled: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateFileUploaderWithTagEditIndexFulfilled
    >({
      reducer: (state, action) => {
        const { componentId, index } = action.payload;
        state.uiConfig.fileUploadersWithTag[componentId].editIndex = index;
      },
    }),
    updateFileUploaderWithTagEditIndexRejected: mkAction<
      ILayoutState,
      LayoutTypes.IFormLayoutActionRejected
    >({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
    updateFileUploaderWithTagChosenOptions: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateFileUploaderWithTagChosenOptions
    >({}),
    updateFileUploaderWithTagChosenOptionsFulfilled: mkAction<
      ILayoutState,
      LayoutTypes.IUpdateFileUploaderWithTagChosenOptionsFulfilled
    >({
      reducer: (state, action) => {
        const { componentId, id, option } = action.payload;
        if (state.uiConfig.fileUploadersWithTag[componentId]) {
          state.uiConfig.fileUploadersWithTag[componentId].chosenOptions[id] =
            option.value;
        } else {
          state.uiConfig.fileUploadersWithTag[componentId] = {
            editIndex: -1,
            chosenOptions: { [id]: option.value },
          };
        }
      },
    }),
    updateFileUploaderWithTagChosenOptionsRejected: mkAction<
      ILayoutState,
      LayoutTypes.IFormLayoutActionRejected
    >({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
    calculatePageOrderAndMoveToNextPage: mkAction<
      ILayoutState,
      LayoutTypes.ICalculatePageOrderAndMoveToNextPage
    >({}),
    calculatePageOrderAndMoveToNextPageFulfilled: mkAction<
      ILayoutState,
      LayoutTypes.ICalculatePageOrderAndMoveToNextPageFulfilled
    >({
      reducer: (state, action) => {
        const { order } = action.payload;
        state.uiConfig.layoutOrder = order;
      },
    }),
    calculatePageOrderAndMoveToNextPageRejected: mkAction<
      ILayoutState,
      LayoutTypes.IFormLayoutActionRejected
    >({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
    initRepeatingGroups: mkAction<ILayoutState, void>({}),
  },
}));

export const FormLayoutActions = formLayoutSlice.actions;
export default formLayoutSlice;
