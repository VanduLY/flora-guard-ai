import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  saveProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error);
        return;
      }

      if (data) {
        setProfile(data);
        // Also cache in localStorage for immediate access
        localStorage.setItem("userProfile", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const refreshProfile = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await loadProfile(currentUser);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    if (profile) {
      const updated = { ...profile, ...updates };
      localStorage.setItem("userProfile", JSON.stringify(updated));
    }
  };

  const saveProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return false;

        // Update database
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("user_id", currentUser.id);

        if (error) throw error;

        // Update local state and cache on success
        const updated = profile ? { ...profile, ...updates } : null;
        setProfile(updated);
        if (updated) {
          localStorage.setItem("userProfile", JSON.stringify(updated));
        }

        return true;
      } catch (error) {
        attempt++;
        console.error(`Save attempt ${attempt} failed:`, error);
        if (attempt >= maxRetries) {
          // Still update local state as fallback
          updateProfile(updates);
          return false;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return false;
  };

  useEffect(() => {
    // Load cached profile immediately for fast initial render
    const cached = localStorage.getItem("userProfile");
    if (cached) {
      try {
        setProfile(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached profile");
      }
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user);
      }
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls to prevent deadlock
          setTimeout(() => {
            loadProfile(session.user);
          }, 0);
        } else {
          setProfile(null);
          localStorage.removeItem("userProfile");
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, loading, refreshProfile, updateProfile, saveProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
