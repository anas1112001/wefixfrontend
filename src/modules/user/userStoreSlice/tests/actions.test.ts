import { logoutAction, setAccessToken, setUserDataInfo, userLoggedIn } from '../actions'

export const authActions = {
  logoutAction: logoutAction(),
  setAccessTokenAction: setAccessToken('token'),
  setAccessTokenActionUndefined: setAccessToken(),
  setUserDataAction: setUserDataInfo({ email: 'test@test.com', id: '0', name: 'test' }),
  // setUserHasToUpdate: userHasToUpdate(),
  setUserIsLoggedIn: userLoggedIn()
}

describe('UserAuthAction', () => {
  describe('When setAccessToken is fired', () => {
    it('returns an object with type SET_ACCESS_TOKEN', () => {
      const actualAuthAction = setAccessToken('token')

      expect(actualAuthAction).toEqual(authActions.setAccessTokenAction)
    })

    it('returns an object with type SET_ACCESS_TOKEN_UNDEFINED', () => {
      const actualAuthAction = setAccessToken()

      expect(actualAuthAction).toEqual(authActions.setAccessTokenActionUndefined)
    })
  })

  describe('When setUserData is fired', () => {
    it('returns an object with type SET_USER_DATA', () => {
      const actualAuthAction = setUserDataInfo({ email: 'test@test.com', id: '0', name: 'test' })

      expect(actualAuthAction).toEqual(authActions.setUserDataAction)
    })
  })

  describe('When userLoggedIn is fired', () => {
    it('returns an object with type SET_USER_IS_LOGGED', () => {
      const actualAuthAction = userLoggedIn()

      expect(actualAuthAction).toEqual(authActions.setUserIsLoggedIn)
    })
  })

  // describe('When setUserHasToUpdate is fired', () => {
  //   it('returns an object with type USER_HAS_TO_UPDATE ', () => {
  //     const actualAuthAction = userHasToUpdate()
  //     expect(actualAuthAction).toEqual(authActions.setUserHasToUpdate)
  //   })
  // })

  describe('When logoutAction is fired', () => {
    it('returns an object with type LOGOUT', () => {
      const actualAuthAction = logoutAction()

      expect(actualAuthAction).toEqual(authActions.logoutAction)
    })
  })
})
