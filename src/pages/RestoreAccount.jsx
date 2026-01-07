import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { userService } from '../api/services'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { RotateCcw, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

const RestoreAccount = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: email/username, 2: OTP verification
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    otp: ''
  })
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useDocumentTitle('Restore Account')

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    
    if (!formData.email.trim() && !formData.username.trim()) {
      toast.error('Please enter either email or username')
      return
    }

    try {
      setLoading(true)
      await userService.restoreAccountRequest({
        email: formData.email,
        username: formData.username
      })
      
      toast.success('OTP sent to your email address')
      setStep(2)
      startResendCooldown()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    
    if (!formData.otp.trim()) {
      toast.error('Please enter the OTP')
      return
    }

    try {
      setLoading(true)
      await userService.restoreAccountConfirm({
        email: formData.email,
        username: formData.username,
        otp: formData.otp
      })
      
      toast.success('Account restored successfully!')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    
    try {
      setLoading(true)
      await userService.restoreAccountRequest({
        email: formData.email,
        username: formData.username
      })
      
      toast.success('OTP resent to your email')
      startResendCooldown()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const startResendCooldown = () => {
    setResendCooldown(120) // 2 minutes
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
            <RotateCcw className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Restore Account</h1>
          <p className="text-muted-foreground">
            Recover your deleted account within 7 days
          </p>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Account Details</CardTitle>
              <CardDescription>
                Provide your email or username to receive a restoration code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  OR
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || (!formData.email.trim() && !formData.username.trim())}
                >
                  {loading ? 'Sending...' : 'Send Restoration Code'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Verify Your Email
              </CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to your email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    autoFocus
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || formData.otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Restore Account'}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={loading || resendCooldown > 0}
                  >
                    {resendCooldown > 0 
                      ? `Resend in ${formatTime(resendCooldown)}`
                      : 'Resend Code'
                    }
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Account Details
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  Account Recovery Window
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Deleted accounts can be restored within 7 days. After this period, 
                  all data will be permanently deleted and cannot be recovered.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Link 
            to="/login" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RestoreAccount