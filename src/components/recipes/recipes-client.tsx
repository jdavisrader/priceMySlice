'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { InferSelectModel } from 'drizzle-orm'
import type { recipes } from '@/db/schema'
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { deleteRecipe } from '@/server/actions/recipes'
import { CopyRecipeSelectorModal } from './copy-recipe-selector-modal'

type Recipe = InferSelectModel<typeof recipes>

type Props = {
  recipes: Recipe[]
  ingredientCounts: Record<number, number>
}

export function RecipesClient({ recipes, ingredientCounts }: Props) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null)
  const [isPending, startTransition] = useTransition()
  const [copyModalOpen, setCopyModalOpen] = useState(false)

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteRecipe(deleteTarget.id)
      setDeleteTarget(null)
    })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Recipes</h2>
          <p className="text-sm text-muted-foreground mt-1">Store and manage your cake recipes.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants())}>
            <Plus className="h-4 w-4 mr-2" />
            New recipe
            <ChevronDown className="h-3.5 w-3.5 ml-1 text-white/70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push('/recipes/new')}>
              From scratch
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setCopyModalOpen(true)}
              disabled={recipes.length === 0}
            >
              Copy existing recipe
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CopyRecipeSelectorModal
          open={copyModalOpen}
          onOpenChange={setCopyModalOpen}
          recipes={recipes.map((r) => ({ id: r.id, name: r.name }))}
          onSelect={(id) => router.push(`/recipes/new?copyFrom=${id}`)}
        />
      </div>

      {recipes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No recipes yet.</p>
          <Link
            href="/recipes/new"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4')}
          >
            Create your first recipe
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Servings</TableHead>
                <TableHead>Ingredients</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <Link href={`/recipes/${recipe.id}`} className="font-medium hover:underline">
                      {recipe.name}
                    </Link>
                    {recipe.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {recipe.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{recipe.servings}</TableCell>
                  <TableCell>{ingredientCounts[recipe.id] ?? 0}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {new Date(recipe.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Link
                        href={`/recipes/${recipe.id}/edit`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(recipe)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this recipe and all its ingredient associations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
