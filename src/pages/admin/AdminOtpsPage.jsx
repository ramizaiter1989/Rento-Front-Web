/**
 * Admin OTPs & SMS – CMS / Analytics
 * List OTPs with filters (phone, expired, dates, delivery_status, registration).
 * Delivery status is always live: every GET refreshes reports from Moursel.
 * SMS balance; optional manual delivery-report POST for a single batch.
 */

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getOtps,
  getOtp,
  getOtpStatistics,
  getSmsBalance,
  postSmsDeliveryReport,
} from "@/lib/adminApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Wallet,
  FileCheck,
  Loader2,
  BarChart3,
  Eye,
  UserX,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

const DELIVERY_LABELS = {
  "20": "Delivered",
  "21": "Not delivered",
  "22": "Waiting",
};

/** E.164 country calling code → country name. Used to derive country from phone number prefix. */
const COUNTRY_CALLING_CODES = {
  "1": "USA / Canada",
  "7": "Russia / Kazakhstan",
  "20": "Egypt",
  "27": "South Africa",
  "30": "Greece",
  "31": "Netherlands",
  "32": "Belgium",
  "33": "France",
  "34": "Spain",
  "36": "Hungary",
  "39": "Italy",
  "40": "Romania",
  "41": "Switzerland",
  "43": "Austria",
  "44": "United Kingdom",
  "45": "Denmark",
  "46": "Sweden",
  "47": "Norway",
  "48": "Poland",
  "49": "Germany",
  "51": "Peru",
  "52": "Mexico",
  "53": "Cuba",
  "54": "Argentina",
  "55": "Brazil",
  "56": "Chile",
  "57": "Colombia",
  "58": "Venezuela",
  "60": "Malaysia",
  "61": "Australia",
  "62": "Indonesia",
  "63": "Philippines",
  "64": "New Zealand",
  "65": "Singapore",
  "66": "Thailand",
  "81": "Japan",
  "82": "South Korea",
  "84": "Vietnam",
  "86": "China",
  "90": "Turkey",
  "91": "India",
  "92": "Pakistan",
  "93": "Afghanistan",
  "94": "Sri Lanka",
  "95": "Myanmar",
  "98": "Iran",
  "212": "Morocco",
  "213": "Algeria",
  "216": "Tunisia",
  "218": "Libya",
  "220": "Gambia",
  "221": "Senegal",
  "222": "Mauritania",
  "223": "Mali",
  "224": "Guinea",
  "225": "Ivory Coast",
  "226": "Burkina Faso",
  "227": "Niger",
  "228": "Togo",
  "229": "Benin",
  "230": "Mauritius",
  "231": "Liberia",
  "232": "Sierra Leone",
  "233": "Ghana",
  "234": "Nigeria",
  "235": "Chad",
  "236": "Central African Republic",
  "237": "Cameroon",
  "238": "Cape Verde",
  "239": "São Tomé and Príncipe",
  "240": "Equatorial Guinea",
  "241": "Gabon",
  "242": "Republic of the Congo",
  "243": "DR Congo",
  "244": "Angola",
  "245": "Guinea-Bissau",
  "246": "British Indian Ocean Territory",
  "248": "Seychelles",
  "249": "Sudan",
  "250": "Rwanda",
  "251": "Ethiopia",
  "252": "Somalia",
  "253": "Djibouti",
  "254": "Kenya",
  "255": "Tanzania",
  "256": "Uganda",
  "257": "Burundi",
  "258": "Mozambique",
  "260": "Zambia",
  "261": "Madagascar",
  "262": "Réunion / Mayotte",
  "263": "Zimbabwe",
  "264": "Namibia",
  "265": "Malawi",
  "266": "Lesotho",
  "267": "Botswana",
  "268": "Eswatini",
  "269": "Comoros",
  "290": "Saint Helena",
  "291": "Eritrea",
  "297": "Aruba",
  "298": "Faroe Islands",
  "299": "Greenland",
  "350": "Gibraltar",
  "351": "Portugal",
  "352": "Luxembourg",
  "353": "Ireland",
  "354": "Iceland",
  "355": "Albania",
  "356": "Malta",
  "357": "Cyprus",
  "358": "Finland",
  "359": "Bulgaria",
  "370": "Lithuania",
  "371": "Latvia",
  "372": "Estonia",
  "373": "Moldova",
  "374": "Armenia",
  "375": "Belarus",
  "376": "Andorra",
  "377": "Monaco",
  "378": "San Marino",
  "380": "Ukraine",
  "381": "Serbia",
  "382": "Montenegro",
  "383": "Kosovo",
  "385": "Croatia",
  "386": "Slovenia",
  "387": "Bosnia and Herzegovina",
  "389": "North Macedonia",
  "420": "Czech Republic",
  "421": "Slovakia",
  "423": "Liechtenstein",
  "500": "Falkland Islands",
  "501": "Belize",
  "502": "Guatemala",
  "503": "El Salvador",
  "504": "Honduras",
  "505": "Nicaragua",
  "506": "Costa Rica",
  "507": "Panama",
  "508": "Saint Pierre and Miquelon",
  "509": "Haiti",
  "590": "Guadeloupe",
  "591": "Bolivia",
  "592": "Guyana",
  "593": "Ecuador",
  "594": "French Guiana",
  "595": "Paraguay",
  "596": "Martinique",
  "597": "Suriname",
  "598": "Uruguay",
  "599": "Caribbean Netherlands",
  "670": "East Timor",
  "672": "Antarctica",
  "673": "Brunei",
  "674": "Nauru",
  "675": "Papua New Guinea",
  "676": "Tonga",
  "677": "Solomon Islands",
  "678": "Vanuatu",
  "679": "Fiji",
  "680": "Palau",
  "681": "Wallis and Futuna",
  "682": "Cook Islands",
  "683": "Niue",
  "685": "Samoa",
  "686": "Kiribati",
  "687": "New Caledonia",
  "688": "Tuvalu",
  "689": "French Polynesia",
  "690": "Tokelau",
  "691": "Micronesia",
  "692": "Marshall Islands",
  "850": "North Korea",
  "852": "Hong Kong",
  "853": "Macau",
  "855": "Cambodia",
  "856": "Laos",
  "880": "Bangladesh",
  "886": "Taiwan",
  "960": "Maldives",
  "961": "Lebanon",
  "962": "Jordan",
  "963": "Syria",
  "964": "Iraq",
  "965": "Kuwait",
  "966": "Saudi Arabia",
  "967": "Yemen",
  "968": "Oman",
  "970": "Palestine",
  "971": "UAE",
  "972": "Israel",
  "973": "Bahrain",
  "974": "Qatar",
  "975": "Bhutan",
  "976": "Mongolia",
  "977": "Nepal",
  "992": "Tajikistan",
  "993": "Turkmenistan",
  "994": "Azerbaijan",
  "995": "Georgia",
  "996": "Kyrgyzstan",
  "998": "Uzbekistan",
  int: "International",
  international: "International",
};

