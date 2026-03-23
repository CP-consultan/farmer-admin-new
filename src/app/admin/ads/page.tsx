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

export default async function AdsPage() {
  const supabase = await createClient()
  const { data: ads } = await supabase
    .from('ads')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ads</h1>
        <Link href="/admin/ads/new">
          <Button>+ Add New Ad</Button>
        </Link>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Image/Video</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads?.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">{ad.title}</TableCell>
                <TableCell>
                  {ad.image_url ? '📷' : ad.video_url ? '🎥' : ad.file_url ? '📄' : '—'}
                </TableCell>
                <TableCell>{new Date(ad.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/ads/${ad.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <DeleteButton id={ad.id} />
                </TableCell>
              </TableRow>
            ))}
            {(!ads || ads.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No ads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
