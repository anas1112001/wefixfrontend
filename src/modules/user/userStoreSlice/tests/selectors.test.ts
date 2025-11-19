import { InitialUserState } from '../reducer'
import { getIsLoggedIn, getUserData } from '../selectors'

describe('UserAuthSelectors', () => {
  describe('When getIsLoggedIn is fired', () => {
    it('returns truthy value if the user is logged in', () => {
      const state = { user: { loggedIn: true } }

      expect(getIsLoggedIn(state)).toBeTruthy()
    })

    it('returns falsy value if the user is logged in', () => {
      const state = { user: { loggedIn: false } }

      expect(getIsLoggedIn(state)).toBeFalsy()
    })

    it('returns user data', () => {
      const state = { user: { userData: InitialUserState.userData } }

      expect(getUserData(state)).toStrictEqual(InitialUserState.userData)
    })
  })
})
