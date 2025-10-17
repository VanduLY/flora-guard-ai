import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Camera, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { compressImage } from "@/lib/imageCompression";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: authUser, profile: userProfile, updateProfile: updateGlobalProfile, saveProfile, refreshProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    email: "",
    avatar_url: "",
    location: "",
  });
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadProfile();
  }, [authUser, userProfile]);

  const loadProfile = async () => {
    if (!authUser) {
      navigate("/login");
      return;
    }

    setProfile({
      username: userProfile?.username || "",
      full_name: userProfile?.full_name || "",
      email: authUser.email || "",
      avatar_url: userProfile?.avatar_url || "",
      location: userProfile?.location || "",
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxRetries = 3;
    let attempt = 0;

    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);

      // Compress image before upload
      const compressedFile = await compressImage(file, 2);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("avatars")
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload with retry logic
      while (attempt < maxRetries) {
        try {
          const fileExt = compressedFile.name.split(".").pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, compressedFile);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

          // Update profile in database with retry
          const success = await saveProfile({ avatar_url: publicUrl });

          if (success) {
            // Update local state
            setProfile({ ...profile, avatar_url: publicUrl });

            toast({
              title: "Success",
              description: "Profile picture updated successfully",
            });
            return;
          } else if (attempt < maxRetries - 1) {
            throw new Error("Failed to save to database");
          }
        } catch (error) {
          attempt++;
          if (attempt >= maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (profile.avatar_url) {
        const path = profile.avatar_url.split("/").pop();
        if (path) {
          await supabase.storage
            .from("avatars")
            .remove([`${user.id}/${path}`]);
        }
      }

      const success = await saveProfile({ avatar_url: null });

      if (success) {
        // Update local state
        setProfile({ ...profile, avatar_url: "" });

        toast({
          title: "Success",
          description: "Profile picture removed",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Error",
        description: "Failed to remove profile picture",
        variant: "destructive",
      });
    }
  };

  const autoSaveProfile = useCallback(async (updates: Partial<typeof profile>) => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (debounced)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const profileUpdates: any = {};
        if (updates.username !== undefined) profileUpdates.username = updates.username;
        if (updates.full_name !== undefined) profileUpdates.full_name = updates.full_name;
        if (updates.location !== undefined) profileUpdates.location = updates.location;

        if (Object.keys(profileUpdates).length > 0) {
          await saveProfile(profileUpdates);
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 1000); // Auto-save after 1 second of inactivity
  }, [saveProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update email if changed
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email,
        });
        if (emailError) throw emailError;
      }

      // Update profile data with retry
      const success = await saveProfile({
        username: profile.username,
        full_name: profile.full_name,
        location: profile.location,
      });

      if (success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        toast({
          title: "Partial success",
          description: "Profile saved locally, will sync when connection improves",
        });
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword,
      });

      if (error) throw error;

      setPasswords({ newPassword: "", confirmPassword: "" });

      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Password change failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>

          {/* Avatar Section */}
          <Card className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-4 border-primary/20 transition-all group-hover:border-primary/40">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-primary" />
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-all shadow-lg hover:scale-110"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Click camera icon to upload or change photo
                  </p>
                  {profile.avatar_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                    >
                      Remove Photo
                    </Button>
                  )}
                </div>
              </div>
          </Card>

          {/* Profile Information */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Profile Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setProfile({ ...profile, username: newValue });
                      autoSaveProfile({ username: newValue });
                    }}
                    className="pl-10"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setProfile({ ...profile, full_name: newValue });
                    autoSaveProfile({ full_name: newValue });
                  }}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="pl-10"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setProfile({ ...profile, location: newValue });
                    autoSaveProfile({ location: newValue });
                  }}
                  placeholder="Enter location"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, newPassword: e.target.value })
                    }
                    className="pl-10"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="pl-10"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
