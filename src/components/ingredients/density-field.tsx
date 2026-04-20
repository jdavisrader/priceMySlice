'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function DensityField({ value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="gPerMl">Weight-volume conversion (g/ml)</Label>
      <Input
        id="gPerMl"
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 0.529"
      />
      <p className="text-xs text-muted-foreground">
        How many grams per ml. Used when recipe and purchase units are in different
        dimensions (e.g., cups vs. grams). Leave blank to use the built-in library value.
      </p>
    </div>
  )
}
