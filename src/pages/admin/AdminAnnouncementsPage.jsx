import useAnnouncements from "@/hooks/useAnnouncements";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { RefreshCcw, Trash } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const {
    announcements,       
    meta,                 
    loading,
    filters,
    setFilters,
    refresh,
    removeAnnouncement,   
  } = useAnnouncements();

  console.log("ANNOUNCEMENTS IN PAGE:", announcements); 

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Announcements</h1>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input
          className="w-56"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value, page: 1 })
          }
        />

        <Select
          value={filters.status}
          onValueChange={(v) =>
            setFilters({ ...filters, status: v, page: 1 })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={refresh}>
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {announcements.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.id}</TableCell>
                <TableCell className="font-medium">{a.title}</TableCell>
                <TableCell>
                  <Badge>{a.status}</Badge>
                </TableCell>
                <TableCell>{a.priority}</TableCell>
                <TableCell>
                  {a.target_audience?.length
                    ? a.target_audience.join(", ")
                    : "All"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="icon"
                    aria-label="Delete announcement"
                    variant="destructive"
                    onClick={() => removeAnnouncement(a.id)}
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {!loading && announcements.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-muted-foreground"
                >
                  No announcements found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (optional) */}
      {meta && (
        <div className="text-sm text-muted-foreground">
          Showing {meta.from}–{meta.to} of {meta.total}
        </div>
      )}
    </div>
  );
}
