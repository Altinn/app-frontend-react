import { previewPdfSaga } from 'src/features/devtools/data/devToolsSagas';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type { IDevToolsState } from 'src/features/devtools/data/types.d';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

export const initialState: IDevToolsState = {
  isOpen: false,
  pdfPreview: false,
  hiddenComponents: 'hide',
};

export let DevToolsActions: ActionsFromSlice<typeof devToolsSlice>;
export const devToolsSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IDevToolsState>) => ({
    name: 'devTools',
    initialState,
    actions: {
      open: mkAction<void>({
        reducer: (state) => {
          state.isOpen = true;
        },
      }),
      close: mkAction<void>({
        reducer: (state) => {
          state.isOpen = false;
        },
      }),
      previewPdf: mkAction<void>({
        takeEvery: previewPdfSaga,
      }),
      setPdfPreview: mkAction<{ preview: boolean }>({
        reducer: (state, action) => {
          const { preview } = action.payload;
          state.pdfPreview = preview;
        },
      }),
      setShowHiddenComponents: mkAction<{ value: IDevToolsState['hiddenComponents'] }>({
        reducer: (state, action) => {
          state.hiddenComponents = action.payload.value;
        },
      }),
    },
  }));
  DevToolsActions = slice.actions;
  return slice;
};
