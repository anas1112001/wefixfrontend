export type UserRole = 'user' | 'tester' | 'admin'

export interface IUserDataInfo {
  createdAt?: Date,
  deviceId?: string,
  email?: string,
  email?: string,
  id?: string,
  id?: number,
  imageUrl?: string,
  name?: string,
  name?: string,
  updatedAt?: Date
}

export interface IUser {
  accessToken?: string
  hasToUpdate: boolean
  loggedIn: boolean
  refreshToken?: string
  refreshTokenUpdated?: number
  userData?: IUserDataInfo
  users: IUserDataInfo[]
}
