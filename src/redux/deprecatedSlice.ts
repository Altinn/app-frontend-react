import { createSagaSlice } from 'src/redux/sagaSlice';
import type { IAttachments } from 'src/features/attachments';
import type { IFormData } from 'src/features/formData';
import type { AllOptionsMap } from 'src/features/options/useAllOptions';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';
import type { IInstance, IProcess } from 'src/types/shared';

export interface IDeprecatedState {
  lastKnownInstance?: IInstance;
  lastKnownProcess?: IProcess;
  lastKnownAttachments?: IAttachments;
  allOptions?: AllOptionsMap;
  formData: IFormData;
}
const initialState: IDeprecatedState = {
  formData: {},
};

export let DeprecatedActions: ActionsFromSlice<typeof deprecatedSlice>;
export const deprecatedSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IDeprecatedState>) => ({
    name: 'deprecated',
    initialState,
    actions: {
      setLastKnownInstance: mkAction<IInstance | undefined>({
        reducer: (state, action) => {
          state.lastKnownInstance = action.payload;
        },
      }),
      setLastKnownProcess: mkAction<IProcess | undefined>({
        reducer: (state, action) => {
          state.lastKnownProcess = action.payload;
        },
      }),
      setLastKnownAttachments: mkAction<IAttachments>({
        reducer: (state, action) => {
          state.lastKnownAttachments = action.payload;
        },
      }),
      setAllOptions: mkAction<AllOptionsMap>({
        reducer: (state, action) => {
          state.allOptions = action.payload;
        },
      }),
      setFormData: mkAction<IFormData>({
        reducer: (state, action) => {
          state.formData = action.payload;
        },
      }),
    },
  }));

  DeprecatedActions = slice.actions;
  return slice;
};
