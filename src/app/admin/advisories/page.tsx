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

export default async function AdvisoriesPage() {
  const supabase = await createClient()
  const { data: advisories } = await supabase
    .from('advisories')
    .select(`
      *,
      pest:pests (
        scientific_name,
        common_name_en
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advisories Management</h1>
          <p className="text-muted-foreground mt-1">Manage pest advisories</p>
        </div>
        <Link href="/admin/advisories/new">
          <Button>+ Add New Advisory</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pest</TableHead>
              <TableHead>Chemical Control</TableHead>
              <TableHead>Cultural Control</TableHead>
              <TableHead>Biological Control</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advisories?.map((adv) => (
              <TableRow key={adv.id}>
                <TableCell>
                  {adv.pest?.scientific_name} 
                  {adv.pest?.common_name_en && ` (${adv.pest.common_name_en})`}
                </TableCell>
                <TableCell>{adv.chemical_control || '-'}</TableCell>
                <TableCell>{adv.cultural_control || '-'}</TableCell>
                <TableCell>{adv.biological_control || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/advisories/${adv.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <DeleteButton id={adv.id} />
                </TableCell>
              </TableRow>
            ))}
            {(!advisories || advisories.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No advisories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
