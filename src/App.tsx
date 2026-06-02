import LoginGate from './components/LoginGate'
import ProductsTable from './components/ProductsTable'
import BaldosasTable from './components/BaldosasTable'
import ServicesTable from './components/ServicesTable'
import { supabase } from './lib/supabaseClient'

export default function App() {
  return (
    <LoginGate>
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <header className="border-b border-[#1e1e1e] px-8 py-5 flex justify-center">
          <div className="w-full max-w-3xl flex items-center justify-between">
            <div>
              <p className="text-[#E8521A] text-xs font-bold tracking-widest mb-0.5">PANEL DE GESTIÓN</p>
              <h1 className="text-xl font-bold tracking-widest">NORDICO</h1>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-gray-500 hover:text-white text-xs tracking-widest transition-colors"
            >
              SALIR
            </button>
          </div>
        </header>

        <main className="px-8 py-10 flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <ProductsTable />
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <BaldosasTable />
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <ServicesTable />
            </div>
          </div>
        </main>
      </div>
    </LoginGate>
  )
}
