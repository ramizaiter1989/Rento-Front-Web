import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Mail,
  Star,
  CreditCard,
  Briefcase,
  Hash,
} from "lucide-react";

const DEFAULT_AVATAR = "/avatar.png";
const ASSET_BASE = "https://rento-lb.com/api/storage/";

const UserProfileModal = ({ open, onClose, user, onEdit }) => {
  if (!user) return null;

  const client = user.client || {};

  const profileImage = user.profile_picture
    ? user.profile_picture.startsWith("http")
      ? user.profile_picture
      : ASSET_BASE + user.profile_picture
    : DEFAULT_AVATAR;

  const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
      <Icon className="w-5 h-5 text-muted-foreground mt-1" />
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
        <div className="font-semibold text-sm">
          {value || "N/A"}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background">

        {/* ✅ REQUIRED FOR ACCESSIBILITY */}
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View complete user account details and documents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 mt-4">

          {/* ================= HEADER ================= */}
          <div className="bg-muted/30 rounded-2xl p-6 flex items-center gap-6">
            <div className="relative">
              <img
                src={profileImage}
                alt={user.username}
                className="w-24 h-24 rounded-xl object-cover border shadow-md"
                onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-600 rounded-full border-2 border-background" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {user.username}
                </h2>
                <Badge>{user.role}</Badge>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>

              <div className="flex flex-wrap gap-4 mt-3">
                <Badge variant={user.update_access ? "default" : "destructive"}>
                  Status: {user.update_access ? "Active" : "Blocked"}
                </Badge>

                <Badge variant={user.verified_by_admin ? "default" : "secondary"}>
                  Verified: {user.verified_by_admin ? "Yes" : "No"}
                </Badge>

                <Badge variant={user.is_locked ? "destructive" : "outline"}>
                  Lock: {user.is_locked ? "Locked" : "Unlocked"}
                </Badge>
              </div>
            </div>
          </div>

          {/* ================= BASIC INFO ================= */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard icon={Hash} label="User ID" value={user.id} />
              <InfoCard icon={Phone} label="Phone" value={user.phone_number} />
              <InfoCard icon={User} label="First Name" value={user.first_name} />
              <InfoCard icon={User} label="Last Name" value={user.last_name} />
              <InfoCard icon={MapPin} label="City" value={user.city} />
              <InfoCard icon={Calendar} label="Birth Date" value={user.birth_date} />
              <InfoCard icon={Calendar} label="Created At" value={user.created_at} />
            </div>
          </Section>

          {/* ================= BIO ================= */}
          {user.bio && (
            <Section title="Bio">
              <div className="bg-muted/40 p-4 rounded-xl text-sm leading-relaxed">
                {user.bio}
              </div>
            </Section>
          )}

          {/* ================= CLIENT DETAILS ================= */}
          <Section title="Client Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard icon={CreditCard} label="License Number" value={client.license_number} />
              <InfoCard icon={Briefcase} label="Profession" value={client.profession} />
              <InfoCard icon={CreditCard} label="Avg Salary" value={client.avg_salary} />
              <InfoCard icon={Hash} label="Promo Code" value={client.promo_code} />
              <InfoCard icon={Star} label="Rating" value={client.average_rating} />
            </div>
          </Section>

          {/* ================= DOCUMENTS ================= */}
          <Section title="Documents">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DocCard label="Profile Picture" path={user.profile_picture} />
              <DocCard label="Driver License" path={client.driver_license} />
              <DocCard label="ID Card Front" path={user.id_card_front} />
              <DocCard label="ID Card Back" path={user.id_card_back} />
            </div>
          </Section>

          {/* ================= ACTIONS ================= */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              aria-label="Close user profile modal"
              onClick={onClose}
            >
              Close
            </Button>

            <Button
              aria-label="Edit this user profile"
              onClick={onEdit}
            >
              Edit User
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;


/* ================= Helper Components ================= */

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <div className="text-lg font-semibold border-l-4 border-primary pl-3">
      {title}
    </div>
    {children}
  </div>
);

const DocCard = ({ label, path }) => {
  const DEFAULT_AVATAR = "/avatar.png";
  const ASSET_BASE = "https://rento-lb.com/api/storage/";

  const url = path
    ? path.startsWith("http")
      ? path
      : ASSET_BASE + path
    : null;

  return (
    <div className="bg-muted/40 rounded-xl p-4 text-center">
      <div className="text-xs text-muted-foreground mb-2">
        {label}
      </div>

      {url ? (
        <img
          src={url}
          alt={label}
          className="w-full h-28 object-cover rounded-md"
        />
      ) : (
        <div className="h-28 flex items-center justify-center text-muted-foreground text-sm">
          No document
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> d7f0598ba238695ac2bb6c17afb46754360d3df2
