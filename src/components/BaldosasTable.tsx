import { useState, useEffect, useRef, Fragment } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Product } from '../types'
import PriceInput from './PriceInput'

function toKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24)
}

function ImageUploadSlot({
  label, file, existingUrl, onChange,
}: {
  label: string
  file: File | null
  existingUrl?: string
  onChange: (f: File | null) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const preview = file ? URL.createObjectURL(file) : existingUrl

  return (
    <div className="flex-1">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <div
        onClick={() => ref.current?.click()}
        className="relative border border-dashed border-[#333] hover:border-[#E8521A] rounded cursor-pointer transition-colors h-24 flex items-center justify-center bg-[#0f0f0f] overflow-hidden"
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="h-full w-full object-contain" />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null) }}
              className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-black"
            >
              ×
            </button>
          </>
        ) : (
          <span className="text-gray-600 text-xs text-center px-2">Hacé clic para subir</span>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  )
}

async function uploadImage(supabaseClient: typeof supabase, file: File, key: string, slot: 1 | 2): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop()
  const path = `baldosa-${key}-${slot}.${ext}`
  const { error } = await supabaseClient.storage
    .from('product-images')
    .upload(path, file, { upsert: true })
  if (error) return { url: null, error: error.message }
  return { url: supabaseClient.storage.from('product-images').getPublicUrl(path).data.publicUrl, error: null }
}

