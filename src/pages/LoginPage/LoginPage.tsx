import React, { ChangeEvent, FC, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/Atoms/Button/Button';
import Container from 'components/Atoms/Container/Container';
import Form from 'components/Atoms/Form/Form';
import Heading from 'components/Atoms/Heading/Heading';
import InputField from 'components/Atoms/InputField/InputField';
import Label from 'components/Atoms/Label/Label';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import SecureStorage from 'modules/secureStorage';
// import { ForgotPasswordModal } from './ForgotPasswordModal';
import styles from './LoginPage.module.css';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_API_URL ?? 'http://localhost:4000/graphql';

type LoginStatus = {
  error?: string;
  isSubmitting: boolean;
  success?: string;
};

const defaultLoginValues = {
  password: 'superadmin@123',
  username: 'superadmin',
};

export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(defaultLoginValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [status, setStatus] = useState<LoginStatus>({ isSubmitting: false });

  useEffect(() => {
    document.body.classList.add('login-view');

    return () => {
      document.body.classList.remove('login-view');
    };
  }, []);

  const deviceMeta = useMemo(() => {
    const hasNavigator = typeof navigator !== 'undefined';
    const base = hasNavigator ? navigator.userAgent : 'web-browser';
    const locale = hasNavigator ? navigator.language : 'en';

    return {
      deviceId: base.toLowerCase().slice(0, 32),
      fcmToken: `web-fcm-${locale}`,
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ error: undefined, isSubmitting: true, success: undefined });

    try {
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
                }
              }
            }
          `,
          variables: {
            loginData: {
              deviceId: deviceMeta.deviceId,
              email: formValues.username.trim().toLowerCase(),
              fcmToken: deviceMeta.fcmToken,
              password: formValues.password,
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

      const loginData = payload?.data?.login;
      const accessToken = loginData?.token?.accessToken;
      const refreshToken = loginData?.token?.refreshToken;

      if (!response.ok || !accessToken) {
        throw new Error(loginData?.message || 'Unable to sign in');
      }

      SecureStorage.storeAccessToken(accessToken);

      if (refreshToken) {
        localStorage.setItem('wefixRefreshToken', refreshToken);
      }

      if (loginData?.user) {
        localStorage.setItem('wefixUser', JSON.stringify(loginData.user));
      }

      setStatus({
        error: undefined,
        isSubmitting: false,
        success: 'Signed in successfully. Redirecting…',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to sign in. Please try again.';

      setStatus({
        error: message,
        isSubmitting: false,
      });
    }
  };

  return (
    <>
      <Container className={styles.loginPage}>
        <Container className={styles.loginCard}>
          <Container className={styles.loginCardHeader}>
            <Container className={styles.logoContainer}>
              <i className={`fas fa-wrench ${styles.logoIcon}`}></i>
              <i className={`fas fa-lock ${styles.logoIcon}`}></i>
              <Heading className={styles.logoText} level="2">
                WeFix
              </Heading>
            </Container>
            <Paragraph className={styles.welcomeText}>
              Welcome back! Please sign in to your account
            </Paragraph>
          </Container>

          <Form className={styles.loginForm} onSubmit={handleSubmit}>
            <Container className={styles.loginField}>
              <Label>Username</Label>
              <InputField
                name="username"
                onChange={handleChange}
                pattern={undefined}
                placeholder="Enter your email or username"
                required
                title=""
                type="text"
                value={formValues.username}
              />
            </Container>

            <Container className={styles.loginField}>
              <Label>Password</Label>
              <Container className={styles.passwordField}>
                <InputField
                  name="password"
                  onChange={handleChange}
                  pattern={undefined}
                  placeholder="Enter your password"
                  required
                  title=""
                  type={showPassword ? 'text' : 'password'}
                  value={formValues.password}
                />
                <button
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((previous) => !previous)}
                  type="button"
                >
                  <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </Container>
            </Container>

            <Container className={styles.loginMeta}>
              <button
                className={styles.forgotPasswordLink}
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgotPassword(true);
                }}
                type="button"
              >
                Forgot Password?
              </button>
            </Container>

            {status.error && <Paragraph className={styles.loginError}>{status.error}</Paragraph>}
            {status.success && (
              <Paragraph className={styles.loginSuccess}>{status.success}</Paragraph>
            )}

            <Button className={styles.loginButton} onClick={() => undefined} type="submit">
              {status.isSubmitting ? 'Signing In…' : 'Sign In'}
            </Button>
          </Form>

          <Container className={styles.demoCredentials}>
            <Container className={styles.demoHeader}>
              <i className={`fas fa-wrench ${styles.demoIcon}`}></i>
              <i className={`fas fa-lock ${styles.demoIcon}`}></i>
              <Paragraph className={styles.demoTitle}>Demo Credentials</Paragraph>
            </Container>
            <Paragraph className={styles.demoText}>Username: superadmin</Paragraph>
            <Paragraph className={styles.demoText}>Password: superadmin@123</Paragraph>
          </Container>
        </Container>
      </Container>

      {showForgotPassword && (
        <Container className={styles.modalOverlay} onClick={() => setShowForgotPassword(false)}>
          <Container className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Paragraph>Forgot Password functionality coming soon</Paragraph>
            <Button onClick={() => setShowForgotPassword(false)} type="button">
              Close
            </Button>
          </Container>
        </Container>
      )}
    </>
  );
};
