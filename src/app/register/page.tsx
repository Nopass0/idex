"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { AuthTabs } from "@/components/auth/auth-tabs";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/profile");
    }
  }, [isAuthenticated, isLoading, router]);

  // Явно указываем defaultTab="register" для открытия на вкладке регистрации
  return <AuthTabs defaultTab="register" />;
}
