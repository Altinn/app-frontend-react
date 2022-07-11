import type { ILayoutSets, IUiConfig } from 'src/types';
import type { ILayouts } from './index';
import type { MkActionType } from 'src/shared/resources/utils/sagaSlice';
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

const formLayoutSlice = createSagaSlice(
  (mkAction: MkActionType<ILayoutState>) => ({
    name: moduleName,
    initialState,
    actions: {
      fetch: mkAction<void>({}),
      fetchFulfilled: mkAction<LayoutTypes.IFetchLayoutFulfilled>({
        reducer: (state, action) => {
          const { layouts, navigationConfig } = action.payload;
          state.layouts = layouts;
          state.uiConfig.navigationConfig = navigationConfig;
          state.uiConfig.layoutOrder = Object.keys(layouts);
          state.error = null;
          state.uiConfig.repeatingGroups = {};
        },
      }),
      fetchRejected: mkAction<LayoutTypes.IFormLayoutActionRejected>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.error = error;
        },
      }),
      fetchSets: mkAction<void>({}),
      fetchSetsFulfilled: mkAction<LayoutTypes.IFetchLayoutSetsFulfilled>({
        reducer: (state, action) => {
          const { layoutSets } = action.payload;
          state.layoutsets = layoutSets;
        },
      }),
      fetchSetsRejected: mkAction<LayoutTypes.IFormLayoutActionRejected>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.error = error;
        },
      }),
      fetchSettings: mkAction<void>({}),
      fetchSettingsFulfilled:
        mkAction<LayoutTypes.IFetchLayoutSettingsFulfilled>({
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
      fetchSettingsRejected: mkAction<LayoutTypes.IFormLayoutActionRejected>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.error = error;
        },
      }),
      setCurrentViewCacheKey: mkAction<LayoutTypes.ISetCurrentViewCacheKey>({
        reducer: (state, action) => {
          const { key } = action.payload;
          state.uiConfig.currentViewCacheKey = key;
        },
      }),
      updateAutoSave: mkAction<LayoutTypes.IUpdateAutoSave>({
        reducer: (state, action) => {
          const { autoSave } = action.payload;
          state.uiConfig.autoSave = autoSave;
        },
      }),
      updateCurrentView: mkAction<LayoutTypes.IUpdateCurrentView>({}),
      updateCurrentViewFulfilled:
        mkAction<LayoutTypes.IUpdateCurrentViewFulfilled>({
          reducer: (state, action) => {
            const { newView, returnToView } = action.payload;
            state.uiConfig.currentView = newView;
            state.uiConfig.returnToView = returnToView;
          },
        }),
      updateCurrentViewRejected:
        mkAction<LayoutTypes.IFormLayoutActionRejected>({
          reducer: (state, action) => {
            const { error } = action.payload;
            state.error = error;
          },
        }),
      updateFocus: mkAction<LayoutTypes.IUpdateFocus>({}),
      updateFocusFulfilled: mkAction<LayoutTypes.IUpdateFocusFulfilled>({
        reducer: (state, action) => {
          const { focusComponentId } = action.payload;
          state.uiConfig.focus = focusComponentId;
        },
      }),
      updateFocusRejected: mkAction<LayoutTypes.IFormLayoutActionRejected>({
        reducer: (state, action) => {
          const { error } = action.payload;
          state.error = error;
        },
      }),
      updateHiddenComponents: mkAction<LayoutTypes.IUpdateHiddenComponents>({
        reducer: (state, action) => {
          const { componentsToHide } = action.payload;
          state.uiConfig.hiddenFields = componentsToHide;
        },
      }),
      updateRepeatingGroups: mkAction<LayoutTypes.IUpdateRepeatingGroups>({
        reducer: (state, action) => {
          const { layoutElementId, remove, index } = action.payload;
          if (remove) {
            state.uiConfig.repeatingGroups[layoutElementId].deletingIndex =
              state.uiConfig.repeatingGroups[layoutElementId].deletingIndex ||
              [];
            state.uiConfig.repeatingGroups[layoutElementId].deletingIndex.push(
              index,
            );
          }
        },
      }),
      updateRepeatingGroupsFulfilled:
        mkAction<LayoutTypes.IUpdateRepeatingGroupsFulfilled>({
          reducer: (state, action) => {
            const { repeatingGroups } = action.payload;
            state.uiConfig.repeatingGroups = repeatingGroups;
          },
        }),
      updateRepeatingGroupsRemoveCancelled:
        mkAction<LayoutTypes.IUpdateRepeatingGroupsRemoveCancelled>({
          reducer: (state, action) => {
            const { layoutElementId, index } = action.payload;
            state.uiConfig.repeatingGroups[layoutElementId].deletingIndex = (
              state.uiConfig.repeatingGroups[layoutElementId].deletingIndex ||
              []
            ).filter((value) => value !== index);
          },
        }),
      updateRepeatingGroupsRejected:
        mkAction<LayoutTypes.IFormLayoutActionRejected>({
          reducer: (state, action) => {
            const { error } = action.payload;
            state.error = error;
          },
        }),
      updateRepeatingGroupsEditIndex:
        mkAction<LayoutTypes.IUpdateRepeatingGroupsEditIndex>({}),
      updateRepeatingGroupsEditIndexFulfilled:
        mkAction<LayoutTypes.IUpdateRepeatingGroupsEditIndexFulfilled>({
          reducer: (state, action) => {
            const { group, index } = action.payload;
            state.uiConfig.repeatingGroups[group].editIndex = index;
          },
        }),
      updateRepeatingGroupsEditIndexRejected:
        mkAction<LayoutTypes.IFormLayoutActionRejected>({
          reducer: (state, action) => {
            const { error } = action.payload;
            state.error = error;
          },
        }),
      updateFileUploadersWithTagFulfilled:
        mkAction<LayoutTypes.IUpdateFileUploadersWithTagFulfilled>({
          reducer: (state, action) => {
            const { uploaders } = action.payload;
            state.uiConfig.fileUploadersWithTag = uploaders;
          },
        }),
      updateFileUploaderWithTagRejected:
        mkAction<LayoutTypes.IFormLayoutActionRejected>({
          reducer: (state, action) => {
            const { error } = action.payload;
            state.error = error;
          },
        }),
      updateFileUploaderWithTagEditIndex:
        mkAction<LayoutTypes.IUpdateFileUploaderWithTagEditIndex>({}),
      updateFileUploaderWithTagEditIndexFulfilled:
        mkAction<LayoutTypes.IUpdateFileUploaderWithTagEditIndexFulfilled>({
          reducer: (state, action) => {
            const { componentId, index } = action.payload;
            state.uiConfig.fileUploadersWithTag[componentId].editIndex = index;
          },
        }),
      updateFileUploaderWithTagEditIndexRejected:
        mkAction<LayoutTypes.IFormLayoutActionRejected>({
          reducer: (state, action) => {
            const { error } = action.payload;
            state.error = error;
          },
        }),
      updateFileUploaderWithTagChosenOptions:
        mkAction<LayoutTypes.IUpdateFileUploaderWithTagChosenOptions>({}),
      updateFileUploaderWithTagChosenOptionsFulfilled:
        mkAction<LayoutTypes.IUpdateFileUploaderWithTagChosenOptionsFulfilled>({
          reducer: (state, action) => {
            const { componentId, id, option } = action.payload;
            if (state.uiConfig.fileUploadersWithTag[componentId]) {
              state.uiConfig.fileUploadersWithTag[componentId].chosenOptions[
                id
              ] = option.value;
            } else {
              state.uiConfig.fileUploadersWithTag[componentId] = {
                editIndex: -1,
                chosenOptions: { [id]: option.value },
              };
            }
          },
        }),
      updateFileUploaderWithTagChosenOptionsRejected:
        mkAction<LayoutTypes.IFormLayoutActionRejected>({
          reducer: (state, action) => {
            const { error } = action.payload;
            state.error = error;
          },
        }),
      calculatePageOrderAndMoveToNextPage:
        mkAction<LayoutTypes.ICalculatePageOrderAndMoveToNextPage>({}),
      calculatePageOrderAndMoveToNextPageFulfilled:
        mkAction<LayoutTypes.ICalculatePageOrderAndMoveToNextPageFulfilled>({
          reducer: (state, action) => {
            const { order } = action.payload;
            state.uiConfig.layoutOrder = order;
          },
        }),
      calculatePageOrderAndMoveToNextPageRejected:
        mkAction<LayoutTypes.IFormLayoutActionRejected>({
          reducer: (state, action) => {
            const { error } = action.payload;
            state.error = error;
          },
        }),
      initRepeatingGroups: mkAction<void>({}),
    },
  }),
);

export const FormLayoutActions = formLayoutSlice.actions;
export default formLayoutSlice;
