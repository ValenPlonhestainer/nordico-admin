import { useState, useEffect, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LoginGate({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    setSubmitting(true)
    setError(false)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (authError) {
      setError(true)
      setTimeout(() => setError(false), 2500)
    }
  }

  if (loading) return null

  if (authenticated) return <>{children}</>

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-lg w-full max-w-sm">
        <div className="mb-6">
          <p className="text-[#E8521A] text-xs font-bold tracking-widest mb-1">PANEL DE GESTIÓN</p>
          <h1 className="text-white text-2xl font-bold tracking-widest">NORDICO</h1>
        </div>
        <input
          type="email"
          className="w-full bg-[#0f0f0f] border border-[#333] text-white px-3 py-2.5 rounded mb-3 outline-none focus:border-[#E8521A] transition-colors"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          autoFocus
        />
        <input
          type="password"
          className="w-full bg-[#0f0f0f] border border-[#333] text-white px-3 py-2.5 rounded mb-3 outline-none focus:border-[#E8521A] transition-colors"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        {error && (
          <p className="text-red-400 text-sm mb-3">Email o contraseña incorrectos</p>
        )}
        <button
          className="w-full bg-[#E8521A] hover:bg-[#d44a16] text-white py-2.5 rounded font-bold tracking-wider transition-colors disabled:opacity-40"
          onClick={handleLogin}
          disabled={submitting}
        >
          {submitting ? 'INGRESANDO...' : 'INGRESAR'}
        </button>
      </div>
    </div>
  )
}
