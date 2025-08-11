import { all } from 'redux-saga/effects';
import authSaga from './authSaga';
import superAdminSaga from '../super-admin/superAdminSaga';
import subscriptionSaga from '../super-admin/subscriptionSaga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    superAdminSaga(),
    subscriptionSaga(),
  ]);
}
