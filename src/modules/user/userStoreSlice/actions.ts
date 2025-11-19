
import SecureStorage from 'modules/secureStorage'
import { AuthActions } from 'types/user/action.types'
import { IUserDataInfo } from 'types/user/user'

const createSetAccessTokenAction = (accessToken?: string) => ({
  payload: { accessToken },
  type: AuthActions.SET_ACCESS_TOKEN
})

export const setAccessToken = (accessToken?: any) => {
  if (accessToken) {SecureStorage.storeAccessToken(accessToken)}

  return createSetAccessTokenAction(accessToken)
}

export const setUserDataInfo = (data: IUserDataInfo) => ({
  payload: data,
  type: AuthActions.SET_USER_DATA
})

export const setUsersDataInfo = (data: IUserDataInfo[]) => ({
  payload: data,
  type: AuthActions.SET_USERS
})

export const resetUsersDataInfo = () => ({
  payload: [],
  type: AuthActions.RESET_USERS
})

export const resetUserDataInfo = () => ({
  payload: undefined,
  type: AuthActions.SET_USER_DATA
})

export const userLoggedIn = () => ({
  type: AuthActions.SET_USER_IS_LOGGED
})

export const userHasToUpdate = () => ({
  type: AuthActions.USER_HAS_TO_UPDATE
})

export const logoutAction = () => {
  SecureStorage.clearAccessToken()

  return { type: AuthActions.LOGOUT }
}
