import { GRAPHQL_ENDPOINT } from "api/endpoints";
import { useCallback } from "react";


export const useLoginWithUsername = () =>
  useCallback(async (username: string, password: string) => {
    const hasNavigator = typeof navigator !== 'undefined';
    const deviceId = hasNavigator
      ? navigator.userAgent.toLowerCase().slice(0, 32)
      : 'web-browser';
    const locale = hasNavigator ? navigator.language : 'en';
    const fcmToken = `web-fcm-${locale}`;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({
        query: `
          mutation Login($loginData: LoginInput!) {
            login(loginData: $loginData) {
              message
              token {
                accessToken
                refreshToken
                tokenType
                expiresIn
              }
              user {
                id
                firstName
                lastName
                email
                userRole
                companyRole
              }
            }
          }
        `,
        variables: {
          loginData: {
            deviceId,
            email: username.trim().toLowerCase(),
            fcmToken,
            password,
          },
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const payload = await response.json();

    if (payload.errors?.length) {
      throw new Error(payload.errors[0].message);
    }

    return {
      deviceId,
      fcmToken,
      login: payload?.data?.login,
    };
  }, []);