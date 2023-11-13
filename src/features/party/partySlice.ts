import { createSagaSlice } from 'src/redux/sagaSlice';
import type { IGetPartiesFulfilled, IPartyState, ISelectPartyFulfilled } from 'src/features/party/index';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

const initialState: IPartyState = {
  parties: undefined,
  selectedParty: undefined,
  autoRedirect: false,
};

export let PartyActions: ActionsFromSlice<typeof partySlice>;
export const partySlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IPartyState>) => ({
    name: 'party',
    initialState,
    actions: {
      getPartiesFulfilled: mkAction<IGetPartiesFulfilled>({
        reducer: (state, action) => {
          state.parties = action.payload.parties;
        },
      }),
      selectPartyFulfilled: mkAction<ISelectPartyFulfilled>({
        reducer: (state, action) => {
          state.selectedParty = action.payload.party;
          state.autoRedirect = false;
        },
      }),
      setAutoRedirect: mkAction<boolean>({
        reducer: (state, action) => {
          state.autoRedirect = action.payload;
        },
      }),
    },
  }));

  PartyActions = slice.actions;
  return slice;
};
