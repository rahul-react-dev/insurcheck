import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';

import authReducer from './authSlice';
import superAdminReducer from './super-admin/superAdminSlice';
import subscriptionReducer from './super-admin/subscriptionSlice';
import paymentReducer from './super-admin/paymentSlice';
import invoiceGenerationReducer from './super-admin/invoiceGenerationSlice';
import tenantReducer from './super-admin/tenantSlice';
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
  payment: paymentReducer,
  invoiceGeneration: invoiceGenerationReducer,
  tenant: tenantReducer,
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