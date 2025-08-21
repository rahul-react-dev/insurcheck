import { all, fork } from 'redux-saga/effects';
import authSaga from './authSaga';
import superAdminSaga from '../super-admin/superAdminSaga';
import paymentSaga from '../super-admin/paymentSaga';
import subscriptionSaga from '../super-admin/subscriptionSaga';
import invoiceGenerationSaga from '../super-admin/invoiceGenerationSaga';
import tenantSaga from '../super-admin/tenantSaga';
import activityLogSaga from '../super-admin/activityLogSaga';
import tenantStateSaga from '../super-admin/tenantStateSaga';
import deletedDocumentsSaga from '../super-admin/deletedDocumentsSaga';
import systemConfigSaga from '../super-admin/systemConfigSaga';
import analyticsSaga from '../super-admin/analyticsSaga';
import adminSaga from '../admin/adminSaga';
import notificationTemplatesSaga from '../admin/notificationTemplatesSaga';
import invoicesSaga from '../admin/invoicesSaga';
import complianceAnalyticsSaga from '../admin/complianceAnalyticsSaga';
import complianceRulesSaga from '../admin/complianceRulesSaga';

export default function* rootSaga() {
  console.log('🔄 Root saga initialized');
  console.log('🔧 Forking all sagas...');
  yield all([
    fork(authSaga),
    fork(superAdminSaga),
    fork(paymentSaga),
    fork(subscriptionSaga),
    fork(invoiceGenerationSaga),
    fork(tenantSaga),
    fork(activityLogSaga),
    fork(tenantStateSaga),
    fork(deletedDocumentsSaga),
    fork(systemConfigSaga),
    fork(analyticsSaga),
    fork(adminSaga),
    fork(notificationTemplatesSaga),
    fork(invoicesSaga),
    fork(complianceAnalyticsSaga),
    fork(complianceRulesSaga),
  ]);
  console.log('✅ All sagas forked successfully');
}