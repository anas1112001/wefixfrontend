import { Store, configureStore } from '@reduxjs/toolkit'
import { PersistConfig, persistReducer, persistStore } from 'redux-persist'
import createSensitiveStorage from 'redux-persist-sensitive-storage'

import { setupReactotron } from './middleware/reactotron'
import { rootReducer } from './rootReducer'

export const storage = createSensitiveStorage({})

const setupMiddlewares = () => {
  const middleware: any = [];
  const reactotron = setupReactotron(); 

  const ENV_NAME = 'development'

  // Ensure reactotron and createEnhancer are available
  if (ENV_NAME === 'development' && reactotron && typeof reactotron.createEnhancer === 'function') {
    const reactotronMiddleware = reactotron.createEnhancer();

    if (reactotronMiddleware) {middleware.push(reactotronMiddleware);}
  }

  return middleware;
};

const middleware = setupMiddlewares()

const persistConfig: PersistConfig<RootState> = {
  key: 'newapp',
  storage,
  version: 0.1,
  whitelist: ['user']
}

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer)

export const createStore = (initialState?: RootState) => {
  const store: Store<RootState> = configureStore({
    enhancers: getDefaultEnhancers => getDefaultEnhancers().concat(middleware),
    middleware: getDefault =>
      getDefault({
        immutableCheck: false,
        serializableCheck: false
      }),
    preloadedState: initialState,
    reducer: persistedReducer
  })

  const persistor = persistStore(store)

  return { persistor, store }
}

const { persistor, store } = createStore()

export { persistor }
export default store
