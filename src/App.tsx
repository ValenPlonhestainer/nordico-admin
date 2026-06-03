import { useState } from 'react'
import LoginGate from './components/LoginGate'
import ProductsTable from './components/ProductsTable'
import BaldosasTable from './components/BaldosasTable'
import ServicesTable from './components/ServicesTable'
import { supabase } from './lib/supabaseClient'

type Section = 'home' | 'losetas' | 'baldosas'

export default function App() {
  const [section, setSection] = useState<Section>('home')

  return (
    <LoginGate>
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <header className="border-b border-[#1e1e1e] px-4 sm:px-8 py-5 flex justify-center">
          <div className="w-full max-w-3xl flex items-center justify-between">
            <button
              onClick={() => setSection('home')}
              className="text-left hover:opacity-80 transition-opacity"
            >
              <p className="text-[#E8521A] text-xs font-bold tracking-widest mb-0.5">PANEL DE GESTIÓN</p>
              <h1 className="text-xl font-bold tracking-widest">NORDICO</h1>
            </button>
            <div className="flex items-center gap-6">
              {section !== 'home' && (
                <button
                  onClick={() => setSection('home')}
                  className="text-gray-500 hover:text-white text-xs tracking-widest transition-colors"
                >
                  ← INICIO
                </button>
              )}
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-gray-500 hover:text-white text-xs tracking-widest transition-colors"
              >
                SALIR
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-8 py-8 sm:py-10 flex flex-col items-center">

          {/* Home */}
          {section === 'home' && (
            <div className="w-full max-w-3xl">
              <p className="text-gray-600 text-xs tracking-widest mb-8">SELECCIONÁ UNA SECCIÓN</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setSection('losetas')}
                  className="group bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#E8521A] rounded-lg p-8 text-left transition-all duration-200"
                >
                  <div className="text-[#E8521A] text-xs font-bold tracking-widest mb-3 opacity-70 group-hover:opacity-100 transition-opacity">
                    01
                  </div>
                  <div className="text-white font-bold text-lg tracking-wider mb-2">
                    LOSETAS ATÉRMICAS
                  </div>
                  <div className="text-gray-500 text-sm">
                    Precios, imágenes y orden de losetas. Materiales y accesorios.
                  </div>
                  <div className="mt-6 text-[#E8521A] text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    INGRESAR →
                  </div>
                </button>

                <button
                  onClick={() => setSection('baldosas')}
                  className="group bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#E8521A] rounded-lg p-8 text-left transition-all duration-200"
                >
                  <div className="text-[#E8521A] text-xs font-bold tracking-widest mb-3 opacity-70 group-hover:opacity-100 transition-opacity">
                    02
                  </div>
                  <div className="text-white font-bold text-lg tracking-wider mb-2">
                    BALDOSAS
                  </div>
                  <div className="text-gray-500 text-sm">
                    Precios, imágenes y orden de baldosas para exterior.
                  </div>
                  <div className="mt-6 text-[#E8521A] text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    INGRESAR →
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Losetas */}
          {section === 'losetas' && (
            <div className="w-full max-w-3xl space-y-6">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                <ProductsTable />
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                <ServicesTable />
              </div>
            </div>
          )}

          {/* Baldosas */}
          {section === 'baldosas' && (
            <div className="w-full max-w-3xl">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                <BaldosasTable />
              </div>
            </div>
          )}

        </main>
      </div>
    </LoginGate>
  )
}
