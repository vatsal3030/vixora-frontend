import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../api/services'
import { useAuth } from '../hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const DeleteAccountDialog = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [mathQuestion, setMathQuestion] = useState({ question: '', answer: 0 })
  const [userAnswer, setUserAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 9) + 1 // 1-9
    const num2 = Math.floor(Math.random() * 9) + 1 // 1-9
    const operations = ['+', '-']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    let question, answer
    if (operation === '+') {
      question = `${num1} + ${num2}`
      answer = num1 + num2
    } else {
      // Ensure positive result for subtraction
      const larger = Math.max(num1, num2)
      const smaller = Math.min(num1, num2)
      question = `${larger} - ${smaller}`
      answer = larger - smaller
    }
    
    setMathQuestion({ question, answer })
  }

  const handleOpenDialog = () => {
    setOpen(true)
    setStep(1)
    setUserAnswer('')
    generateMathQuestion()
  }

  const handleMathSubmit = () => {
    if (parseInt(userAnswer) === mathQuestion.answer) {
      setStep(2)
      setUserAnswer('')
    } else {
      toast.error('Incorrect answer. Please try again.')
      generateMathQuestion()
      setUserAnswer('')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setLoading(true)
      await userService.deleteAccount({ confirmed: true })
      
      toast.success('Account deleted successfully. You can restore it within 7 days.')
      
      // Logout and redirect
      await logout()
      navigate('/login')
      setOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleOpenDialog}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Verify You're Human
              </DialogTitle>
              <DialogDescription>
                To proceed with account deletion, please solve this simple math problem:
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-4">
                  {mathQuestion.question} = ?
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer">Your Answer</Label>
                  <Input
                    id="answer"
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter the answer"
                    className="text-center text-lg"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleMathSubmit}
                disabled={!userAnswer.trim()}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Account - Final Confirmation
              </DialogTitle>
              <DialogDescription>
                This action will delete your account and all associated data.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                  What will be deleted:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• All your videos and shorts</li>
                  <li>• All your comments and tweets</li>
                  <li>• Your playlists and watch history</li>
                  <li>• Your subscriptions and followers</li>
                  <li>• Your profile and settings</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
                  Account Recovery:
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You can restore your account within <strong>7 days</strong> by using the "Restore Account" option on the login page.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete My Account'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DeleteAccountDialog