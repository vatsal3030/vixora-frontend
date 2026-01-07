import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../api/services'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Video, Mail, Clock } from 'lucide-react'
import { toast } from 'sonner'

const VerifyOtp = () => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpExpiry, setOtpExpiry] = useState(300) // 5 minutes

  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const identifier = location.state?.identifier || email

  useEffect(() => {
    if (!email && !identifier) {
      navigate('/register')
      return
    }

    // Start OTP expiry countdown
    const expiryTimer = setInterval(() => {
      setOtpExpiry(prev => {
        if (prev <= 1) {
          clearInterval(expiryTimer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(expiryTimer)
  }, [email, identifier, navigate])

  useEffect(() => {
    // Resend cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      await authService.verifyEmail({ identifier, otp })
      setSuccess('Email verified successfully!')
      toast.success('Email verified successfully!')
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Email verified! Please login to continue.' }
        })
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return

    setResendLoading(true)
    setError('')

    try {
      await authService.resendOtp(identifier)
      setSuccess('OTP resent successfully!')
      toast.success('OTP resent successfully!')
      setResendCooldown(120) // 2 minutes cooldown
      setOtpExpiry(300) // Reset to 5 minutes
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
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
            Verify Your Email
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Verification
            </CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to <strong>{email || identifier}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
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
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setOtp(value)
                    setError('')
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
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="text-primary hover:text-primary-hover disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendLoading ? 'Sending...' : 
                   resendCooldown > 0 ? `Resend in ${formatTime(resendCooldown)}` : 
                   'Resend OTP'}
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || otpExpiry === 0}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Wrong email?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="font-medium text-primary hover:text-primary-hover"
                >
                  Go back to registration
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VerifyOtp