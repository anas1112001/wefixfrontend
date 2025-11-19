import { AuthActions } from 'types/user/action.types'
import { IUser } from 'types/user/user'


export const InitialUserState: IUser = {
  accessToken: '',
  hasToUpdate: false,
  loggedIn: false,
  userData: {
    email: '',
    name: ''
  },
  users: []
}

export const UserAuthReducer = (state: IUser = InitialUserState, action: any): IUser => {
  switch (action.type) {
    case AuthActions.SET_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: action.payload.accessToken
      }

    case AuthActions.USER_HAS_TO_UPDATE:
      return {
        ...state,
        hasToUpdate: true
      }

    case AuthActions.SET_USER_IS_LOGGED:
      return {
        ...state,
        loggedIn: true
      }

    case AuthActions.SET_USERS:
      return {
        ...state,
        users: action.payload
      }

    case AuthActions.RESET_USERS:
      return {
        ...state,
        users: []
      }

    case AuthActions.SET_USER_DATA:
      return {
        ...state,
        userData: action.payload
      }

    case AuthActions.RESET_USER_DATA:
      return {
        ...state,
        userData: undefined
      }

    case AuthActions.LOGOUT:
      return {
        ...state,
        accessToken: '',
        hasToUpdate: false,
        loggedIn: false,
        userData: {}
      }

    default:
      return state
  }
}
