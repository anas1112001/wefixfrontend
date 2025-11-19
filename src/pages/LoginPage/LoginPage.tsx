import Form from 'components/Atoms/Form/Form'
import Heading from 'components/Atoms/Heading/Heading'
import InputField from 'components/Atoms/InputField/InputField'
import Label from 'components/Atoms/Label/Label'
import Paragraph from 'components/Atoms/Paragraph/Paragraph'
import { useNavigate } from 'react-router-dom'
import Button from 'components/Atoms/Button/Button'
import SecureStorage from 'modules/secureStorage'

import Container from 'components/Atoms/Container/Container'
import { FC, useEffect, useState } from 'react'
import { LoginRequestApi } from 'modules/user/LoginRequestApi'
import useForm from 'hooks/useForm'

type LoginStatus = {
  error?: string
  isSubmitting: boolean
  success?: string
}

const defaultLoginValues = {
  password: 'superadmin@123',
  username: 'superadmin@wefix.com',
}

export const LoginPage: FC = () => {
  const loginRequest = LoginRequestApi()

  const navigate = useNavigate()
  
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<LoginStatus>({ isSubmitting: false })

  useEffect(() => {
    document.body.classList.add('login-view')

    return () => {
      document.body.classList.remove('login-view')
    }
  }, [])

  const handleLogin = async (formValues: typeof defaultLoginValues) => {
    setStatus({ error: undefined, isSubmitting: true, success: undefined })

    try {
      const result = await loginRequest(
        formValues.username,
        formValues.password
      )

      if (!result.success || !result.token?.accessToken) {
        throw new Error(result.message)
      }

      SecureStorage.storeAccessToken(result.token.accessToken)

      if (result.token.refreshToken) {
        localStorage.setItem('wefixRefreshToken', result.token.refreshToken)
      }

      if (result.user) {
        localStorage.setItem('wefixUser', JSON.stringify(result.user))
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

  const { formData, handleInputChange, handleSubmit } = useForm(
    defaultLoginValues,
    handleLogin
  )

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
              onChange={handleInputChange}
              placeholder="Enter your email or username"
              required
              type="text"
              value={formData.username}
            />
          </div>

          <div className="loginField">
            <Label>Password</Label>
            <div className="passwordField">
              <InputField
                name="password"
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
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
