import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "@/modules/auth/auth.slice";
import { ordersReducer } from "@/modules/pickup-requests/pickup-requests.slice";
import { authApi } from "@/modules/auth/auth.api";
import { customersApi } from "@/modules/customers/customers.api";
import { settingsReducer } from "./settings.slice";
import { ordersApi } from "@/modules/pickup-requests/pickup-requests.api";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  useDispatch as useDispatchWithTypes,
  useSelector as useSelectorWithTypes,
} from "react-redux";
import { routesApi } from "@/modules/pickup-requests/routes.api";
import { healthApi } from "@/modules/health/health.api";
import { companiesApi } from "@/modules/companies/companies.api";
import { usersApi as adminUsersApi } from "@/modules/admin/users.api";
import { routesApi as adminRoutesApi } from "@/modules/admin/routes.api";
import { setupListeners } from "@reduxjs/toolkit/query";

const rootReducer = combineReducers({
  auth: authReducer,
  orders: ordersReducer,
  settings: settingsReducer,
  [authApi.reducerPath]: authApi.reducer,
  [customersApi.reducerPath]: customersApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
  [routesApi.reducerPath]: routesApi.reducer,
  [healthApi.reducerPath]: healthApi.reducer,
  [companiesApi.reducerPath]: companiesApi.reducer,
  [adminUsersApi.reducerPath]: adminUsersApi.reducer,
  [adminRoutesApi.reducerPath]: adminRoutesApi.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "settings"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(authApi.middleware)
      .concat(customersApi.middleware)
      .concat(ordersApi.middleware)
      .concat(routesApi.middleware)
      .concat(healthApi.middleware)
      .concat(companiesApi.middleware)
      .concat(adminUsersApi.middleware)
      .concat(adminRoutesApi.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch = () => useDispatchWithTypes<AppDispatch>();
export const useSelector = useSelectorWithTypes<RootState>;
