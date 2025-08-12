import { all, fork } from 'redux-saga/effects';
import authSaga from './authSaga';
import superAdminSaga from '../super-admin/superAdminSaga';
import paymentSaga from '../super-admin/paymentSaga';
import subscriptionSaga from '../super-admin/subscriptionSaga';
import invoiceGenerationSaga from '../super-admin/invoiceGenerationSaga';

export default function* rootSaga() {
  console.log('🔄 Root saga initialized');
  yield all([
    fork(authSaga),
    fork(superAdminSaga),
    fork(paymentSaga),
    fork(subscriptionSaga),
    fork(invoiceGenerationSaga)
  ]);
}