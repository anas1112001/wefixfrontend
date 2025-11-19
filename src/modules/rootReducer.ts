import { combineReducers } from 'redux'
import { IUser } from 'types/user/user'

import { UserAuthReducer } from './user/userStoreSlice'

export const rootReducer: any = combineReducers({
  user: UserAuthReducer
})

export type ApplicationState = {
  user: IUser
}

export type State = ReturnType<typeof rootReducer>
