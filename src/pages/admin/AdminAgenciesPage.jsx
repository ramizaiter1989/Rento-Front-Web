/**
 * Admin Agencies Page (Super Admin Only)
 *
 * Lists car rental agencies with filters and pagination.
 * View single agency details in a modal.
 * API: GET /api/admin/agencies, GET /api/admin/agencies/{id}
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  getAgencies,
  getAgency,
} from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Search,
  Eye,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
  Car,
  MapPin,
  Anchor,
} from "lucide-react";
import { toast } from "sonner";

const ASSET_BASE = "https://rento-lb.com/api/storage/";
const DEFAULT_AVATAR = "/avatar.png";

const GOVERNORATES = [
  "Beirut",
  "Mount Lebanon",
  "North",
  "South",
  "Bekaa",
  "Baalbek",
  "Keserwan",
  "Nabatieh",
  "Akkar",
];

const BUSINESS_TYPES = [
  { value: "", label: "All types" },
  { value: "rental", label: "Rental" },
  { value: "private", label: "Private" },
  { value: "company", label: "Company" },
  { value: "marina", label: "Marina" },
];

const SORT_BY_OPTIONS = [
  { value: "created_at", label: "Created at" },
  { value: "username", label: "Username" },
  { value: "first_name", label: "First name" },
  { value: "last_name", label: "Last name" },
];

function profileImgUrl(agency) {
  const p = agency?.profile_picture;
  if (!p) return DEFAULT_AVATAR;
  if (p.startsWith("http")) return p;
  const cleaned = p.startsWith("/") ? p.slice(1) : p;
  return ASSET_BASE + cleaned;
}

function displayName(agency) {
  if (agency?.first_name && agency?.last_name) {
    return `${agency.first_name} ${agency.last_name}`;
  }
  return agency?.username || `Agency #${agency?.id}`;
}

// Card accent styles by business type for coloring and shadow
const CARD_ACCENTS = {
  rental: "border-l-4 border-l-teal-500 bg-gradient-to-br from-teal-50/80 to-white dark:from-teal-950/30 dark:to-card shadow-md hover:shadow-lg",
  private: "border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/30 dark:to-card shadow-md hover:shadow-lg",
  company: "border-l-4 border-l-violet-500 bg-gradient-to-br from-violet-50/80 to-white dark:from-violet-950/30 dark:to-card shadow-md hover:shadow-lg",
  marina: "border-l-4 border-l-cyan-500 bg-gradient-to-br from-cyan-50/80 to-white dark:from-cyan-950/30 dark:to-card shadow-md hover:shadow-lg",
  default: "border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-card shadow-md hover:shadow-lg",
};

function getCardAccent(businessType) {
  return CARD_ACCENTS[businessType] || CARD_ACCENTS.default;
}

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [businessType, setBusinessType] = useState("");
  const [address, setAddress] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [agencyDetail, setAgencyDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchAgencies = useCallback(async () => {
    setLoading(true);
    setForbidden(false);
    try {
      const params = {
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      if (verifiedOnly) params.verified_only = true;
      if (businessType) params.business_type = businessType;
      if (address) params.address = address;
      if (search.trim()) params.search = search.trim();

      const res = await getAgencies(params);
      const payload = res.data?.agencies ?? res.data;
      const data = payload?.data ?? [];
      setAgencies(Array.isArray(data) ? data : []);
      setMeta({
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        per_page: payload.per_page ?? perPage,
        total: payload.total ?? 0,
      });
    } catch (err) {
      if (err.response?.status === 403) {
        setForbidden(true);
        setAgencies([]);
        toast.error("Super admin access required");
      } else {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to load agencies");
        setAgencies([]);
      }
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, verifiedOnly, businessType, address, sortBy, sortOrder]);

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  const openDetail = async (agency) => {
    setSelectedAgency(agency);
    setAgencyDetail(null);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await getAgency(agency.id);
      setAgencyDetail(res.data?.agency ?? res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Super admin access required");
      } else if (err.response?.status === 404) {
        toast.error("Agency not found");
      } else {
        toast.error(err.response?.data?.error || "Failed to load agency");
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedAgency(null);
    setAgencyDetail(null);
  };

  const handleSearch = () => {
    setPage(1);
    fetchAgencies();
  };

  if (forbidden) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Agencies
        </h1>
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <p className="text-muted-foreground">
              This section is available only to Super Admin users.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              If you believe you should have access, please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Building2 className="w-6 h-6" />
        Agencies
      </h1>
      <p className="text-sm text-muted-foreground">
        Car rental companies and agents who list vehicles on the platform. Super Admin only.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search username, first name, last name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Select
          value={businessType || "all"}
          onValueChange={(v) => {
            setBusinessType(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Business type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {BUSINESS_TYPES.filter((t) => t.value).map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={address || "all"}
          onValueChange={(v) => {
            setAddress(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Governorate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All governorates</SelectItem>
            {GOVERNORATES.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={verifiedOnly ? "yes" : "no"}
          onValueChange={(v) => {
            setVerifiedOnly(v === "yes");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Verified" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no">All</SelectItem>
            <SelectItem value="yes">Verified only</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortBy}
          onValueChange={(v) => {
            setSortBy(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_BY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(v) => {
            setSortOrder(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Asc</SelectItem>
            <SelectItem value="desc">Desc</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={String(perPage)}
          onValueChange={(v) => {
            setPerPage(Number(v));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleSearch}>
          Search
        </Button>
        <Button variant="outline" size="icon" onClick={fetchAgencies}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5" />
          Agencies ({meta.total})
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : agencies.length === 0 ? (
          <Card className="py-12 text-center text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            No agencies found
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agencies.map((agency) => (
              <Card
                key={agency.id}
                className={`overflow-hidden transition-all duration-200 ${getCardAccent(agency.business_type)}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={profileImgUrl(agency)}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover shrink-0 ring-2 ring-white dark:ring-card shadow"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                      />
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">
                          {displayName(agency)}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground truncate">
                          @{agency.username || "—"}
                        </p>
                      </div>
                    </div>
                    {agency.verified_by_admin && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" title="Verified" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {agency.business_type || "—"}
                    </Badge>
                    {agency.address && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {agency.address}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Car className="w-4 h-4" />
                      Cars
                    </span>
                    <span className="font-medium">
                      {agency.cars_count ?? 0}{" "}
                      <span className="text-muted-foreground font-normal text-xs">
                        ({agency.cars_accepted_count ?? 0} accepted, {agency.cars_not_accepted_count ?? 0} pending)
                      </span>
                    </span>
                  </div>
                  {(agency.sea_vehicles_count ?? 0) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Anchor className="w-4 h-4" />
                        Sea vehicles
                      </span>
                      <span className="font-medium">{agency.sea_vehicles_count}</span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => openDetail(agency)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {meta.current_page} of {meta.last_page} · Total {meta.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={detailOpen} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Agency — {selectedAgency ? displayName(selectedAgency) : ""} (ID:{" "}
              {selectedAgency?.id})
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : agencyDetail ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={profileImgUrl(agencyDetail)}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
                <div>
                  <p className="font-semibold">
                    {agencyDetail.first_name} {agencyDetail.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{agencyDetail.username}
                  </p>
                  {agencyDetail.verified_by_admin && (
                    <Badge className="mt-1 bg-green-600">Verified</Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <FieldRow label="Business type" value={agencyDetail.business_type} />
                <FieldRow label="Address" value={agencyDetail.address} />
                <FieldRow label="Profession" value={agencyDetail.profession} />
                <FieldRow label="Company number" value={agencyDetail.company_number} />
                <FieldRow label="Cars total" value={agencyDetail.cars_count} />
                <FieldRow label="Cars accepted" value={agencyDetail.cars_accepted_count} />
                <FieldRow label="Cars not accepted" value={agencyDetail.cars_not_accepted_count} />
                <FieldRow label="Sea vehicles" value={agencyDetail.sea_vehicles_count} />
              </div>
              {agencyDetail.website && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Website:</span>
                  <a
                    href={agencyDetail.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {agencyDetail.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {agencyDetail.location && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Location: </span>
                  {agencyDetail.location.city || ""}
                  {agencyDetail.location.lat != null && agencyDetail.location.lng != null
                    ? ` (${agencyDetail.location.lat}, ${agencyDetail.location.lng})`
                    : ""}
                </div>
              )}
              {agencyDetail.policies && (
                <div className="rounded-md border p-3 bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                    <FileText className="w-3 h-3" /> Policies
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{agencyDetail.policies}</p>
                </div>
              )}
              {agencyDetail.business_doc && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Business document
                  </p>
                  <a
                    href={
                      agencyDetail.business_doc.startsWith("http")
                        ? agencyDetail.business_doc
                        : ASSET_BASE + (agencyDetail.business_doc.startsWith("/") ? agencyDetail.business_doc.slice(1) : agencyDetail.business_doc)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    View document
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground py-4">No details available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldRow({ label, value }) {
  const v = value ?? "—";
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
    </div>
  );
}
