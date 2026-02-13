import useNotifications from "@/hooks/useNotifications";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Trash,
  Edit,
  Send,
} from "lucide-react";

export default function AdminNotificationsPage() {
  const {
    notifications,
    meta,
    loading,
    filters,
    setFilters,
    refresh,
    deleteNotification,
    sendToAll,
  } = useNotifications();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Notifications</h1>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button onClick={sendToAll}>
            <Send className="w-4 h-4 mr-2" />
            Send to All
          </Button>
        </div>

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
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Read</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {notifications.map((n) => (
              <TableRow key={n.id}>
                <TableCell>{n.id}</TableCell>
                <TableCell className="font-medium">
                  {n.title || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {n.type || "general"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={n.is_read ? "success" : "secondary"}>
                    {n.is_read ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={n.sent ? "success" : "secondary"}>
                    {n.sent ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(n.created_at).toLocaleString()}
                </TableCell>

                {/* ACTIONS */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" aria-label="Edit" variant="ghost">
                      <Edit className="w-3 h-3" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete"
                      onClick={() => deleteNotification(n.id)}
                    >
                      <Trash className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!loading && notifications.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No notifications found
                </TableCell>
              </TableRow>
            )}

            {loading && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {meta && (
        <div className="text-sm text-muted-foreground">
          Showing {meta.from}–{meta.to} of {meta.total}
        </div>
      )}
    </div>
  );
}
