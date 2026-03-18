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

  // Fetch all products
  const { data: products } = await supabase
    .from('agrochemicals')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all pest relationships
  const { data: pestLinks } = await supabase
    .from('product_pests')
    .select('product_id, pest_id')

  // Fetch all crop relationships
  const { data: cropLinks } = await supabase
    .from('product_crops')
    .select('product_id, crop_id')

  // Group by product
  const pestCountByProduct: Record<string, number> = {}
  pestLinks?.forEach(link => {
    pestCountByProduct[link.product_id] = (pestCountByProduct[link.product_id] || 0) + 1
  })

  const cropCountByProduct: Record<string, number> = {}
  cropLinks?.forEach(link => {
    cropCountByProduct[link.product_id] = (cropCountByProduct[link.product_id] || 0) + 1
  })

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
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/products/${prod.id}`}
                    className="hover:underline hover:text-blue-600 transition-colors"
                  >
                    {prod.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{prod.type}</span>
                </TableCell>
                <TableCell>{prod.active_ingredient || '-'}</TableCell>
                <TableCell>
                  {pestCountByProduct[prod.id] ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                      {pestCountByProduct[prod.id]} pest{pestCountByProduct[prod.id] !== 1 ? 's' : ''}
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {cropCountByProduct[prod.id] ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      {cropCountByProduct[prod.id]} crop{cropCountByProduct[prod.id] !== 1 ? 's' : ''}
                    </span>
                  ) : '-'}
                </TableCell>
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
