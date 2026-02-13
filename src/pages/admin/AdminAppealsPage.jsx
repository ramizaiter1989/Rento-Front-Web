import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
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
import { RefreshCcw } from "lucide-react";

import useAppeals from "@/hooks/useAppeals";

export default function AdminAppealsPage() {
  const {
    appeals,
    meta,
    loading,
    filters,
    setFilters,
    refresh, // ✅ USE THIS
    updateStatus,
  } = useAppeals();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Appeals</h1>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input
          className="w-56"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) =>
            setFilters({
              ...filters,
              search: e.target.value,
              page: 1,
            })
          }
        />

        <Select
          value={filters.status || "all"}
          onValueChange={(v) =>
            setFilters({
              ...filters,
              status: v === "all" ? "" : v,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
              <TableHead>User</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {appeals.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.id}</TableCell>
                <TableCell>
                  {a.user?.username ?? "—"}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {a.message}
                </TableCell>
                <TableCell>
                  <Badge>{a.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() =>
                      updateStatus(a.id, {
                        status: "resolved",
                      })
                    }
                  >
                    Resolve
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {!loading && appeals.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  No appeals found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination info */}
      {meta && (
        <div className="text-sm text-muted-foreground">
          Showing {meta.from}–{meta.to} of {meta.total}
        </div>
      )}
    </div>
  );
}
