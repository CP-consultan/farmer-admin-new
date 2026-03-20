'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteButton } from './delete-button'
import { Search } from 'lucide-react'

interface Product {
  id: string
  name: string
  type: string
  active_ingredient: string | null
  manufacturer: string | null
}

interface ProductsContentProps {
  products: Product[]
  pestCountByProduct: Record<string, number>
  cropCountByProduct: Record<string, number>
}

export default function ProductsContent({ products, pestCountByProduct, cropCountByProduct }: ProductsContentProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products
    const lower = searchTerm.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.type.toLowerCase().includes(lower) ||
      (p.active_ingredient && p.active_ingredient.toLowerCase().includes(lower)) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(lower))
    )
  }, [products, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pesticides & Fertilizers</h1>
          <p className="text-muted-foreground mt-1">Manage agricultural products and their details</p>
        </div>
        <div className="space-x-2">
          <Link href="/admin/products/upload">
            <Button variant="outline">📤 Import CSV</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button>+ Add New Product</Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
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
            {filteredProducts.length > 0 ? (
              filteredProducts.map((prod, idx) => (
                <TableRow key={prod.id}>
                  <TableCell className="text-center">{idx + 1}</TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/products/${prod.id}`}
                      className="hover:underline hover:text-blue-600 transition-colors"
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
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
