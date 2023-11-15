import { createSagaSlice } from 'src/redux/sagaSlice';
import type { IPartyState, ISelectPartyFulfilled } from 'src/features/party/index';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

const initialState: IPartyState = {
  selectedParty: undefined,
};

export let PartyActions: ActionsFromSlice<typeof partySlice>;
export const partySlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IPartyState>) => ({
    name: 'party',
    initialState,
    actions: {
      selectPartyFulfilled: mkAction<ISelectPartyFulfilled>({
        reducer: (state, action) => {
          state.selectedParty = action.payload.party;
        },
      }),
    },
  }));

  PartyActions = slice.actions;
  return slice;
};
