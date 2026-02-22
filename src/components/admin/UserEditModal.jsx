import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_AVATAR = "/avatar.png";
const ASSET_BASE = "https://rento-lb.com/api/storage/";

const UserEditModal = ({ open, onClose, user, onSaved }) => {
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setForm(user);
      setPreview(
        user.profile_picture
          ? user.profile_picture.startsWith("http")
            ? user.profile_picture
            : ASSET_BASE + user.profile_picture
          : DEFAULT_AVATAR
      );
    }
  }, [user]);

  if (!form) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({ ...prev, profile_picture_file: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      });

      if (form.profile_picture_file) {
        formData.append("profile_picture", form.profile_picture_file);
      }

      const { data } = await api.post(
        `/admin/users/${form.id}?_method=PUT`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      onSaved(data.user || form);
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update user information and permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">

          {/* PROFILE IMAGE */}
          <div className="flex items-center gap-6 border-b pb-6">
            <img
              src={preview}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover border"
            />
            <div>
              <Label>Profile Picture</Label>
              <Input type="file" onChange={handleFileChange} />
            </div>
          </div>

          {/* BASIC INFO */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Field label="Username" value={form.username} onChange={(v) => handleChange("username", v)} />
              <Field label="Email" value={form.email} onChange={(v) => handleChange("email", v)} />
              <Field label="Phone" value={form.phone_number} onChange={(v) => handleChange("phone_number", v)} />
              <Field label="First Name" value={form.first_name} onChange={(v) => handleChange("first_name", v)} />
              <Field label="Last Name" value={form.last_name} onChange={(v) => handleChange("last_name", v)} />
              <Field label="City" value={form.city} onChange={(v) => handleChange("city", v)} />
              <Field label="Gender" value={form.gender} onChange={(v) => handleChange("gender", v)} />
              <Field label="Birth Date" type="date" value={form.birth_date} onChange={(v) => handleChange("birth_date", v)} />

            </div>
          </div>

          {/* BIO */}
          <div>
            <Label>Bio</Label>
            <Textarea
              value={form.bio || ""}
              onChange={(e) => handleChange("bio", e.target.value)}
            />
          </div>

          {/* ROLE */}
          <div>
            <Field label="Role" value={form.role} onChange={(v) => handleChange("role", v)} />
          </div>

          {/* TOGGLES */}
          <div className="space-y-4 border-t pt-6">
            <Toggle
              label="Active Status"
              aria-label="Toggle user active status"
              checked={form.update_access}
              onChange={(v) => handleChange("update_access", v)}
            />
            {form.verified_by_admin && (
              <Toggle
                label="Verified by Admin (can revoke only)"
                checked={form.verified_by_admin}
                aria-label="Revoke verification"
                onChange={(v) => handleChange("verified_by_admin", v)}
              />
            )}
            <Toggle
              label="Account Locked"
              checked={form.is_locked}
              aria-label="Lock or unlock user account"
              onChange={(v) => handleChange("is_locked", v)}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline"  aria-label="Cancel user edit" onClick={onClose}>
              Cancel
            </Button>
            <Button aria-label="Save user changes" onClick={handleSave}>
              Save Changes
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal;

/* ===== Helpers ===== */

const Field = ({ label, value, onChange, type = "text" }) => (
  <div>
    <Label>{label}</Label>
    <Input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between bg-muted/40 p-4 rounded-xl">
    <div className="font-medium">{label}</div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);