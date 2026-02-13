import useOtps from "@/hooks/useOtps";

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

import { RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminOtpsPage() {
  const {
    otps,
    meta,
    loading,
    filters,
    setFilters,
    refresh,
  } = useOtps();

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">OTPs</h1>

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
              <TableHead>Phone Number</TableHead>
              <TableHead>OTP Code</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {otps.map((otp) => {
              const expired = isExpired(otp.expires_at);

              return (
                <TableRow key={otp.id}>
                  <TableCell>{otp.id}</TableCell>
                  <TableCell>{otp.phone_number}</TableCell>
                  <TableCell className="font-mono">
                    {otp.code}
                  </TableCell>
                  <TableCell>
                    {new Date(otp.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(otp.expires_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={expired ? "destructive" : "default"}
                    >
                      {expired ? "Expired" : "Active"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}

            {!loading && otps.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-muted-foreground"
                >
                  No OTPs found
                </TableCell>
              </TableRow>
            )}

            {loading && (
              <TableRow>
                <TableCell
                  colSpan={6}
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
