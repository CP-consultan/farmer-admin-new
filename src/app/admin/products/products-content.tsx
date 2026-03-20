'use client'

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
import { useLanguage } from '@/contexts/language-context'
import { useEffect } from 'react'

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
  const { t } = useLanguage()

  useEffect(() => {
    console.log('ProductsContent mounted')
    console.log('products count:', products?.length)
    console.log('pestCountByProduct:', pestCountByProduct)
    console.log('cropCountByProduct:', cropCountByProduct)
  }, [products, pestCountByProduct, cropCountByProduct])

  const getPestCountText = (count: number) => {
    if (count === 1) return t('products.pest_count_singular').replace('{count}', count.toString())
    return t('products.pest_count_plural').replace('{count}', count.toString())
  }

  const getCropCountText = (count: number) => {
    if (count === 1) return t('products.crop_count_singular').replace('{count}', count.toString())
    return t('products.crop_count_plural').replace('{count}', count.toString())
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('products.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('products.description')}</p>
        </div>
        <div className="space-x-2">
          <Link href="/admin/products/upload">
            <Button variant="outline">📤 Import CSV</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button>{t('products.add_new')}</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('products.table.name')}</TableHead>
              <TableHead>{t('products.table.type')}</TableHead>
              <TableHead>{t('products.table.active_ingredient')}</TableHead>
              <TableHead>{t('products.table.target_pests')}</TableHead>
              <TableHead>{t('products.table.applicable_crops')}</TableHead>
              <TableHead>{t('products.table.manufacturer')}</TableHead>
              <TableHead className="text-right">{t('products.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((prod) => (
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
                        {getPestCountText(pestCountByProduct[prod.id])}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {cropCountByProduct[prod.id] ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                        {getCropCountText(cropCountByProduct[prod.id])}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{prod.manufacturer || '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/products/${prod.id}/edit`}>
                      <Button variant="outline" size="sm">{t('products.edit')}</Button>
                    </Link>
                    <DeleteButton id={prod.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  {t('products.no_products')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
