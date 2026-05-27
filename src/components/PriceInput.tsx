import { useState, useEffect } from 'react'

interface PriceInputProps {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}

export default function PriceInput({ value, onChange, disabled }: PriceInputProps) {
  const [text, setText] = useState(String(value))

  useEffect(() => {
    setText(String(value))
  }, [value])

  const handleChange = (raw: string) => {
    const clean = raw.replace(/\D/g, '')
    setText(clean)
    if (clean !== '') onChange(Number(clean))
  }

  const handleBlur = () => {
    if (text === '' || text === '0') {
      setText(String(value))
    }
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-500 text-sm">$</span>
      <input
        type="text"
        inputMode="numeric"
        value={text}
        disabled={disabled}
        onChange={e => handleChange(e.target.value)}
        onBlur={handleBlur}
        className="w-32 bg-[#0f0f0f] border border-[#333] text-white px-2 py-1.5 rounded text-sm
                   disabled:opacity-40 focus:border-[#E8521A] focus:outline-none transition-colors"
      />
    </div>
  )
}
