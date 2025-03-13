"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { AuthTabs } from "@/components/auth/auth-tabs";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/profile";

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(from);
    }
  }, [isAuthenticated, isLoading, router, from]);

  // Явно указываем defaultTab="login" для открытия на вкладке входа
  return <AuthTabs defaultTab="login" />;
}
