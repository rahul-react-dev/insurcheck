import { all } from 'redux-saga/effects';
import authSaga from './authSaga';
import superAdminSaga from '../super-admin/superAdminSaga';
import subscriptionSaga from '../super-admin/subscriptionSaga';
import paymentSaga from '../super-admin/paymentSaga';
import invoiceGenerationSaga from '../super-admin/invoiceGenerationSaga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    superAdminSaga(),
    subscriptionSaga(),
    paymentSaga(),
    invoiceGenerationSaga(),
  ]);
}