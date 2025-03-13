"use client";

import { useEffect, Suspense } from "react";
import { useAuth } from "@/providers/auth-provider";
import { AuthTabs } from "@/components/auth/auth-tabs";
import { useRouter, useSearchParams } from "next/navigation";

// Компонент для получения параметров запроса
function LoginWithParams() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/profile";

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(from);
    }
  }, [isAuthenticated, isLoading, router, from]);

  return <AuthTabs defaultTab="login" />;
}

// Основной компонент страницы
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <LoginWithParams />
    </Suspense>
  );
}