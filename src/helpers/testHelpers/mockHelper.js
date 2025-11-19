import remoteApi from '@api/remoteApi'
import MockAdapter from 'axios-mock-adapter'


export const mockApi = new MockAdapter(remoteApi)
