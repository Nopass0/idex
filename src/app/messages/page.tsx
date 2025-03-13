"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { useAuth } from "@/providers/auth-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareIcon } from "lucide-react";

export default function MessagesPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Проверка аутентификации при загрузке страницы
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Отображение загрузки
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-lg">Загрузка...</p>
      </div>
    );
  }

  // Ранний возврат вместо редиректа для избежания циклической зависимости
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquareIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Сообщения</h1>
        </div>
        
        <Card className="w-full shadow-md">
          <CardHeader>
            <h3 className="text-xl font-semibold">Входящие сообщения</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-center text-default-500 py-10">
              У вас нет новых сообщений
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
