"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace(`/profile/${user.uid}`);
    } else {
      router.replace("/auth/login");
    }
  }, [user, router]);

  return (
    <div className="container py-16 text-center text-xs text-slate-500">
      Loading profile...
    </div>
  );
}
