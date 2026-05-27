import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Service } from '../types'
import PriceInput from './PriceInput'

export default function ServicesTable() {
  const [rows, setRows]       = useState<Service[]>([])
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState(false)

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .then(({ data }) => {
        if (data) setRows(data)
        setLoading(false)
      })
  }, [])

  const updatePrice = (id: string, price: number) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, price } : r))

  const updatePriceLabel = (id: string, price: number) => {
    const formatted = `+$${price.toLocaleString('es-AR')}`
    setRows(prev => prev.map(r => r.id === id ? { ...r, price, price_label: formatted } : r))
  }

  const saveAll = async () => {
    setSaving(true)
    setSaveError(false)
    let hasError = false

    for (const row of rows) {
      const { error } = await supabase
        .from('services')
        .update({ price: row.price, price_label: row.price_label })
        .eq('id', row.id)
      if (error) hasError = true
    }

    setSaving(false)
    if (hasError) {
      setSaveError(true)
      setTimeout(() => setSaveError(false), 3000)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  if (loading) {
    return <p className="text-gray-500 text-sm">Cargando servicios...</p>
  }

  return (
    <div>
      <h2 className="text-white font-bold text-lg mb-1">Servicios adicionales</h2>
      <p className="text-gray-500 text-sm mb-4">Precio fijo por servicio (ARS)</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-[#2a2a2a] text-left">
              <th className="pb-2 font-medium">Servicio</th>
              <th className="pb-2 font-medium">Precio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-[#1e1e1e]">
                <td className="py-3 text-white pr-4">{row.label}</td>
                <td className="py-3">
                  <PriceInput
                    value={row.price}
                    onChange={v => updatePriceLabel(row.id, v)}
                    disabled={saving}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={saveAll}
          disabled={saving}
          className="bg-[#E8521A] hover:bg-[#d44a16] text-white px-6 py-2 rounded font-bold text-sm
                     disabled:opacity-40 transition-colors tracking-wider"
        >
          {saving ? 'GUARDANDO...' : saved ? 'GUARDADO ✓' : 'GUARDAR CAMBIOS'}
        </button>
        {saveError && <span className="text-red-400 text-sm">Error al guardar. Intentá de nuevo.</span>}
      </div>
    </div>
  )
}
