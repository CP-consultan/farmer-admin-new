import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteButton } from './delete-button'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('agrochemicals')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pesticides & Fertilizers</h1>
          <p className="text-muted-foreground mt-1">Manage agricultural products and their details</p>
        </div>
        <Link href="/admin/products/new">
          <Button>+ Add New Product</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Active Ingredient</TableHead>
              <TableHead>Target Pests</TableHead>
              <TableHead>Applicable Crops</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell className="font-medium">{prod.name}</TableCell>
                <TableCell>
                  <span className="capitalize">{prod.type}</span>
                </TableCell>
                <TableCell>{prod.active_ingredient || '-'}</TableCell>
                <TableCell>{prod.target_pests || '-'}</TableCell>
                <TableCell>{prod.applicable_crops || '-'}</TableCell>
                <TableCell>{prod.manufacturer || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/products/${prod.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <DeleteButton id={prod.id} />
                </TableCell>
              </TableRow>
            ))}
            {(!products || products.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
