import useSuggestions from "@/hooks/useSuggestions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminSuggestionsPage() {
  const {
    suggestions,
    meta,
    loading,
    filters,
    setFilters,
    refresh,
  } = useSuggestions();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Suggestions</h1>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={refresh}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>

        {meta && (
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              aria-label="Previous Page"
              disabled={meta.current_page === 1}
              onClick={() =>
                setFilters({ ...filters, page: meta.current_page - 1 })
              }
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-sm">
              Page {meta.current_page} of {meta.last_page}
            </span>

            <Button
              size="icon"
              variant="outline"
              aria-label="Next Page"
              disabled={meta.current_page === meta.last_page}
              onClick={() =>
                setFilters({ ...filters, page: meta.current_page + 1 })
              }
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {suggestions.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>
                  {s.user?.username || "—"}
                </TableCell>
                <TableCell className="max-w-[400px] truncate">
                  {s.message || s.suggestion || "—"}
                </TableCell>
                <TableCell>
                  {new Date(s.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}

            {!loading && suggestions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  No suggestions found
                </TableCell>
              </TableRow>
            )}

            {loading && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Meta */}
      {meta && (
        <div className="text-sm text-muted-foreground">
          Showing {meta.from}–{meta.to} of {meta.total}
        </div>
      )}
    </div>
  );
}
