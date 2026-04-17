'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { deleteCake } from '@/server/actions/cakes'

type CakeRow = {
  id: number
  name: string
  servings: number
  totalCost: string
  finalPrice: string | null
  suggestedPrice: string
  createdAt: Date
  recipeName: string | null
}

export function CakesClient({ cakes }: { cakes: CakeRow[] }) {
  const [deleteTarget, setDeleteTarget] = useState<CakeRow | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteCake(deleteTarget.id)
      setDeleteTarget(null)
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Cake History</h2>
          <p className="text-sm text-muted-foreground mt-1">View past cake pricing calculations.</p>
        </div>
        <Link href="/cakes/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4 mr-2" />
          Price a cake
        </Link>
      </div>

      {cakes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No cakes priced yet.</p>
          <Link href="/cakes/new" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4')}>
            Price your first cake
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Recipe</TableHead>
                <TableHead>Servings</TableHead>
                <TableHead>Total cost</TableHead>
                <TableHead>Final price</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {cakes.map((cake) => (
                <TableRow key={cake.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/cakes/${cake.id}`} className="font-medium hover:underline">
                      {cake.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{cake.recipeName ?? '—'}</TableCell>
                  <TableCell>{cake.servings}</TableCell>
                  <TableCell>${parseFloat(cake.totalCost).toFixed(2)}</TableCell>
                  <TableCell className="font-medium">
                    ${parseFloat(cake.finalPrice ?? cake.suggestedPrice).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(cake.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(cake)} disabled={isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
              This will permanently delete this pricing record and its cost breakdown.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
