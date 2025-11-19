import Form from 'components/Atoms/Form/Form'
import Heading from 'components/Atoms/Heading/Heading'
import InputField from 'components/Atoms/InputField/InputField'
import Label from 'components/Atoms/Label/Label'
import Paragraph from 'components/Atoms/Paragraph/Paragraph'
import { useNavigate } from 'react-router-dom'
import Button from 'components/Atoms/Button/Button'
import SecureStorage from 'modules/secureStorage'

import { ChangeEvent, FC, FormEvent, useEffect, useMemo, useState } from 'react'
import Container from 'components/Atoms/Container/Container'

type LoginStatus = {
  error?: string
  isSubmitting: boolean
  success?: string
}

const defaultLoginValues = {
  password: 'superadmin@123',
  username: 'superadmin@wefix.com',
}

const GRAPHQL_ENDPOINT =
  process.env.REACT_APP_API_URL ?? 'https://wefix.ngrok.app/graphql'

export const LoginPage: FC = () => {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState(defaultLoginValues)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<LoginStatus>({ isSubmitting: false })

  useEffect(() => {
    document.body.classList.add('login-view')

    return () => {
      document.body.classList.remove('login-view')
    }
  }, [])


  const deviceMeta = useMemo(() => {
    const hasNavigator = typeof navigator !== 'undefined'
    const base = hasNavigator ? navigator.userAgent : 'web-browser'
    const locale = hasNavigator ? navigator.language : 'en'

    return {
      deviceId: base.toLowerCase().slice(0, 32),
      fcmToken: `web-fcm-${locale}`,
    }
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus({ error: undefined, isSubmitting: true, success: undefined })

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
                    companyRole
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
      })

      const payload = await response.json()

      if (payload.errors?.length) {
        throw new Error(payload.errors[0].message)
      }

      const loginData = payload?.data?.login
      const accessToken = loginData?.token?.accessToken
      const refreshToken = loginData?.token?.refreshToken

      if (!response.ok || !accessToken) {
        throw new Error(loginData?.message || 'Unable to sign in')
      }

      SecureStorage.storeAccessToken(accessToken)

      if (refreshToken) {
        localStorage.setItem('wefixRefreshToken', refreshToken)
      }

      if (loginData?.user) {
        localStorage.setItem('wefixUser', JSON.stringify(loginData.user))
      }

      setStatus({
        error: undefined,
        isSubmitting: false,
        success: 'Signed in successfully. Redirecting…',
      })

      setTimeout(() => {
        navigate('/')
      }, 800)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.'

      setStatus({
        error: message,
        isSubmitting: false,
      })
    }
  }

  const demoCredentials = [
    {
      password: 'superadmin@123',
      username: 'superadmin@wefix.com',
    },
    {
      password: 'superadmin@123',
      username: 'technician@wefix.com',
    },
    {
      password: 'superadmin@123',
      username: 'jadabuawwad@outlook.com',
    },
  ]

  return (
    <div className="loginPage">
      <Container className="loginCard">
        <div className="loginCardHeader">
          <span aria-hidden="true" className="loginIcon">
            🔧
          </span>
          <Heading className="loginTitle" level="2">
            WeFix
          </Heading>
          <Paragraph className="loginSubtitle">
            Welcome back! Please sign in to your account
          </Paragraph>
        </div>

        <Form className="loginForm" onSubmit={handleSubmit}>
          <div className="loginField">
            <Label>Username</Label>
            <InputField
              name="username"
              onChange={handleChange}
              placeholder="Enter your email or username"
              required
              type="text"
              value={formValues.username}
            />
          </div>

          <div className="loginField">
            <Label>Password</Label>
            <div className="passwordField">
              <InputField
                name="password"
                onChange={handleChange}
                placeholder="Enter your password"
                required
                type={showPassword ? 'text' : 'password'}
                value={formValues.password}
              />
              <button
                className="passwordToggle"
                onClick={() => setShowPassword((previous) => !previous)}
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="loginMeta">
            <a className="loginLink" href="#forgot-password">
              Forgot Password?
            </a>
          </div>

          {status.error && (
            <Paragraph className="loginError">{status.error}</Paragraph>
          )}
          {status.success && (
            <Paragraph className="loginSuccess">{status.success}</Paragraph>
          )}

          <Button
            className="loginButton"
            onClick={() => undefined}
            type="submit"
          >
            {status.isSubmitting ? 'Signing In…' : 'Sign In'}
          </Button>
        </Form>

        <div className="loginDemo">
          <Paragraph className="loginDemoTitle">🔑 Demo Credentials</Paragraph>
          <ul>
            {demoCredentials.map((credentials) => (
              <li key={credentials.username}>
                <strong>Username:</strong> {credentials.username}
                <br />
                <strong>Password:</strong> {credentials.password}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  )
}
