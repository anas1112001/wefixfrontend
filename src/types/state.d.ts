// This file provides global type definitions for our redux store where types defined here are accessible globally

import rootReducer from '@modules/rootReducer'

declare global {
  type RootState = ReturnType<typeof rootReducer>
}
