import { all, fork } from 'redux-saga/effects';
import authSaga from './authSaga';
import superAdminSaga from '../super-admin/superAdminSaga';
import paymentSaga from '../super-admin/paymentSaga';
import subscriptionSaga from '../super-admin/subscriptionSaga';
import invoiceGenerationSaga from '../super-admin/invoiceGenerationSaga';
import tenantSaga from '../super-admin/tenantSaga';

export default function* rootSaga() {
  console.log('🔄 Root saga initialized');
  console.log('🔧 Forking all sagas...');
  yield all([
    fork(authSaga),
    fork(superAdminSaga),
    fork(paymentSaga),
    fork(subscriptionSaga),
    fork(invoiceGenerationSaga),
    fork(tenantSaga)
  ]);
  console.log('✅ All sagas forked successfully');
}