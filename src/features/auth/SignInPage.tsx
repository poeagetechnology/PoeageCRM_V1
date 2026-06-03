import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/hooks/useAuthStore'
import { Button, Input } from '@/components/ui'

interface FormData { email: string; password: string }

export function SignInPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const user = await authService.signIn(data.email, data.password)
      setUser(user)
      navigate('/dashboard')
    } catch (e: any) {
      setError(e.code === 'auth/invalid-credential' ? 'Invalid email or password.' : 'Sign in failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4"
      style={{ backgroundImage: 'radial-gradient(at 30% 20%, rgba(59,130,246,0.07) 0px, transparent 60%), radial-gradient(at 80% 80%, rgba(139,92,246,0.05) 0px, transparent 60%)' }}>
      <div className="w-full max-w-md animate-in">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-blue">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">PoeageCRM</span>
        </div>

        <div className="card p-8">
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl text-white mb-1">Welcome back</h1>
            <p className="text-white/40 text-sm">Sign in to your workspace</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              icon={<Mail size={14} />}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <div className="flex flex-col gap-1">
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pl-9 pr-9"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full justify-center mt-2" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-white/30 mt-6">
            No account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          © {new Date().getFullYear()} PoeageCRM. All rights reserved.
        </p>
      </div>
    </div>
  )
}
