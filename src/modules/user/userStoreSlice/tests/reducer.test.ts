import { authActions } from './actions.test'

import { InitialUserState, UserAuthReducer } from '../reducer'

export const authState = {
  emptyState: {
    accessToken: '',
    hasToUpdate: false,
    loggedIn: false,
    userData: InitialUserState.userData,
    users: []
  },
  stateWithToken: {
    accessToken: 'token',
    hasToUpdate: false,
    loggedIn: false,
    userData: InitialUserState.userData
  },
  stateWithUserData: {
    accessToken: '',
    hasToUpdate: false,
    loggedIn: false,
    userData: {
      email: 'test@test.com',
      userName: 'test'
    }
  },
  // stateWithUserHasToUpdate: {
  //   accessToken: '',
  //   hasToUpdate: false,
  //   loggedIn: false,
  //   userData: InitialUserState.userData
  // },
  stateWithUserLoggedIn: {
    accessToken: '',
    hasToUpdate: false,
    loggedIn: true,
    userData: InitialUserState.userData
  },
  stateWithUserLoggedOut: {
    accessToken: '',
    hasToUpdate: false,
    loggedIn: false,
    userData: {}
  }
}

describe('UserAuthReducer', () => {
  describe('When reducer is called', () => {
    it('should initialise the state', () => {
      const actualState = UserAuthReducer(authState.emptyState, {})

      expect(actualState).toEqual(authState.emptyState)
    })

    it('should store access token', () => {
      const actualState = UserAuthReducer(authState.emptyState, authActions.setAccessTokenAction)

      expect(actualState).toEqual(authState.stateWithToken)
    })

    it('should store user data', () => {
      const actualState = UserAuthReducer(authState.emptyState, authActions.setUserDataAction)

      expect(actualState).toEqual(authState.stateWithUserData)
    })

    it('should logout', () => {
      const actualState = UserAuthReducer(authState.emptyState, authActions.logoutAction)

      expect(actualState).toEqual(authState.stateWithUserLoggedOut)
    })

    // it('should return object with user has to update', () => {
    //   const actualState = UserAuthReducer(authState.emptyState, authActions.setUserHasToUpdate)
    //   expect(actualState).toEqual(authState.stateWithUserHasToUpdate)
    // })

    it('should return object with user logged in', () => {
      const actualState = UserAuthReducer(authState.emptyState, authActions.setUserIsLoggedIn)

      expect(actualState).toEqual(authState.stateWithUserLoggedIn)
    })
  })
})
