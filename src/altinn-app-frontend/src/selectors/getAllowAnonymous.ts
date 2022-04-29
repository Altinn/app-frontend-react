import type { IRuntimeState } from 'src/types';
import { createSelector } from 'reselect';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllowAnonymousSelector = (state: IRuntimeState) => {
  return true; //TODO: replace this mocked value
}

const getAllowAnonymous = () => {
  return createSelector(
    [getAllowAnonymousSelector],
    (allowAnonymous: boolean) => allowAnonymous,
  );
};

export const makeGetAllowAnonymousSelector = getAllowAnonymous;
