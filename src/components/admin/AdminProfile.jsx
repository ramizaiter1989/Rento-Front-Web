import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminProfile = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fullName =
    user.first_name || user.last_name
      ? `${user.first_name || ""} ${user.last_name || ""}`
      : user.username || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin-auth");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/10 transition">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profile_picture ? `/api/storage/${user.profile_picture}` : ""} />
            <AvatarFallback className="bg-[#00A19C] text-white font-bold">
              {fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-white">
              {fullName}
            </span>
            <span className="text-xs text-white/70">
              {user.role || "admin"}
            </span>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48">
        <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminProfile;
