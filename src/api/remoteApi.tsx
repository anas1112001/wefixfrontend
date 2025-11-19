import axios, { isCancel } from 'axios';
import SecureStorage from 'modules/secureStorage';
import store from 'modules/store';
import { logoutAction, setAccessToken } from 'modules/user/userStoreSlice';

import { isNeedAuth, isTokenValid } from 'utils/JwtUtils';

type Token = string | null;

const axiosInstance = axios.create({
  baseURL: 'localhost',
  withCredentials: false,
});

export const authorizationHeader = (token: Token) => `Bearer ${token}`;

axiosInstance.defaults.headers.post['Content-Type'] = 'application/json';

const requestHandler = async (config: any) => {
  const needAuth = config.url ? isNeedAuth(config.url) : false;
  const token = await SecureStorage.getAccessToken();
  const tokenValid = isTokenValid(token);

  if (needAuth) {
    if (token && tokenValid) {
      if (config.headers) {
        config.headers.authorization = authorizationHeader(token);
      }
    } else {
      store.dispatch(setAccessToken());
    }
  }

  return config;
};

/* istanbul ignore next */
axiosInstance.interceptors.request.use(
  requestHandler,
  async error => {
    if (!isCancel(error)) {
      throw new Error('axios request error');
    }

    store.dispatch(logoutAction());

    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error?.response?.status === 403 || error?.response?.status === 401) {
      await SecureStorage.clearAccessToken();
      store.dispatch(logoutAction());
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
