'use client'

import { useState } from 'react'
import type { RowData } from './recipe-ingredient-row'
import type { CopiedIngredient } from './copy-from-recipe-modal'

export type SectionData = { uid: string; name: string }

type SourceIngredient = {
  ingredientId: number
  quantity: string
  unit: string
  section: string
  sortOrder: number
}

function buildInitialState(source?: SourceIngredient[]): { sections: SectionData[]; rows: RowData[] } {
  if (!source || source.length === 0) {
    return { sections: [{ uid: crypto.randomUUID(), name: '' }], rows: [] }
  }

  const ordered = [...source].sort((a, b) => a.sortOrder - b.sortOrder)
  const uidByName = new Map<string, string>()
  const sections: SectionData[] = []

  for (const ing of ordered) {
    if (!uidByName.has(ing.section)) {
      const uid = crypto.randomUUID()
      uidByName.set(ing.section, uid)
      sections.push({ uid, name: ing.section })
    }
  }

  const rows: RowData[] = ordered.map((ing) => ({
    uid: crypto.randomUUID(),
    ingredientId: ing.ingredientId.toString(),
    quantity: parseFloat(ing.quantity).toString(),
    unit: ing.unit,
    sectionUid: uidByName.get(ing.section)!,
  }))

  return { sections, rows }
}

/**
 * Rows point at their section by uid rather than by name, so renaming a section is a single
 * write and two sections sharing a name stay distinct while editing.
 */
export function useRecipeSections(source?: SourceIngredient[]) {
  const [initial] = useState(() => buildInitialState(source))
  const [sections, setSections] = useState<SectionData[]>(initial.sections)
  const [rows, setRows] = useState<RowData[]>(initial.rows)

  function addSection() {
    setSections((prev) => [...prev, { uid: crypto.randomUUID(), name: '' }])
  }

  function addCopiedSection(name: string, ingredients: CopiedIngredient[]) {
    const sectionUid = crypto.randomUUID()
    setSections((prev) => [...prev, { uid: sectionUid, name }])
    setRows((prev) => [
      ...prev,
      ...ingredients.map((ing) => ({ uid: crypto.randomUUID(), ...ing, sectionUid })),
    ])
  }

  function updateSectionName(uid: string, name: string) {
    setSections((prev) => prev.map((s) => (s.uid === uid ? { ...s, name } : s)))
  }

  function removeSection(uid: string) {
    setSections((prev) => prev.filter((s) => s.uid !== uid))
    setRows((prev) => prev.filter((r) => r.sectionUid !== uid))
  }

  function addRow(sectionUid: string) {
    setRows((prev) => [
      ...prev,
      { uid: crypto.randomUUID(), ingredientId: '', quantity: '', unit: '', sectionUid },
    ])
  }

  function updateRow(uid: string, updated: RowData) {
    setRows((prev) => prev.map((r) => (r.uid === uid ? updated : r)))
  }

  function removeRow(uid: string) {
    setRows((prev) => prev.filter((r) => r.uid !== uid))
  }

  return {
    sections,
    rows,
    addSection,
    addCopiedSection,
    updateSectionName,
    removeSection,
    addRow,
    updateRow,
    removeRow,
  }
}

/** Flattens section-ordered rows into the shape the server action persists. */
export function toOrderedIngredients(sections: SectionData[], rows: RowData[]) {
  const ingredients: {
    ingredientId: number
    quantity: number
    unit: string
    section: string
    sortOrder: number
  }[] = []

  for (const section of sections) {
    for (const row of rows.filter((r) => r.sectionUid === section.uid)) {
      if (!row.ingredientId || !row.quantity || !row.unit) continue
      ingredients.push({
        ingredientId: parseInt(row.ingredientId),
        quantity: parseFloat(row.quantity),
        unit: row.unit,
        section: section.name.trim(),
        sortOrder: ingredients.length,
      })
    }
  }

  return ingredients
}
