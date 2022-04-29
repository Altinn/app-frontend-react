import { IAltinnOrgs } from 'altinn-shared/types';
import { ActionCreatorsMapObject, bindActionCreators } from 'redux';
import { store } from '../../../store';

import * as FetchOrgs from './fetch/fetchOrgsActions';

export interface IOrgsActions extends ActionCreatorsMapObject {
  fetchOrgs: () => FetchOrgs.IFetchOrgs;
  fetchOrgsFulfilled: (orgs: IAltinnOrgs) => FetchOrgs.IFetchOrgsFulfilled;
  fetchOrgsRejected: (error: Error) => FetchOrgs.IFetchOrgsRejected;
}

const actions: IOrgsActions = {
  fetchOrgs: FetchOrgs.fetchOrgs,
  fetchOrgsFulfilled: FetchOrgs.fetchOrgsFulfilled,
  fetchOrgsRejected: FetchOrgs.fetchOrgsRejected,
};

const OrgActions: IOrgsActions = bindActionCreators<any, any>(actions, store.dispatch);

export default OrgActions;
