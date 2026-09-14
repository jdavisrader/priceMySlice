export type SectionForValidation = { uid: string; name: string }
export type RowForValidation = { sectionUid: string; ingredientId: string; quantity: string; unit: string }

export function isCompleteRow(row: RowForValidation): boolean {
  return Boolean(row.ingredientId && row.quantity && row.unit)
}

/**
 * A section exists only as a name denormalized onto its ingredient rows, so a section with no
 * ingredients cannot be persisted and two sections sharing a name merge when the recipe reloads.
 * Both are blocked here rather than silently discarding the user's work on save.
 */
export function validateSections(
  sections: SectionForValidation[],
  rows: RowForValidation[]
): string | null {
  if (sections.length === 0) return 'Add at least one section before saving.'

  if (sections.some((s) => !s.name.trim())) return 'Every section needs a name.'

  const seen = new Set<string>()
  for (const section of sections) {
    const key = section.name.trim().toLowerCase()
    if (seen.has(key)) return `Two sections are both named "${section.name.trim()}". Section names must be unique.`
    seen.add(key)
  }

  const empty = sections.find((s) => !rows.some((r) => r.sectionUid === s.uid && isCompleteRow(r)))
  if (empty) return `"${empty.name.trim()}" has no complete ingredients. Add one or remove the section.`

  return null
}
