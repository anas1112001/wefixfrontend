import { useLoginWithUsername } from "hooks/user/useLoginWithUsername";
import { useCallback } from "react";

export const LoginRequestApi = () => {
    const loginWithUsername = useLoginWithUsername();
  
    return useCallback(
      async (username: string, password: string) => {
        try {
          const { deviceId, fcmToken, login } = await loginWithUsername(
            username,
            password,
          );
          const hasToken = !!login?.token?.accessToken;
          const hasUser = !!login?.user;
          const success = hasToken && hasUser;
          const message = login?.message || (success ? 'Login completed' : 'Unable to sign in');
  
          return {
            deviceId,
            fcmToken,
            message,
            success,
            token: login?.token ?? null,
            user: login?.user ?? null,
          };
        } catch (error: any) {
          return {
            deviceId: null,
            fcmToken: null,
            message: error?.message || 'Login failed',
            success: false,
            token: null,
            user: null,
          };
        }
      },
      [loginWithUsername],
    );
  };
  