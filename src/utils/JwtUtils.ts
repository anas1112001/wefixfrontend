import { AxiosResponse } from 'axios'
import { InvalidTokenError, JwtPayload, jwtDecode } from 'jwt-decode'

export type AppJwtPayload = JwtPayload & {
  address_one: string | null
  address_two: string | null
  city: string | null
  device_id: string | null
  email: string | null
  exp: number | null
  iat: number | null
  id: number | null
  is_provide_staging: boolean
  mobile_number: string | null
  number_of_users_rated: string | null
  password: string | null
  profile_picture: string | null
  rate: string | null
  state: string | null
  store_name: string | null
  stripe_card_id: string | null
  stripe_connect_id: string | null
  stripe_id: string | null
  user_name: string | null
  zipcode: string | null
}

export interface IChangePasswordPayload {
  newPassword: string
  oldPassword: string
}

const MIN_SESSION_LENGTH = 30 * 60 * 1000

export const isTokenValid = (token?: string): boolean => {
  if (!token) {return false}

  const { exp } = jwtDecode<AppJwtPayload>(token)

  /* istanbul ignore next */
  const expiry = typeof exp === 'string' ? parseInt(exp, 10) : exp
  /* istanbul ignore next */
  const diff = expiry !== undefined && expiry * 1000 - Date.now()

  return diff.toString() >= MIN_SESSION_LENGTH.toString()
}

export interface IExtractToken {
  decodedToken: any
  token: any
}

export const extractAuthToken = (response: AxiosResponse<any, any>): IExtractToken => {
  const token = response.data

  if (!token) {throw new InvalidTokenError()}

  const decodedToken = jwtDecode<JwtPayload>(token)


  return { decodedToken, token }
}

export const isNeedAuth = (url: string): boolean => {
  const endpoints = {
    '/users': { method: 'get', needAuth: true }
  }

  // Checking specifically for the search endpoint
  if (url.startsWith('/friend/search')) {
    return true
  }

  // If the exact URL is in the endpoints, return its needAuth value
  if (endpoints[url]) {
    return endpoints[url].needAuth
  }

  // If the URL starts with a known endpoint, return its needAuth value
  for (const key in endpoints) {
    if (url.startsWith(key)) {
      return endpoints[key].needAuth
    }
  }

  // If none of the above conditions are met, default to false.
  return false
}
