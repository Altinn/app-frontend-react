import { createSagaSlice } from 'src/redux/sagaSlice';
import type * as LayoutTypes from 'src/features/form/layout/formLayoutTypes';
import type { ILayouts } from 'src/layout/layout';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';
import type { ILayoutSets, IPagesSettings, IUiConfig } from 'src/types';

export interface ILayoutState {
  layouts: ILayouts | null;
  layoutSetId: string | null;
  uiConfig: IUiConfig;
  layoutsets: ILayoutSets | null;
}

export const initialState: ILayoutState = {
  layouts: null,
  layoutSetId: null,
  uiConfig: {
    focus: null,
    hiddenFields: [],
    receiptLayoutName: undefined,
    keepScrollPos: undefined,
    excludePageFromPdf: null,
    excludeComponentFromPdf: null,
    pdfLayoutName: undefined,
    autoSaveBehavior: 'onChangeFormData',
  },
  layoutsets: null,
};

export let FormLayoutActions: ActionsFromSlice<typeof formLayoutSlice>;
export const formLayoutSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<ILayoutState>) => ({
    name: 'formLayout',
    initialState,
    actions: {
      fetchFulfilled: mkAction<LayoutTypes.IFetchLayoutFulfilled>({
        reducer: (state, action) => {
          const { layouts, layoutSetId } = action.payload;
          state.layouts = layouts;
          state.layoutSetId = layoutSetId;
        },
      }),
      fetchSetsFulfilled: mkAction<LayoutTypes.IFetchLayoutSetsFulfilled>({
        reducer: (state, action) => {
          const { layoutSets } = action.payload;
          if (!layoutSets) {
            return;
          }
          if (layoutSets.sets) {
            state.layoutsets = { sets: layoutSets.sets };
          }
          if (layoutSets.uiSettings) {
            updateCommonPageSettings(state, layoutSets.uiSettings);
          }
        },
      }),
      fetchSettingsFulfilled: mkAction<LayoutTypes.IFetchLayoutSettingsFulfilled>({
        reducer: (state, action) => {
          const { settings } = action.payload;
          state.uiConfig.receiptLayoutName = settings?.receiptLayoutName;
          if (settings && settings.pages) {
            updateCommonPageSettings(state, settings.pages);
          }

          state.uiConfig.pdfLayoutName = settings?.pages.pdfLayoutName;
          state.uiConfig.excludeComponentFromPdf = settings?.components?.excludeFromPdf ?? [];
          state.uiConfig.excludePageFromPdf = settings?.pages?.excludeFromPdf ?? [];
        },
      }),
      updateHiddenComponents: mkAction<LayoutTypes.IUpdateHiddenComponents>({
        reducer: (state, action) => {
          const { componentsToHide } = action.payload;
          state.uiConfig.hiddenFields = componentsToHide;
        },
      }),
      clearKeepScrollPos: mkAction<void>({
        reducer: (state) => {
          state.uiConfig.keepScrollPos = undefined;
        },
      }),
      updateLayouts: mkAction<ILayouts>({
        reducer: (state, action) => {
          state.layouts = { ...state.layouts, ...action.payload };
        },
      }),
    },
  }));

  FormLayoutActions = slice.actions;
  return slice;
};

const updateCommonPageSettings = (state: ILayoutState, page: Pick<IPagesSettings, 'autoSaveBehavior'>) => {
  const { autoSaveBehavior = state.uiConfig.autoSaveBehavior } = page;
  state.uiConfig.autoSaveBehavior = autoSaveBehavior;
};