/** Derive country from phone number (E.164 prefix) or fallback to API country_origin. */
function getCountryLabel(phoneNumber, countryOrigin) {
  const digits = phoneNumber ? String(phoneNumber).replace(/\D/g, "") : "";
  if (digits.length > 0) {
    const code3 = digits.slice(0, 3);
    const code2 = digits.slice(0, 2);
    const code1 = digits.slice(0, 1);
    if (COUNTRY_CALLING_CODES[code3]) return COUNTRY_CALLING_CODES[code3];
    if (COUNTRY_CALLING_CODES[code2]) return COUNTRY_CALLING_CODES[code2];
    if (COUNTRY_CALLING_CODES[code1]) return COUNTRY_CALLING_CODES[code1];
  }
  if (countryOrigin != null && countryOrigin !== "") {
    const key = String(countryOrigin).replace(/^\+/, "").trim().toLowerCase();
    return COUNTRY_CALLING_CODES[key] ?? COUNTRY_CALLING_CODES[countryOrigin] ?? countryOrigin;
  }
  return "—";
}

/** Return the calling code used (for display in parentheses). */
function getCountryCode(phoneNumber, countryOrigin) {
  const digits = phoneNumber ? String(phoneNumber).replace(/\D/g, "") : "";
  if (digits.length > 0) {
    const code3 = digits.slice(0, 3);
    const code2 = digits.slice(0, 2);
    const code1 = digits.slice(0, 1);
    if (COUNTRY_CALLING_CODES[code3]) return code3;
    if (COUNTRY_CALLING_CODES[code2]) return code2;
    if (COUNTRY_CALLING_CODES[code1]) return code1;
  }
  return countryOrigin ?? "—";
}

