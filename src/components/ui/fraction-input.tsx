'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { parseFraction, toFractionString, isVolumeFractionUnit } from '@/lib/fractions'
import { cn } from '@/lib/utils'

interface FractionInputProps {
  value: number | string
  unit: string
  onChange: (value: number) => void
  className?: string
  placeholder?: string
}

function getDisplayValue(num: number, fractionMode: boolean): string {
  if (isNaN(num) || num === 0) return ''
  if (fractionMode) {
    return toFractionString(num) ?? (num % 1 === 0 ? `${num}` : `${parseFloat(num.toFixed(2))}`)
  }
  return num % 1 === 0 ? `${num}` : `${parseFloat(num.toFixed(2))}`
}

export function FractionInput({ value, unit, onChange, className, placeholder = 'Qty' }: FractionInputProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  const isFractionMode = isVolumeFractionUnit(unit)

  const [displayValue, setDisplayValue] = useState(() =>
    getDisplayValue(numericValue, isFractionMode)
  )
  const lastValidRef = useRef(numericValue)

  // Sync display when value or unit changes externally (e.g. unit switch, parent reset)
  useEffect(() => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    lastValidRef.current = num
    setDisplayValue(getDisplayValue(num, isVolumeFractionUnit(unit)))
  }, [value, unit])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplayValue(e.target.value)
  }

  function handleBlur() {
    const parsed = isFractionMode
      ? parseFraction(displayValue)
      : parseFloat(displayValue)

    if (parsed !== null && !isNaN(parsed) && parsed >= 0) {
      lastValidRef.current = parsed
      onChange(parsed)
      setDisplayValue(getDisplayValue(parsed, isFractionMode))
    } else {
      // Revert to last valid value
      setDisplayValue(getDisplayValue(lastValidRef.current, isFractionMode))
    }
  }

  return (
    <Input
      type="text"
      inputMode={isFractionMode ? 'text' : 'decimal'}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={cn(className)}
    />
  )
}
