import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Product } from '../types'
import PriceInput from './PriceInput'

function toKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24)
}

export default function ProductsTable() {
  const [rows, setRows]       = useState<Product[]>([])
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState(false)

  const [showForm, setShowForm]     = useState(false)
  const [newName, setNewName]       = useState('')
  const [newPrice, setNewPrice]     = useState<number>(0)
  const [adding, setAdding]         = useState(false)
  const [addError, setAddError]     = useState('')

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

  const addProduct = async () => {
    setAddError('')
    const name = newName.trim().toUpperCase()
    if (!name) return setAddError('El nombre es obligatorio.')
    if (newPrice <= 0) return setAddError('El precio debe ser mayor a 0.')

    const key = toKey(newName)
    if (rows.some(r => r.key === key)) return setAddError(`Ya existe un producto con key "${key}". Cambiá el nombre.`)

    const nextOrder = rows.length > 0 ? Math.max(...rows.map(r => r.order)) + 1 : 1

    setAdding(true)
    const { data, error } = await supabase
      .from('products')
      .insert({ key, name, price_unit: newPrice, order: nextOrder, tag: null })
      .select()
      .single()

    setAdding(false)
    if (error || !data) {
      setAddError('No se pudo agregar el producto. Intentá de nuevo.')
      return
    }

    setRows(prev => [...prev, data])
    setNewName('')
    setNewPrice(0)
    setShowForm(false)
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
              <th className="pb-2 font-medium">Precio c/u</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.key} className="border-b border-[#1e1e1e]">
                <td className="py-3 text-white pr-4">{row.name}</td>
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

      {/* Agregar producto */}
      <div className="mt-6 border-t border-[#2a2a2a] pt-5">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="text-[#E8521A] hover:text-[#d44a16] text-sm font-bold tracking-wider transition-colors"
          >
            + AGREGAR PRODUCTO
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm font-medium">Nuevo producto</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Nombre (ej: BORDE BALLENA L 50X50)"
                value={newName}
                onChange={e => { setNewName(e.target.value); setAddError('') }}
                className="flex-1 bg-[#0f0f0f] border border-[#333] focus:border-[#E8521A] text-white text-sm px-3 py-2 rounded outline-none transition-colors placeholder-gray-600"
              />
              <div className="flex items-center gap-2 bg-[#0f0f0f] border border-[#333] focus-within:border-[#E8521A] rounded px-3 py-2 transition-colors w-full sm:w-44">
                <span className="text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  placeholder="Precio"
                  value={newPrice || ''}
                  onChange={e => { setNewPrice(Number(e.target.value)); setAddError('') }}
                  className="bg-transparent text-white text-sm outline-none w-full placeholder-gray-600"
                />
              </div>
            </div>
            {newName && (
              <p className="text-gray-600 text-xs">Key generada: <span className="text-gray-400">{toKey(newName)}</span></p>
            )}
            {addError && <p className="text-red-400 text-sm">{addError}</p>}
            <div className="flex gap-3">
              <button
                onClick={addProduct}
                disabled={adding}
                className="bg-[#E8521A] hover:bg-[#d44a16] text-white px-5 py-2 rounded font-bold text-sm
                           disabled:opacity-40 transition-colors tracking-wider"
              >
                {adding ? 'AGREGANDO...' : 'AGREGAR'}
              </button>
              <button
                onClick={() => { setShowForm(false); setNewName(''); setNewPrice(0); setAddError('') }}
                className="text-gray-500 hover:text-white text-sm transition-colors px-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
