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

  const { data: products, error } = await supabase
    .from('agrochemicals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-6 text-red-600">Error loading products: {error.message}</div>
  }

  const { data: pestLinks } = await supabase
    .from('product_pests')
    .select('product_id, pest_id')

  const { data: cropLinks } = await supabase
    .from('product_crops')
    .select('product_id, crop_id')

  const pestCountByProduct: Record<string, number> = {}
  pestLinks?.forEach(link => {
    pestCountByProduct[link.product_id] = (pestCountByProduct[link.product_id] || 0) + 1
  })

  const cropCountByProduct: Record<string, number> = {}
  cropLinks?.forEach(link => {
    cropCountByProduct[link.product_id] = (cropCountByProduct[link.product_id] || 0) + 1
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pesticides & Fertilizers</h1>
        <div className="space-x-2">
          <Link href="/admin/products/upload">
            <Button variant="outline">📤 Import CSV</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button>+ Add New Product</Button>
          </Link>
        </div>
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
                    className="hover:underline hover:text-blue-600"
                  >
                    {prod.name}
                  </Link>
                </TableCell>
                <TableCell className="capitalize">{prod.type}</TableCell>
                <TableCell>{prod.active_ingredient || '-'}</TableCell>
                <TableCell>
                  {pestCountByProduct[prod.id] ? (
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                      {pestCountByProduct[prod.id]} pest{pestCountByProduct[prod.id] !== 1 ? 's' : ''}
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {cropCountByProduct[prod.id] ? (
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
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
