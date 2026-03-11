import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (isLogin) {
        // Handle Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setSuccessMsg('Logged in successfully!')
        navigate('/dashboard') // Redirect on success
      } else {
        // Handle Signup
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}` 
            }
          }
        })
        if (error) throw error
        
        // If email confirmation isn't required by the Supabase project settings,
        // they might be immediately logged in.
        if (data.session) {
          navigate('/dashboard')
        } else {
          setSuccessMsg('Check your email for the confirmation link!')
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-100">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Wellness Nudge
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {isLogin ? 'Welcome back! Sign in to continue.' : 'Create an account to track your wellness.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium pl-2 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setErrorMsg('')
              setSuccessMsg('')
            }}
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
        
      </div>
    </div>
  )
}
