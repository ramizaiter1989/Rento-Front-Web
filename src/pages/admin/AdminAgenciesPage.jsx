import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
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
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_AVATAR = "/avatar.png";
const ITEMS_PER_PAGE = 20;

export default function AdminAgenciesPage() {
  const navigate = useNavigate();

  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState("all");
  const [businessType, setBusinessType] = useState("all");

  useEffect(() => {
    fetchAgencies();
  }, [page, search, verifiedOnly, businessType]);

  const fetchAgencies = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        per_page: ITEMS_PER_PAGE,
      };

      if (search) params.search = search;
      if (verifiedOnly === "verified") params.verified_only = 1;
      if (businessType !== "all") params.business_type = businessType;

      const { data } = await api.get("/admin/agencies", { params });

      setAgencies(data.agencies.data);
      setTotalPages(data.agencies.last_page);
    } catch (err) {
      console.error("Failed to fetch agencies");
    } finally {
      setLoading(false);
    }
  };

  const getProfileImg = (agency) => {
    if (!agency.profile_picture) return DEFAULT_AVATAR;
    if (agency.profile_picture.startsWith("http"))
      return agency.profile_picture;
    return `https://rento-lb.com/api/storage/${agency.profile_picture}`;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agencies</h1>
        <div className="text-sm text-muted-foreground">
          Total: {agencies.length}
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="flex flex-wrap gap-4 items-center">

        <Input
          placeholder="Search agency..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-60"
        />

        <Select value={verifiedOnly} onValueChange={setVerifiedOnly}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="verified">Verified Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={businessType} onValueChange={setBusinessType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Business Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="rental">Rental</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="marina">Marina</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* ================= GRID ================= */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          Loading agencies...
        </div>
      ) : agencies.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No agencies found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {agencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-card border rounded-xl p-5 space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={getProfileImg(agency)}
                  alt={agency.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">
                    {agency.username}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {agency.address}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">
                  {agency.business_type}
                </Badge>

                {agency.verified_by_admin && (
                  <Badge>Verified</Badge>
                )}

                <Badge variant="outline">
                  Cars: {agency.cars_count}
                </Badge>
              </div>

              <Button
                className="w-full"
                onClick={() => navigate(`/agency/${agency.id}`)}
              >
                View Agency
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">

          <Button
            size="icon"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (p) => (
              <Button
                key={p}
                size="sm"
                variant={page === p ? "default" : "outline"}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            )
          )}

          <Button
            size="icon"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={16} />
          </Button>

        </div>
      )}
    </div>
  );
}
