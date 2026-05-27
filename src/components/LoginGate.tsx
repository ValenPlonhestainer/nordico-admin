import { useState, type ReactNode } from 'react'

const CORRECT = import.meta.env.VITE_ADMIN_PASSWORD ?? ''

export default function LoginGate({ children }: { children: ReactNode }) {
  const [input, setInput] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  const attempt = () => {
    if (input === CORRECT) {
      setUnlocked(true)
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-lg w-full max-w-sm">
        <div className="mb-6">
          <p className="text-[#E8521A] text-xs font-bold tracking-widest mb-1">PANEL DE GESTIÓN</p>
          <h1 className="text-white text-2xl font-bold tracking-widest">NORDICO</h1>
        </div>
        <input
          type="password"
          className="w-full bg-[#0f0f0f] border border-[#333] text-white px-3 py-2.5 rounded mb-3 outline-none focus:border-[#E8521A] transition-colors"
          placeholder="Contraseña"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          autoFocus
        />
        {error && (
          <p className="text-red-400 text-sm mb-3">Contraseña incorrecta</p>
        )}
        <button
          className="w-full bg-[#E8521A] hover:bg-[#d44a16] text-white py-2.5 rounded font-bold tracking-wider transition-colors"
          onClick={attempt}
        >
          INGRESAR
        </button>
      </div>
    </div>
  )
}
