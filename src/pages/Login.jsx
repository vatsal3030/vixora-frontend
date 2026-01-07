import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../api/services'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Video, Eye, EyeOff, Mail, Lock, Clock } from 'lucide-react'
import { toast } from 'sonner'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStep, setForgotStep] = useState('email') // email, otp, reset
  const [otpData, setOtpData] = useState({ otp: '', newPassword: '' })
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpExpiry, setOtpExpiry] = useState(0)

  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const loginMessage = location.state?.message

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  // Timer effects for OTP functionality
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  useEffect(() => {
    if (otpExpiry > 0) {
      const timer = setTimeout(() => {
        setOtpExpiry(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [otpExpiry])

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      toast.success('Login successful!')
      navigate('/')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      
      if (errorMessage.includes('verify your email')) {
        setError('Please verify your email first.')
        toast.error('Email verification required')
        setTimeout(() => {
          navigate('/verify-otp', {
            state: {
              email: formData.email,
              identifier: formData.email
            }
          })
        }, 2000)
      } else {
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    // Redirect to Google OAuth
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (forgotStep === 'email') {
        await authService.forgotPassword(forgotEmail)
        setForgotStep('otp')
        setResendCooldown(120) // 2 minutes
        setOtpExpiry(300) // 5 minutes
      } else if (forgotStep === 'otp') {
        await authService.forgotPasswordVerify({ email: forgotEmail, otp: otpData.otp })
        setForgotStep('reset')
      } else if (forgotStep === 'reset') {
        await authService.resetPassword({ 
          email: forgotEmail, 
          otp: otpData.otp, 
          newPassword: otpData.newPassword 
        })
        setShowForgotPassword(false)
        setForgotStep('email')
        setError('')
        toast.success('Password reset successfully! Please login with your new password.')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendForgotOtp = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    setError('')

    try {
      await authService.forgotPassword(forgotEmail)
      setResendCooldown(120) // 2 minutes
      setOtpExpiry(300) // 5 minutes
      toast.success('OTP resent successfully!')
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Video className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to Vidora
          </h2>
        </div>

        {!showForgotPassword ? (
          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {loginMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                    {loginMessage}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:text-primary-hover"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-primary hover:text-primary-hover">
                    Sign up
                  </Link>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Need to verify your email?{' '}
                  <Link to="/email-verification" className="font-medium text-primary hover:text-primary-hover">
                    Verify Email
                  </Link>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Deleted your account?{' '}
                  <Link to="/restore-account" className="font-medium text-blue-600 hover:text-blue-700">
                    Restore Account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                {forgotStep === 'email' && 'Enter your email to receive reset code'}
                {forgotStep === 'otp' && 'Enter the verification code sent to your email'}
                {forgotStep === 'reset' && 'Enter your new password'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {loginMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                    {loginMessage}
                  </div>
                )}

                {forgotStep === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <Input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                )}

                {forgotStep === 'otp' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Verification Code</label>
                      <Input
                        type="text"
                        required
                        value={otpData.otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                          setOtpData(prev => ({ ...prev, otp: value }))
                        }}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {otpExpiry > 0 ? `Expires in ${formatTime(otpExpiry)}` : 'OTP Expired'}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleResendForgotOtp}
                        disabled={resendCooldown > 0 || loading}
                        className="text-primary hover:text-primary-hover disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {resendCooldown > 0 ? `Resend in ${formatTime(resendCooldown)}` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )}

                {forgotStep === 'reset' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <Input
                      type="password"
                      required
                      value={otpData.newPassword}
                      onChange={(e) => setOtpData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      minLength={6}
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setForgotStep('email')
                      setError('')
                      setResendCooldown(0)
                      setOtpExpiry(0)
                    }}
                    className="flex-1"
                  >
                    Back to Login
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || (forgotStep === 'otp' && otpExpiry === 0)} 
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : 
                     forgotStep === 'email' ? 'Send Code' :
                     forgotStep === 'otp' ? 'Verify Code' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Login