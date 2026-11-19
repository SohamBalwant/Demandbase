"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserLocation } from "@/types";
import { DEMO_USERS } from "@/lib/demo-data";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, locationAddress: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = "demandbase_current_user";
const SESSION_STORAGE_USER_KEY = "demandbase_session_user";
const LOCAL_STORAGE_ALL_USERS_KEY = "demandbase_all_users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(LOCAL_STORAGE_ALL_USERS_KEY);
      if (!storedUsers) {
        localStorage.setItem(LOCAL_STORAGE_ALL_USERS_KEY, JSON.stringify(DEMO_USERS));
      }

      // Check tab-isolated sessionStorage first so different tabs can be different users!
      const activeUserId =
        sessionStorage.getItem(SESSION_STORAGE_USER_KEY) ||
        localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      const allUsers: UserProfile[] = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;

      if (activeUserId) {
        const found = allUsers.find((u) => u.uid === activeUserId);
        setUser(found || allUsers[0]);
        sessionStorage.setItem(SESSION_STORAGE_USER_KEY, (found || allUsers[0]).uid);
      } else {
        // Default to Soham Balwant for immediate live demo readiness
        setUser(allUsers[0]);
        sessionStorage.setItem(SESSION_STORAGE_USER_KEY, allUsers[0].uid);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, allUsers[0].uid);
      }
    } catch (e) {
      console.error("Error loading auth state:", e);
      setUser(DEMO_USERS[0]);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ALL_USERS_KEY);
      const users: UserProfile[] = stored ? JSON.parse(stored) : DEMO_USERS;
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (found) {
        setUser(found);
        sessionStorage.setItem(SESSION_STORAGE_USER_KEY, found.uid);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, found.uid);
        return true;
      }

      // If user doesn't exist, create a new profile automatically for easy demoing
      const name = email.split("@")[0].replace(".", " ");
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      const newUser: UserProfile = {
        uid: `user-${Date.now()}`,
        email,
        displayName: formattedName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        bio: "Campus Member & Resource Sharer",
        location: {
          lat: 19.0760,
          lng: 72.8777,
          address: "Campus Central, Student Residences",
          geohash: "te7u7",
        },
        stats: {
          itemsListed: 0,
          itemsLent: 0,
          itemsBorrowed: 0,
          totalTransactions: 0,
          totalRatingSum: 0,
          totalReviews: 0,
          avgRating: 5.0,
        },
        groups: ["group-1"],
        role: "user",
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem(LOCAL_STORAGE_ALL_USERS_KEY, JSON.stringify(updatedUsers));
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, newUser.uid);
      setUser(newUser);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    _password: string,
    locationAddress: string
  ): Promise<boolean> => {
    const newUser: UserProfile = {
      uid: `user-${Date.now()}`,
      email,
      displayName: name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      bio: "Active campus borrower & lender.",
      location: {
        lat: 19.0760,
        lng: 72.8777,
        address: locationAddress || "Campus Central, North Wing",
        geohash: "te7u7",
      },
      stats: {
        itemsListed: 0,
        itemsLent: 0,
        itemsBorrowed: 0,
        totalTransactions: 0,
        totalRatingSum: 0,
        totalReviews: 0,
        avgRating: 5.0,
      },
      groups: ["group-1"],
      role: "user",
      createdAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem(LOCAL_STORAGE_ALL_USERS_KEY);
    const users: UserProfile[] = stored ? JSON.parse(stored) : DEMO_USERS;
    const updatedUsers = [newUser, ...users];
    localStorage.setItem(LOCAL_STORAGE_ALL_USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, newUser.uid);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const switchUser = (userId: string) => {
    const stored = localStorage.getItem(LOCAL_STORAGE_ALL_USERS_KEY);
    const users: UserProfile[] = stored ? JSON.parse(stored) : DEMO_USERS;
    const found = users.find((u) => u.uid === userId);
    if (found) {
      setUser(found);
      // Scoped to THIS tab only so other tabs keep their own user!
      sessionStorage.setItem(SESSION_STORAGE_USER_KEY, found.uid);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updated };
    setUser(updatedUser);

    const stored = localStorage.getItem(LOCAL_STORAGE_ALL_USERS_KEY);
    const users: UserProfile[] = stored ? JSON.parse(stored) : DEMO_USERS;
    const updatedUsers = users.map((u) => (u.uid === user.uid ? updatedUser : u));
    localStorage.setItem(LOCAL_STORAGE_ALL_USERS_KEY, JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
