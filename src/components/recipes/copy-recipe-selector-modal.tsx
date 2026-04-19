'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

type RecipeOption = { id: number; name: string }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipes: RecipeOption[]
  onSelect: (id: number) => void
}

export function CopyRecipeSelectorModal({ open, onOpenChange, recipes, onSelect }: Props) {
  const [comboOpen, setComboOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selectedRecipe = recipes.find((r) => r.id === selectedId)

  function handleConfirm() {
    if (selectedId === null) return
    onSelect(selectedId)
    setSelectedId(null)
    onOpenChange(false)
  }

  function handleOpenChange(next: boolean) {
    if (!next) setSelectedId(null)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy from existing recipe</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5 py-2">
          <p className="text-sm font-medium">Choose a recipe to use as a base</p>
          <Popover open={comboOpen} onOpenChange={setComboOpen}>
            <PopoverTrigger
              role="combobox"
              aria-expanded={comboOpen}
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between font-normal')}
            >
              {selectedRecipe ? selectedRecipe.name : 'Search recipes…'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search recipes…" />
                <CommandList>
                  <CommandEmpty>No recipes found.</CommandEmpty>
                  <CommandGroup>
                    {recipes.map((r) => (
                      <CommandItem
                        key={r.id}
                        value={r.name}
                        onSelect={() => {
                          setSelectedId(r.id)
                          setComboOpen(false)
                        }}
                      >
                        <Check
                          className={cn('mr-2 h-4 w-4', selectedId === r.id ? 'opacity-100' : 'opacity-0')}
                        />
                        {r.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={selectedId === null}>
            Copy recipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
