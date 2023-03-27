import { getApplicationSettings } from 'src/shared/resources/applicationSettings/fetch/fetchApplicationSettingsSaga';
import { createSagaSlice } from 'src/utils/sagaSlice';
import type {
  IFetchApplicationSettingsFulfilled,
  IFetchApplicationSettingsRejected,
} from 'src/shared/resources/applicationSettings/applicationSettingsTypes';
import type { IApplicationSettings } from 'src/types/shared';
import type { MkActionType } from 'src/utils/sagaSlice';

export interface IApplicationSettingsState {
  applicationSettings: IApplicationSettings | null;
  error: Error | null;
}

export const initialState: IApplicationSettingsState = {
  applicationSettings: null,
  error: null,
};

export const applicationSettingsSlice = createSagaSlice((mkAction: MkActionType<IApplicationSettingsState>) => ({
  name: 'applicationSettings',
  initialState,
  actions: {
    fetchApplicationSettings: mkAction<void>({
      takeLatest: getApplicationSettings,
    }),
    fetchApplicationSettingsFulfilled: mkAction<IFetchApplicationSettingsFulfilled>({
      reducer: (state, action) => {
        const { settings } = action.payload;
        state.applicationSettings = settings;
      },
    }),
    fetchApplicationSettingsRejected: mkAction<IFetchApplicationSettingsRejected>({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.error = error;
      },
    }),
  },
}));

export const ApplicationSettingsActions = applicationSettingsSlice.actions;
