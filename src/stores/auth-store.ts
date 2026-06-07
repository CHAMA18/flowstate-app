import { create } from 'zustand'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
  initialize: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, initialized: true, loading: false })
    })
    return unsubscribe
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null })
    try {
      await signInWithEmailAndPassword(auth, email, password)
      set({ loading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      set({ error: formatFirebaseError(message), loading: false })
    }
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true, error: null })
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName })
      set({ loading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      set({ error: formatFirebaseError(message), loading: false })
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null })
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      set({ loading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign in failed'
      set({ error: formatFirebaseError(message), loading: false })
    }
  },

  logout: async () => {
    set({ loading: true, error: null })
    try {
      await signOut(auth)
      set({ loading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      set({ error: formatFirebaseError(message), loading: false })
    }
  },

  resetPassword: async (email) => {
    set({ loading: true, error: null })
    try {
      await sendPasswordResetEmail(auth, email)
      set({ loading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Password reset failed'
      set({ error: formatFirebaseError(message), loading: false })
    }
  },

  clearError: () => set({ error: null }),
}))

function formatFirebaseError(error: string): string {
  if (error.includes('auth/user-not-found')) return 'No account found with this email.'
  if (error.includes('auth/wrong-password')) return 'Incorrect password.'
  if (error.includes('auth/email-already-in-use')) return 'An account with this email already exists.'
  if (error.includes('auth/weak-password')) return 'Password must be at least 6 characters.'
  if (error.includes('auth/invalid-email')) return 'Please enter a valid email address.'
  if (error.includes('auth/too-many-requests')) return 'Too many attempts. Please try again later.'
  if (error.includes('auth/network-request-failed')) return 'Network error. Please check your connection.'
  if (error.includes('auth/popup-closed-by-user')) return 'Sign in was cancelled.'
  return error || 'An unexpected error occurred.'
}
