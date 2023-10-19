import { createSagaSlice } from 'src/redux/sagaSlice';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

export interface IDeprecatedState {}
const initialState: IDeprecatedState = {};

export let DeprecatedActions: ActionsFromSlice<typeof deprecatedSlice>;
export const deprecatedSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IDeprecatedState>) => ({
    name: 'deprecated',
    initialState,
    actions: {
      instanceDataFetchFulfilled: mkAction<void>({}),

      // TODO: Implement these
      deleteAttachmentsInGroup: mkAction<{ groupId: string; index: number }>({}),
      deleteAttachmentsInGroupFulfilled: mkAction<{ successful: boolean; groupId: string; index: number }>({}),
    },
  }));

  DeprecatedActions = slice.actions;
  return slice;
};
