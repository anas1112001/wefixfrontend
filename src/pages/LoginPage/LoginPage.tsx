import React, { ChangeEvent, FC, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from 'components/Atoms/Button/Button';
import Container from 'components/Atoms/Container/Container';
import Form from 'components/Atoms/Form/Form';
import Heading from 'components/Atoms/Heading/Heading';
import InputField from 'components/Atoms/InputField/InputField';
import Label from 'components/Atoms/Label/Label';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import SecureStorage from 'modules/secureStorage';
import { appText } from 'data/appText';
// import { ForgotPasswordModal } from './ForgotPasswordModal';
import styles from './LoginPage.module.css';
import { GRAPHQL_ENDPOINT } from 'utils/apiConfig';

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
        throw new Error(loginData?.message || appText.login.errorMessage);
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
        success: appText.login.successMessage,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: appText.login.successMessage,
        timer: 1500,
        showConfirmButton: false,
      });

      navigate('/dashboard');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : appText.login.errorMessage;

      setStatus({
        error: message,
        isSubmitting: false,
      });

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: message,
      });
    }
  };

  return (
    <>
      <Container 
        className={styles.loginPage}
        style={{
          backgroundImage: 'url(/images/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Container className={styles.loginCard}>
          <Container className={styles.loginCardHeader}>
            <Container className={styles.logoContainer}>
              <i className={`fas fa-wrench ${styles.logoIcon}`}></i>
              <i className={`fas fa-lock ${styles.logoIcon}`}></i>
              <Heading className={styles.logoText} level="2">
                {appText.login.brandName}
              </Heading>
            </Container>
            <Paragraph className={styles.welcomeText}>
              {appText.login.welcomeMessage}
            </Paragraph>
          </Container>

          <Form className={styles.loginForm} onSubmit={handleSubmit}>
            <Container className={styles.loginField}>
              <Label>{appText.login.usernameLabel}</Label>
              <InputField
                name="username"
                onChange={handleChange}
                pattern={undefined}
                placeholder={appText.login.usernamePlaceholder}
                required
                title=""
                type="text"
                value={formValues.username}
              />
            </Container>

            <Container className={styles.loginField}>
              <Label>{appText.login.passwordLabel}</Label>
              <Container className={styles.passwordField}>
                <InputField
                  name="password"
                  onChange={handleChange}
                  pattern={undefined}
                  placeholder={appText.login.passwordPlaceholder}
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
                {appText.login.forgotPassword}
              </button>
            </Container>


            <Button className={styles.loginButton} onClick={() => undefined} type="submit">
              {status.isSubmitting ? appText.login.signingIn : appText.login.signIn}
            </Button>
          </Form>

          <Container className={styles.demoCredentials}>
            <Container className={styles.demoHeader}>
              <i className={`fas fa-wrench ${styles.demoIcon}`}></i>
              <i className={`fas fa-lock ${styles.demoIcon}`}></i>
              <Paragraph className={styles.demoTitle}>{appText.login.demoCredentials}</Paragraph>
            </Container>
            <Paragraph className={styles.demoText}>{appText.login.demoUsername}</Paragraph>
            <Paragraph className={styles.demoText}>{appText.login.demoPassword}</Paragraph>
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
