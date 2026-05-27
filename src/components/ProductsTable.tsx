import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Product } from '../types'
import PriceInput from './PriceInput'

export default function ProductsTable() {
  const [rows, setRows]       = useState<Product[]>([])
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState(false)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('order', { ascending: true })
      .then(({ data }) => {
        if (data) setRows(data)
        setLoading(false)
      })
  }, [])

  const updatePrice = (key: string, price_unit: number) =>
    setRows(prev => prev.map(r => r.key === key ? { ...r, price_unit } : r))

  const saveAll = async () => {
    setSaving(true)
    setSaveError(false)
    let hasError = false

    for (const row of rows) {
      const { error } = await supabase
        .from('products')
        .update({ price_unit: row.price_unit })
        .eq('key', row.key)
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
    return <p className="text-gray-500 text-sm">Cargando productos...</p>
  }

  return (
    <div>
      <h2 className="text-white font-bold text-lg mb-1">Productos</h2>
      <p className="text-gray-500 text-sm mb-4">Precio por unidad de cada loseta (ARS)</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-[#2a2a2a] text-left">
              <th className="pb-2 font-medium">Producto</th>
              <th className="pb-2 font-medium">Tag</th>
              <th className="pb-2 font-medium">Precio c/u</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.key} className="border-b border-[#1e1e1e]">
                <td className="py-3 text-white pr-4">{row.name}</td>
                <td className="py-3 pr-4">
                  {row.tag
                    ? <span className="text-[#E8521A] text-xs font-bold border border-[#E8521A] px-2 py-0.5 rounded">{row.tag}</span>
                    : <span className="text-gray-600">—</span>
                  }
                </td>
                <td className="py-3">
                  <PriceInput
                    value={row.price_unit}
                    onChange={v => updatePrice(row.key, v)}
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
