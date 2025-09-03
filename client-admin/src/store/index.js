import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

// Import reducers
import authReducer from './authSlice';
import superAdminReducer from './super-admin/superAdminSlice';
import subscriptionReducer from './super-admin/subscriptionSlice';
import paymentReducer from './super-admin/paymentSlice';
import invoiceGenerationReducer from './super-admin/invoiceGenerationSlice';
import tenantReducer from './super-admin/tenantSlice';
import activityLogReducer from './super-admin/activityLogSlice';
import tenantStateReducer from './super-admin/tenantStateSlice';
import deletedDocumentsReducer from './super-admin/deletedDocumentsSlice';
import systemConfigReducer from './super-admin/systemConfigSlice';
import analyticsReducer from './super-admin/analyticsSlice';
import adminReducer from './admin/adminSlice'; // Import the new admin reducer
import notificationTemplatesReducer from './admin/notificationTemplatesSlice';
import invoicesReducer from './admin/invoicesSlice';
import complianceAnalyticsReducer from './admin/complianceAnalyticsSlice';
import complianceRulesReducer from './admin/complianceRulesSlice';
import adminSubscriptionReducer from './admin/subscriptionSlice';

import rootSaga from './sagas';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'superAdmin', 'subscription'] // Persist auth, superAdmin and subscription slices
};

const rootReducer = combineReducers({
  auth: authReducer,
  superAdmin: superAdminReducer,
  subscription: subscriptionReducer,
  invoiceGeneration: invoiceGenerationReducer,
  payment: paymentReducer,
  tenant: tenantReducer,
  activityLog: activityLogReducer,
  tenantState: tenantStateReducer,
  deletedDocuments: deletedDocumentsReducer,
  systemConfig: systemConfigReducer,
  analytics: analyticsReducer,
  admin: adminReducer, // Add the admin reducer to the root reducer
  notificationTemplates: notificationTemplatesReducer,
  invoices: invoicesReducer,
  complianceAnalytics: complianceAnalyticsReducer,
  complianceRules: complianceRulesReducer,
  adminSubscription: adminSubscriptionReducer,

});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware),
});

console.log('📦 Store configured with reducers:', Object.keys(store.getState()));
console.log('🔧 Starting root saga...');
sagaMiddleware.run(rootSaga);
console.log('✅ Root saga started successfully');

export const persistor = persistStore(store);
export default store;