function KpiCard({ title, value, sub, icon: Icon, className = "" }) {
  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-0.5">{value ?? "—"}</p>
            {sub != null && sub !== "" && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          {Icon && <Icon className="h-8 w-8 text-muted-foreground/60" />}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOtpsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 50, total: 0 });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [balance, setBalance] = useState({ balance_int: null, balance_decimal: null, success: false });
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [deliveryBatchId, setDeliveryBatchId] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [otpDetailOpen, setOtpDetailOpen] = useState(false);
  const [otpDetail, setOtpDetail] = useState(null);
  const [otpDetailLoading, setOtpDetailLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [expiredFilter, setExpiredFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("all");
  const [registrationFilter, setRegistrationFilter] = useState("all");
  const [groupByPhone, setGroupByPhone] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: perPage };
      if (phoneNumber?.trim()) params.phone_number = phoneNumber.trim();
      if (expiredFilter === "true") params.expired = true;
      if (expiredFilter === "false") params.expired = false;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (deliveryStatusFilter && deliveryStatusFilter !== "all") params.delivery_status = deliveryStatusFilter;
      if (registrationFilter && registrationFilter !== "all") params.registration = registrationFilter;
      if (groupByPhone) params.group_by = "phone";

      const res = await getOtps(params);
      const byPhone = groupByPhone && res.data?.otps_by_phone;
      const payload = byPhone ? res.data.otps_by_phone : res.data?.otps;
      const data = payload?.data || [];
      setList(data);
      setMeta({
        current_page: payload?.current_page ?? 1,
        last_page: payload?.last_page ?? 1,
        per_page: payload?.per_page ?? perPage,
        total: payload?.total ?? 0,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load OTPs");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, phoneNumber, expiredFilter, fromDate, toDate, deliveryStatusFilter, registrationFilter, groupByPhone]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getOtpStatistics();
      setStats(res.data?.statistics ?? res.data ?? null);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const res = await getSmsBalance();
      setBalance({
        success: res.data?.success ?? false,
        balance_int: res.data?.balance_int ?? null,
        balance_decimal: res.data?.balance_decimal ?? null,
        error: res.data?.error ?? null,
      });
    } catch (err) {
      setBalance({
        success: false,
        balance_int: null,
        balance_decimal: null,
        error: err.response?.data?.error || "Failed to fetch balance",
      });
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleFetchDeliveryReport = async (e) => {
    e.preventDefault();
    const batchId = deliveryBatchId?.trim();
    if (!batchId) {
      toast.error("Enter a batch ID");
      return;
    }
    setDeliveryLoading(true);
    try {
      const res = await postSmsDeliveryReport(batchId);
      const d = res.data;
      if (d?.success) {
        toast.success(`Updated ${d.otps_updated ?? 0} OTP(s). Status: ${DELIVERY_LABELS[d.delivery_status] || d.delivery_status}`);
        setDeliveryBatchId("");
        fetchList();
        fetchStats();
      } else {
        toast.error(d?.error || "Delivery report failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to fetch delivery report");
    } finally {
      setDeliveryLoading(false);
    }
  };

  const applyFilters = () => {
    setPage(1);
    fetchList();
  };

  const isExpired = (expiredAt) => {
    if (!expiredAt) return false;
    return new Date(expiredAt) < new Date();
  };

  const openOtpDetail = async (id) => {
    setOtpDetailOpen(true);
    setOtpDetail(null);
    setOtpDetailLoading(true);
    try {
      const res = await getOtp(id);
      setOtpDetail(res.data?.otp ?? res.data ?? null);
    } catch {
      toast.error("Failed to load OTP details");
      setOtpDetail(null);
    } finally {
      setOtpDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <KeyRound className="w-7 h-7" />
          OTP &amp; SMS Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Audit trail of all OTPs. Delivery status is always live—every list, stats, or single-OTP request refreshes from Moursel first.
        </p>
      </div>

      {/* KPI row – OTP counts + balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {statsLoading ? (
          <Card className="col-span-full"><CardContent className="py-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent></Card>
        ) : (
          <>
            <KpiCard title="Total OTPs" value={stats?.total_otps} icon={BarChart3} />
            <KpiCard title="Active" value={stats?.active_otps} sub="Not expired" icon={KeyRound} />
            <KpiCard title="Expired" value={stats?.expired_otps} icon={KeyRound} />
            <KpiCard title="Today" value={stats?.otps_today} icon={BarChart3} />
            <KpiCard title="This week" value={stats?.otps_this_week} icon={BarChart3} />
            <KpiCard title="This month" value={stats?.otps_this_month} icon={BarChart3} />
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">SMS balance</p>
                    {balanceLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin mt-1 text-muted-foreground" />
                    ) : balance.error ? (
                      <p className="text-sm text-destructive mt-0.5">{balance.error}</p>
                    ) : (
                      <p className="text-xl font-bold mt-0.5">
                        {balance.balance_decimal != null ? balance.balance_decimal : balance.balance_int ?? "—"}
                      </p>
                    )}
                  </div>
                  <Wallet className="h-8 w-8 text-muted-foreground/60" />
                </div>
                {!balanceLoading && !balance.error && (
                  <Button variant="ghost" size="sm" className="mt-2 h-7 px-2" onClick={fetchBalance}>
                    <RefreshCcw className="h-3 w-3 mr-1" /> Refresh
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Registration analysis */}
      {stats && (stats.phones_never_registered != null || stats.phones_became_user != null) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <UserX className="h-9 w-9 text-amber-600" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Phones never registered</p>
                  <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{stats.phones_never_registered ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Received OTP but not yet a user</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <UserCheck className="h-9 w-9 text-emerald-600" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Phones became user</p>
                  <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{stats.phones_became_user ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">OTP led to signup</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delivery report – always live on GET + optional manual POST */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Delivery status
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Every OTP list, statistics, and single-OTP request refreshes delivery from Moursel first—data is always live. Optionally fetch a single batch below (e.g. for debugging).
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchDeliveryReport} className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Batch ID (on-demand)</Label>
              <Input
                placeholder="e.g. abc-123"
                value={deliveryBatchId}
                onChange={(e) => setDeliveryBatchId(e.target.value)}
                className="w-48"
              />
            </div>
            <Button type="submit" disabled={deliveryLoading}>
              {deliveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4 mr-1" />}
              Fetch this batch
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Data table – filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">OTP list</CardTitle>
          <p className="text-xs text-muted-foreground">
            Filter and group for analysis. Delivery status is refreshed from Moursel on every load.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input placeholder="Filter by phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-36" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Expired</Label>
              <Select value={expiredFilter} onValueChange={setExpiredFilter}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Expired only</SelectItem>
                  <SelectItem value="false">Active only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-32" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-32" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Delivery</Label>
              <Select value={deliveryStatusFilter} onValueChange={setDeliveryStatusFilter}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="20">Delivered</SelectItem>
                  <SelectItem value="21">Not delivered</SelectItem>
                  <SelectItem value="22">Waiting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Registration</Label>
              <Select value={registrationFilter} onValueChange={setRegistrationFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="only_not_registered">Not registered</SelectItem>
                  <SelectItem value="only_became_user">Became user</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">View</Label>
              <Select value={groupByPhone ? "phone" : "list"} onValueChange={(v) => setGroupByPhone(v === "phone")}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">Per OTP</SelectItem>
                  <SelectItem value="phone">By phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Per page</Label>
              <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={applyFilters}>Apply</Button>
            <Button variant="outline" size="icon" onClick={() => { fetchList(); fetchStats(); }} disabled={loading}>
              <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <div className="overflow-auto max-h-[min(70vh,800px)]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/80 hover:bg-muted/80 sticky top-0 z-10 shadow-[0_1px_0_0_hsl(var(--border))] [&_th]:bg-muted/80">
                    {groupByPhone ? (
                      <>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5">Phone</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5">Last sent</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5">OTP count</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5">Country</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5">Registered</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5">User ID</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5 w-14">ID</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5 min-w-[120px]">Phone</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5 w-20">Code</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5">Created</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5">Batch ID</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5 min-w-[100px]">Country</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5">Delivery</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5">Report at</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5 w-20">Status</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5 w-16 text-center">#</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5 w-24">Registered</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5 w-16">User</TableHead>
                        <TableHead className="font-semibold text-foreground whitespace-nowrap py-3.5 w-12"></TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={groupByPhone ? 6 : 13} className="text-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Loading OTPs…</p>
                      </TableCell>
                    </TableRow>
                  ) : list.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={groupByPhone ? 6 : 13} className="text-center py-16 text-muted-foreground">
                        No OTPs match your filters.
                      </TableCell>
                    </TableRow>
                  ) : groupByPhone ? (
                    list.map((row, idx) => (
                      <TableRow
                        key={row.phone_number}
                        className={`transition-colors ${idx % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/40`}
                      >
                        <TableCell className="font-mono text-sm py-2.5">{row.phone_number}</TableCell>
                        <TableCell className="text-sm text-muted-foreground py-2.5">{row.last_sent_at ? new Date(row.last_sent_at).toLocaleString() : "—"}</TableCell>
                        <TableCell className="text-sm font-medium py-2.5">{row.otp_count ?? "—"}</TableCell>
                        <TableCell className="text-sm py-2.5">
                          <span className="font-medium text-foreground">{getCountryLabel(row.phone_number, row.country_origin)}</span>
                          {getCountryCode(row.phone_number, row.country_origin) !== "—" && (
                            <span className="text-muted-foreground text-xs ml-1">(+{getCountryCode(row.phone_number, row.country_origin)})</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5">
                          {row.is_registered_user != null ? (
                            row.is_registered_user ? (
                              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-xs font-medium">Yes</Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-red-600 hover:bg-red-600 text-xs font-medium">No</Badge>
                            )
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5">
                          {row.registered_user_id != null ? (
                            <Button variant="link" className="h-auto p-0 font-mono text-sm text-primary hover:underline" onClick={() => navigate("/admin/users")}>
                              {row.registered_user_id}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    list.map((otp, idx) => {
                      const expired = otp.is_expired ?? isExpired(otp.expired_at);
                      return (
                        <TableRow
                          key={otp.id}
                          className={`transition-colors ${idx % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/40`}
                        >
                          <TableCell className="font-mono text-sm py-2.5 text-muted-foreground">{otp.id}</TableCell>
                          <TableCell className="font-mono text-sm py-2.5">{otp.phone_number}</TableCell>
                          <TableCell className="font-mono font-semibold text-sm py-2.5">{otp.code}</TableCell>
                          <TableCell className="text-sm text-muted-foreground py-2.5 whitespace-nowrap">{otp.created_at ? new Date(otp.created_at).toLocaleString() : "—"}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground py-2.5 max-w-[100px] truncate" title={otp.batch_id ?? ""}>{otp.batch_id ?? "—"}</TableCell>
                          <TableCell className="py-2.5">
                            <span className="font-medium text-foreground text-sm">{getCountryLabel(otp.phone_number, otp.country_origin)}</span>
                            {getCountryCode(otp.phone_number, otp.country_origin) !== "—" && (
                              <span className="text-muted-foreground text-xs ml-1">(+{getCountryCode(otp.phone_number, otp.country_origin)})</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5">
                            {otp.delivery_status != null ? (
                              <Badge variant="outline" className="text-xs font-medium">{DELIVERY_LABELS[otp.delivery_status] ?? otp.delivery_status}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground py-2.5 whitespace-nowrap">{otp.delivery_report_at ? new Date(otp.delivery_report_at).toLocaleString() : "—"}</TableCell>
                          <TableCell className="py-2.5">
                            <Badge variant={expired ? "destructive" : "default"} className="text-xs font-medium">{expired ? "Expired" : "Active"}</Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium py-2.5 text-center">{otp.otp_count_for_this_number ?? "—"}</TableCell>
                          <TableCell className="py-2.5">
                            {otp.is_registered_user != null ? (
                              otp.is_registered_user ? (
                                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-xs font-medium">Yes</Badge>
                              ) : (
                                <Badge variant="destructive" className="bg-red-600 hover:bg-red-600 text-xs font-medium">No</Badge>
                              )
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5">
                            {otp.registered_user_id != null ? (
                              <Button variant="link" className="h-auto p-0 font-mono text-sm text-primary hover:underline" onClick={() => navigate("/admin/users")}>
                                {otp.registered_user_id}
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <Button variant="ghost" size="icon" onClick={() => openOtpDetail(otp.id)} className="h-8 w-8 rounded-md hover:bg-muted" title="View details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {meta.current_page} of {meta.last_page} · Total {meta.total}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single OTP detail modal */}
      <Dialog open={otpDetailOpen} onOpenChange={setOtpDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>OTP details</DialogTitle>
          </DialogHeader>
          {otpDetailLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : otpDetail ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">ID:</span> <span className="font-mono">{otpDetail.id}</span></p>
              <p><span className="text-muted-foreground">Phone:</span> <span className="font-mono">{otpDetail.phone_number}</span></p>
              <p><span className="text-muted-foreground">Code:</span> <span className="font-mono font-semibold">{otpDetail.code}</span></p>
              <p><span className="text-muted-foreground">Batch ID:</span> <span className="font-mono">{otpDetail.batch_id ?? "—"}</span></p>
              <p><span className="text-muted-foreground">Country:</span> {getCountryLabel(otpDetail.phone_number, otpDetail.country_origin)}{(() => { const c = getCountryCode(otpDetail.phone_number, otpDetail.country_origin); return c !== "—" ? ` (+${c})` : ""; })()}</p>
              <p><span className="text-muted-foreground">Delivery:</span> {otpDetail.delivery_status != null ? (DELIVERY_LABELS[otpDetail.delivery_status] ?? otpDetail.delivery_status) : "—"}</p>
              <p><span className="text-muted-foreground">Delivery report at:</span> {otpDetail.delivery_report_at ? new Date(otpDetail.delivery_report_at).toLocaleString() : "—"}</p>
              <p><span className="text-muted-foreground">Created:</span> {otpDetail.created_at ? new Date(otpDetail.created_at).toLocaleString() : "—"}</p>
              <p><span className="text-muted-foreground">Expired at:</span> {otpDetail.expired_at ? new Date(otpDetail.expired_at).toLocaleString() : "—"}</p>
              <p><span className="text-muted-foreground">Is expired:</span> {(otpDetail.is_expired ?? isExpired(otpDetail.expired_at)) ? "Yes" : "No"}</p>
              <p><span className="text-muted-foreground">Registered user:</span> {otpDetail.is_registered_user != null ? (otpDetail.is_registered_user ? "Yes" : "No") : "—"}</p>
              {otpDetail.registered_user_id != null && (
                <p><span className="text-muted-foreground">User ID:</span>{" "}
                  <Button variant="link" className="h-auto p-0 font-mono" onClick={() => { setOtpDetailOpen(false); navigate("/admin/users"); }}>
                    {otpDetail.registered_user_id}
                  </Button>
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No details</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