export default function BaldosasTable() {
  const [rows, setRows]     = useState<Product[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState(false)

  // Agregar baldosa
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName]   = useState('')
  const [newPrice, setNewPrice] = useState<number>(0)
  const [newImg1, setNewImg1]   = useState<File | null>(null)
  const [newImg2, setNewImg2]   = useState<File | null>(null)
  const [adding, setAdding]     = useState(false)
  const [addError, setAddError] = useState('')

  // Editar imágenes
  const [editingKey, setEditingKey]   = useState<string | null>(null)
  const [editImg1, setEditImg1]       = useState<File | null>(null)
  const [editImg2, setEditImg2]       = useState<File | null>(null)
  const [savingImgs, setSavingImgs]   = useState(false)
  const [editImgError, setEditImgError] = useState('')
  const [editImgSaved, setEditImgSaved] = useState(false)

  // Reordenar
  const [reordering, setReordering] = useState(false)

  // Eliminar
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    supabase
      .from('baldosas')
      .select('*')
      .order('order', { ascending: true })
      .then(({ data }) => {
        if (data) setRows(data)
        setLoading(false)
      })
  }, [])

  // ── Guardar precios ──────────────────────────────────────────────
  const updatePrice = (key: string, price_unit: number) =>
    setRows(prev => prev.map(r => r.key === key ? { ...r, price_unit } : r))

  const saveAll = async () => {
    setSaving(true); setSaveError(false)
    let hasError = false
    for (const row of rows) {
      const { error } = await supabase.from('baldosas').update({ price_unit: row.price_unit }).eq('key', row.key)
      if (error) hasError = true
    }
    setSaving(false)
    if (hasError) { setSaveError(true); setTimeout(() => setSaveError(false), 3000) }
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  }

  // ── Agregar baldosa ──────────────────────────────────────────────
  const addProduct = async () => {
    setAddError('')
    const name = newName.trim().toUpperCase()
    if (!name) return setAddError('El nombre es obligatorio.')
    if (newPrice <= 0) return setAddError('El precio debe ser mayor a 0.')
    const key = toKey(newName)
    if (rows.some(r => r.key === key)) return setAddError(`Ya existe una baldosa con key "${key}".`)
    const nextOrder = rows.length > 0 ? Math.max(...rows.map(r => r.order)) + 1 : 1

    setAdding(true)
    const imageUrls: string[] = []
    if (newImg1) { const { url: u1, error: e1 } = await uploadImage(supabase, newImg1, key, 1); if (!u1) { setAdding(false); return setAddError(`Error al subir imagen 1: ${e1}`) } imageUrls.push(u1) }
    if (newImg2) { const { url: u2, error: e2 } = await uploadImage(supabase, newImg2, key, 2); if (!u2) { setAdding(false); return setAddError(`Error al subir imagen 2: ${e2}`) } imageUrls.push(u2) }

    const { data, error } = await supabase.from('baldosas')
      .insert({ key, name, price_unit: newPrice, order: nextOrder, tag: null, images: imageUrls })
      .select().single()

    setAdding(false)
    if (error || !data) return setAddError(error?.message ?? 'No se pudo agregar la baldosa.')
    setRows(prev => [...prev, data])
    setNewName(''); setNewPrice(0); setNewImg1(null); setNewImg2(null); setShowAddForm(false)
  }

  const resetAddForm = () => {
    setShowAddForm(false); setNewName(''); setNewPrice(0)
    setNewImg1(null); setNewImg2(null); setAddError('')
  }

  // ── Guardar imágenes de baldosa existente ────────────────────────
  const openEditImages = (key: string) => {
    setEditingKey(key); setEditImg1(null); setEditImg2(null)
    setEditImgError(''); setEditImgSaved(false)
  }

  const saveImages = async (row: Product) => {
    setSavingImgs(true); setEditImgError('')
    const currentUrls = row.images ?? []

    let url1 = currentUrls[0] ?? null
    let url2 = currentUrls[1] ?? null

    if (editImg1) { const { url: u1, error: e1 } = await uploadImage(supabase, editImg1, row.key, 1); if (!u1) { setSavingImgs(false); return setEditImgError(`Error al subir imagen 1: ${e1}`) } url1 = u1 }
    if (editImg2) { const { url: u2, error: e2 } = await uploadImage(supabase, editImg2, row.key, 2); if (!u2) { setSavingImgs(false); return setEditImgError(`Error al subir imagen 2: ${e2}`) } url2 = u2 }

    const newImages = [url1, url2].filter(Boolean) as string[]
    const { error } = await supabase.from('baldosas').update({ images: newImages }).eq('key', row.key)
    setSavingImgs(false)
    if (error) return setEditImgError(error.message)

    setRows(prev => prev.map(r => r.key === row.key ? { ...r, images: newImages } : r))
    setEditImgSaved(true)
    setTimeout(() => { setEditingKey(null); setEditImgSaved(false) }, 1500)
  }

  // ── Reordenar baldosas ───────────────────────────────────────────
  const moveRow = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= rows.length) return

    setReordering(true)
    const a = rows[index]
    const b = rows[swapIndex]
    const orderA = a.order
    const orderB = b.order

    await Promise.all([
      supabase.from('baldosas').update({ order: orderB }).eq('key', a.key),
      supabase.from('baldosas').update({ order: orderA }).eq('key', b.key),
    ])

    setRows(prev => {
      const next = [...prev]
      next[index]    = { ...a, order: orderB }
      next[swapIndex] = { ...b, order: orderA }
      return next.sort((x, y) => x.order - y.order)
    })
    setReordering(false)
  }

  // ── Eliminar baldosa ─────────────────────────────────────────────
  const deleteProduct = async (key: string) => {
    setDeleting(true)
    const { error } = await supabase.from('baldosas').delete().eq('key', key)
    setDeleting(false)
    if (error) { alert('Error al eliminar: ' + error.message); return }
    setRows(prev => prev.filter(r => r.key !== key))
    setConfirmDeleteKey(null)
  }

  if (loading) return <p className="text-gray-500 text-sm">Cargando baldosas...</p>

  return (
    <div>
      <h2 className="text-white font-bold text-lg mb-1">Baldosas</h2>
      <p className="text-gray-500 text-sm mb-4">Precio por unidad de cada baldosa (ARS)</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-[#2a2a2a] text-left">
              <th className="pb-2 font-medium">Producto</th>
              <th className="pb-2 font-medium">Precio c/u</th>
              <th className="pb-2 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <Fragment key={row.key}>
                <tr className="border-b border-[#1e1e1e]">
                  <td className="py-3 text-white pr-4">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveRow(index, 'up')}
                          disabled={reordering || index === 0}
                          className="text-gray-600 hover:text-white disabled:opacity-20 disabled:cursor-default leading-none transition-colors text-xs"
                          title="Subir"
                        >▲</button>
                        <button
                          onClick={() => moveRow(index, 'down')}
                          disabled={reordering || index === rows.length - 1}
                          className="text-gray-600 hover:text-white disabled:opacity-20 disabled:cursor-default leading-none transition-colors text-xs"
                          title="Bajar"
                        >▼</button>
                      </div>
                      {row.name}
                    </div>
                  </td>
                  <td className="py-3">
                    <PriceInput value={row.price_unit} onChange={v => updatePrice(row.key, v)} disabled={saving} />
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => editingKey === row.key ? setEditingKey(null) : openEditImages(row.key)}
                      className={`text-xs mr-3 transition-colors ${editingKey === row.key ? 'text-[#E8521A]' : 'text-gray-500 hover:text-white'}`}
                    >
                      Imágenes
                    </button>
                    {confirmDeleteKey === row.key ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-gray-400 text-xs">¿Eliminar?</span>
                        <button
                          onClick={() => deleteProduct(row.key)}
                          disabled={deleting}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setConfirmDeleteKey(null)}
                          className="text-xs text-gray-500 hover:text-white transition-colors"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteKey(row.key)}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>

                {/* Panel de edición de imágenes */}
                {editingKey === row.key && (
                  <tr className="border-b border-[#1e1e1e] bg-[#141414]">
                    <td colSpan={3} className="py-4 px-2">
                      <div className="space-y-3">
                        <p className="text-gray-400 text-xs font-medium">Imágenes de {row.name}</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <ImageUploadSlot
                            label="Imagen 1 (Frente)"
                            file={editImg1}
                            existingUrl={row.images?.[0]}
                            onChange={f => { setEditImg1(f); setEditImgError('') }}
                          />
                          <ImageUploadSlot
                            label="Imagen 2 (Perfil)"
                            file={editImg2}
                            existingUrl={row.images?.[1]}
                            onChange={f => { setEditImg2(f); setEditImgError('') }}
                          />
                        </div>
                        {editImgError && <p className="text-red-400 text-xs">{editImgError}</p>}
                        <div className="flex gap-3 items-center">
                          <button
                            onClick={() => saveImages(row)}
                            disabled={savingImgs || (!editImg1 && !editImg2)}
                            className="bg-[#E8521A] hover:bg-[#d44a16] text-white px-4 py-1.5 rounded font-bold text-xs
                                       disabled:opacity-40 transition-colors tracking-wider"
                          >
                            {savingImgs ? 'GUARDANDO...' : editImgSaved ? 'GUARDADO ✓' : 'GUARDAR IMÁGENES'}
                          </button>
                          <button
                            onClick={() => setEditingKey(null)}
                            className="text-gray-500 hover:text-white text-xs transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Agregar baldosa */}
      <div className="mt-6 border-t border-[#2a2a2a] pt-5">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-[#E8521A] hover:text-[#d44a16] text-sm font-bold tracking-wider transition-colors"
          >
            + AGREGAR BALDOSA
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm font-medium">Nueva baldosa</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Nombre (ej: BALDOSA EXTERIOR 40X40)"
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
            <div className="flex flex-col sm:flex-row gap-3">
              <ImageUploadSlot label="Imagen 1 (Frente)" file={newImg1} onChange={setNewImg1} />
              <ImageUploadSlot label="Imagen 2 (Perfil)" file={newImg2} onChange={setNewImg2} />
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
              <button onClick={resetAddForm} className="text-gray-500 hover:text-white text-sm transition-colors px-2">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-[#2a2a2a] pt-5 flex items-center gap-3">
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
