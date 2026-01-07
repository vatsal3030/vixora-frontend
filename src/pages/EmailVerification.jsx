import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../api/services'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Video, Mail } from 'lucide-react'

const EmailVerification = () => {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!identifier.trim()) {
      setError('Please enter your email or username')
      return
    }

    setLoading(true)
    setError('')

    try {
      await authService.resendOtp(identifier)
      setSuccess('OTP sent successfully! Redirecting to verification...')
      setTimeout(() => {
        navigate('/verify-otp', {
          state: {
            email: identifier,
            identifier: identifier
          }
        })
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Video className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Request Verification Code
            </CardTitle>
            <CardDescription>
              Enter your email or username to receive a verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                  Email or Username
                </label>
                <Input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter your email or username"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have a code?{' '}
                <button
                  onClick={() => navigate('/verify-otp')}
                  className="font-medium text-primary hover:text-primary-hover"
                >
                  Enter verification code
                </button>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Back to{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-medium text-primary hover:text-primary-hover"
                >
                  Login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EmailVerification