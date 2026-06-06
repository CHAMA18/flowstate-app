'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Zap, ArrowLeft, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type AuthView = 'signIn' | 'signUp' | 'forgotPassword'

interface AuthPageProps {
  onBack: () => void
  onSuccess: () => void
}

export function AuthPage({ onBack, onSuccess }: AuthPageProps) {
  const [view, setView] = useState<AuthView>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { signIn, signUp, signInWithGoogle, resetPassword, loading, error, clearError } = useAuthStore()

  const handleSignIn = async () => {
    clearError()
    if (!email || !password) return
    await signIn(email, password)
    if (!useAuthStore.getState().error) {
      onSuccess()
    }
  }

  const handleSignUp = async () => {
    clearError()
    if (!email || !password || !displayName) return
    await signUp(email, password, displayName)
    if (!useAuthStore.getState().error) {
      onSuccess()
    }
  }

  const handleResetPassword = async () => {
    clearError()
    if (!email) return
    await resetPassword(email)
    if (!useAuthStore.getState().error) {
      setSuccessMessage('Password reset email sent! Check your inbox.')
    }
  }

  const handleGoogleSignIn = async () => {
    clearError()
    await signInWithGoogle()
    if (!useAuthStore.getState().error) {
      onSuccess()
    }
  }

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-[20%] -left-[15%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.78 0.16 65 / 8%) 0%, transparent 70%)' }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-[20%] -right-[15%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.16 160 / 6%) 0%, transparent 70%)' }}
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Back button */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </motion.button>

        {/* Auth Card */}
        <motion.div
          className={cn(
            'bg-card/60 backdrop-blur-xl rounded-2xl p-8 border border-border/40',
            'shadow-2xl shadow-primary/5'
          )}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/25 mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {view === 'signIn' && 'Welcome back'}
              {view === 'signUp' && 'Create your account'}
              {view === 'forgotPassword' && 'Reset password'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {view === 'signIn' && 'Sign in to continue to FlowState'}
              {view === 'signUp' && 'Start your deep focus journey'}
              {view === 'forgotPassword' && 'We\'ll send you a reset link'}
            </p>
          </div>

          {/* Error display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success display */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm overflow-hidden"
              >
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <div className="space-y-4">
            {/* Google Sign In */}
            {view !== 'forgotPassword' && (
              <>
                <Button
                  variant="outline"
                  className="w-full h-11 gap-3 border-border/50 hover:bg-muted/50 text-sm font-medium"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="flex items-center gap-3">
                  <Separator className="flex-1 bg-border/50" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
                  <Separator className="flex-1 bg-border/50" />
                </div>
              </>
            )}

            {/* Sign Up: Display Name */}
            <AnimatePresence>
              {view === 'signUp' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-xs font-medium text-muted-foreground">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        id="displayName"
                        placeholder="Your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10 h-11 bg-muted/20 border-border/50 focus:border-primary/50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); setSuccessMessage(null) }}
                  className="pl-10 h-11 bg-muted/20 border-border/50 focus:border-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (view === 'signIn') handleSignIn()
                      else if (view === 'signUp') handleSignUp()
                      else handleResetPassword()
                    }
                  }}
                />
              </div>
            </div>

            {/* Password */}
            {view !== 'forgotPassword' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
                  {view === 'signIn' && (
                    <button
                      onClick={() => { setView('forgotPassword'); clearError(); setSuccessMessage(null) }}
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={view === 'signUp' ? 'At least 6 characters' : 'Your password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError() }}
                    className="pl-10 pr-10 h-11 bg-muted/20 border-border/50 focus:border-primary/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (view === 'signIn') handleSignIn()
                        else if (view === 'signUp') handleSignUp()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={() => {
                if (view === 'signIn') handleSignIn()
                else if (view === 'signUp') handleSignUp()
                else handleResetPassword()
              }}
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 text-sm font-medium gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {view === 'signIn' && 'Sign In'}
                  {view === 'signUp' && 'Create Account'}
                  {view === 'forgotPassword' && 'Send Reset Link'}
                </>
              )}
            </Button>

            {/* Switch views */}
            <div className="text-center text-sm text-muted-foreground pt-2">
              {view === 'signIn' && (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => { setView('signUp'); clearError(); setSuccessMessage(null) }}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign up
                  </button>
                </>
              )}
              {view === 'signUp' && (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => { setView('signIn'); clearError(); setSuccessMessage(null) }}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
              {view === 'forgotPassword' && (
                <>
                  Remember your password?{' '}
                  <button
                    onClick={() => { setView('signIn'); clearError(); setSuccessMessage(null) }}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Terms */}
        {view === 'signUp' && (
          <p className="text-center text-[11px] text-muted-foreground/60 mt-6 px-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy. Your data is encrypted and secure.
          </p>
        )}
      </div>
    </div>
  )
}
