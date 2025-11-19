import { IUserDataInfo } from 'types/user/user'

export const getIsLoggedIn = (state: RootState): boolean => state.user.loggedIn

export const getUserData = (state: RootState): IUserDataInfo => state.user.userData

export const getAllUsers = (state: RootState): IUserDataInfo[] => state.user.users
