import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Car,
  CalendarCheck,
  DollarSign,
  Megaphone,
  Star,
  Bell,
  MessageSquare,
  AlertCircle,
  KeyRound,
  Calendar,
  ChevronLeft,
  LogOut,
  User,
  Search,
  Tag,
  Briefcase,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

/* ===============================
   NAV CONFIG
================================ */
const NAV_SECTIONS = [
  {
    id: "main",
    title: "MAIN",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    id: "management",
    title: "MANAGEMENT",
    items: [
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/real-user-data", label: "Real User Data", icon: FileCheck },
      { to: "/admin/cars", label: "Cars", icon: Car },
      { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
      { to: "/admin/payments", label: "Payments", icon: DollarSign },
      { to: "/admin/promo-codes", label: "Promo Codes", icon: Tag },
      { to: "/admin/brokers", label: "Brokers", icon: Users },
      { to: "/admin/ads", label: "Ads", icon: Megaphone },
      { to: "/admin/featured", label: "Featured", icon: Star },
      { to: "/admin/holidays", label: "Holidays", icon: Calendar },
      { to: "/admin/agencies", label: "Agencies", icon: Users },
    ],
  },
  {
    id: "system",
    title: "SYSTEM",
    items: [
      { to: "/admin/services", label: "Services", icon: Briefcase },
      { to: "/admin/announcements", label: "Announcements", icon: Bell },
      { to: "/admin/appeals", label: "Appeals", icon: AlertCircle },
      { to: "/admin/suggestions", label: "Suggestions", icon: MessageSquare },
      {
        to: "/admin/notifications",
        label: "Notifications",
        icon: Bell,
        badge: 3,
      },
      { to: "/admin/otps", label: "OTPs", icon: KeyRound },
    ],
  },
];

export const AdminLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("admin_sidebar") === "true"
  );
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("admin_sidebar", collapsed);
  }, [collapsed]);

  // Auto overlay on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, []);

  const filteredSections = useMemo(() => {
    if (!search) return NAV_SECTIONS;
    return NAV_SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter((i) =>
        i.label.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter((s) => s.items.length > 0);
  }, [search]);

  const breadcrumb =
    location.pathname
      .replace("/admin", "")
      .split("/")
      .filter(Boolean)
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(" / ") || "Dashboard";

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-background">
        {/* ===============================
            SIDEBAR
        ================================ */}
        <AnimatePresence>
          <motion.aside
            initial={{ width: collapsed ? 88 : 256 }}
            animate={{ width: collapsed ? 88 : 256 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="relative border-r bg-card/95 backdrop-blur p-4 flex flex-col"
          >
            {/* Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="absolute -right-3 top-6 bg-card border rounded-full p-1 shadow hover:bg-muted"
            >
              <ChevronLeft
                className={cn(
                  "w-4 h-4 transition-transform",
                  collapsed && "rotate-180"
                )}
              />
            </button>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 mb-4 rounded-xl px-2 py-2 hover:bg-muted">
                  <img
                    src="/rento-512.png"
                    className="w-10 h-10 rounded-full"
                  />
                  {!collapsed && (
                    <div>
                      <p className="text-sm font-semibold">Abbas Nemer</p>
                      <p className="text-xs text-muted-foreground">
                        Lead Developer 
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search */}
            {!collapsed && (
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-9"
                />
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 space-y-6 overflow-y-auto">
              {filteredSections.map((section) => (
                <div key={section.id}>
                  {!collapsed && (
                    <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground">
                      {section.title}
                    </p>
                  )}

                  <div className="space-y-1">
                    {section.items.map(
                      ({ to, label, icon: Icon, badge }) => (
                        <div key={to}>
                          <NavLink
                            to={to}
                            end
                            className={({ isActive }) =>
                              cn(
                                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                                "transition-all duration-200",
                                "hover:scale-[1.05]",
                                isActive
                                  ? "bg-primary/10 text-primary shadow-sm"
                                  : "text-muted-foreground hover:bg-muted"
                              )
                            }
                          >
                            {/* Active glow */}
                            <span className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-[.active]:opacity-100 blur-sm" />

                            <Icon className="relative w-4 h-4" />
                            {!collapsed && <span>{label}</span>}

                            {/* Badge */}
                            {badge && !collapsed && (
                              <motion.span
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ repeat: Infinity, duration: 1.8 }}
                                className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full"
                              >
                                {badge}
                              </motion.span>
                            )}
                          </NavLink>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </nav>
          </motion.aside>
        </AnimatePresence>

        {/* ===============================
            CONTENT
        ================================ */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-4 text-sm text-muted-foreground">
            Admin / {breadcrumb}
          </div>

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </TooltipProvider>
  );
};
