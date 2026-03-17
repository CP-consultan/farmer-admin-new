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

export default async function CropsPage() {
  const supabase = await createClient()
  const { data: crops } = await supabase
    .from('crops')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Crops Management</h1>
          <p className="text-muted-foreground mt-1">Global list of crops for dropdowns</p>
        </div>
        <Link href="/admin/crops/new">
          <Button>+ Add New Crop</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Common Name (En)</TableHead>
              <TableHead>Common Name (Ur)</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {crops?.map((crop) => (
              <TableRow key={crop.id}>
                <TableCell className="font-medium">{crop.name}</TableCell>
                <TableCell>{crop.common_name_en || '-'}</TableCell>
                <TableCell>{crop.common_name_ur || '-'}</TableCell>
                <TableCell>{crop.category || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/crops/${crop.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <DeleteButton id={crop.id} />
                </TableCell>
              </TableRow>
            ))}
            {(!crops || crops.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No crops found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
