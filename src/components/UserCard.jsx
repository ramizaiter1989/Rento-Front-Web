import React from "react";
import { Eye, Edit, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEFAULT_AVATAR = "/avatar.png";
const ASSET_BASE = "https://rento-lb.com/api/storage/";

const getProfileImg = (user) => {
  const p = user?.profile_picture;
  if (!p) return DEFAULT_AVATAR;
  if (p.startsWith("http")) return p;
  const cleaned = p.startsWith("/") ? p.slice(1) : p;
  return ASSET_BASE + cleaned;
};

const getRoleStyles = (role) => {
  switch (role) {
    case "admin":
      return "bg-red-500/10 border-red-500/40 hover:bg-red-500/20";
    case "agency":
      return "bg-green-500/10 border-green-500/40 hover:bg-green-500/20";
    case "client":
      return "bg-blue-500/10 border-blue-500/40 hover:bg-blue-500/20";
    default:
      return "bg-card";
  }
};


const UserCard = ({ user, onView, onEdit, onDelete }) => {
  return (
    <div className={`border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${getRoleStyles(
    user.role
  )}`}>

      {/* Avatar */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={getProfileImg(user)}
          alt={user.username}
          className="w-12 h-12 rounded-full object-cover border"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
        />

        <div>
          <div className="font-semibold">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.username}
          </div>
          <div className="text-xs text-muted-foreground">
            {user.email}
          </div>
        </div>
      </div>

      {/* Role + Status */}
      <div className="flex items-center justify-between mb-3">
        <Badge
  className={
    user.role === "admin"
      ? "bg-red-500/20 text-red-600 border-red-500/40"
      : user.role === "agency"
      ? "bg-green-500/20 text-green-600 border-green-500/40"
      : "bg-blue-500/20 text-blue-600 border-blue-500/40"
  }
>
  {user.role}
</Badge>


        {user.update_access ? (
          <Badge className="bg-green-600">Active</Badge>
        ) : (
          <Badge variant="destructive">Blocked</Badge>
        )}
      </div>

      {/* Phone */}
      {user.phone_number && (
        <a
          href={`https://wa.me/${user.phone_number.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-green-600 text-sm mb-3 hover:underline"
        >
          <MessageCircle className="w-4 h-4" />
          {user.phone_number}
        </a>
      )}

      {/* Actions */}
      <div className="flex justify-between mt-2">
        <Button size="icon" variant="ghost" aria-label="View user details" onClick={onView}>
          <Eye className="w-4 h-4" />
        </Button>

        <Button size="icon" variant="ghost" aria-label="Edit user" onClick={onEdit}>
          <Edit className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-label="Delete user"
          className="text-red-500"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserCard;
