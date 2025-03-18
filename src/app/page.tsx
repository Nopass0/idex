"use client";

import { Button } from "@heroui/button";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useAuth } from "@/providers/auth-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Перенаправляем авторизованных пользователей на страницу профиля
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/profile");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-lg">Загрузка...</p>
      </div>
    );
  }

  // Если пользователь авторизован, ничего не отображаем - произойдет редирект
  if (isAuthenticated) {
    return null;
  }

  // Отображение для неавторизованных пользователей
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <div className="max-w-3xl text-center space-y-6 animate-fadeIn">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl animate-scaleIn">
          CHA<span className="text-[#006039]">$</span>E
        </h1>
        <p className="text-xl text-default-500 max-w-2xl mx-auto animate-fadeInDelay">
          Передовая P2P платформа для обработки и управления финансовыми транзакциями.
          Безопасные и быстрые переводы без посредников.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fadeInUp">
          <div className="transform transition-transform hover:scale-105 active:scale-95">
            <Button 
              as={Link} 
              href="/register" 
              color="primary" 
              size="lg"
              className="font-medium"
            >
              Регистрация
            </Button>
          </div>
          <div className="transform transition-transform hover:scale-105 active:scale-95">
            <Button 
              as={Link} 
              href="/login" 
              variant="bordered" 
              size="lg"
              className="font-medium"
            >
              Вход
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
