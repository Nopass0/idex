"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { useAuth } from "@/providers/auth-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboardIcon } from "lucide-react";

export default function DashboardPage() {
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
          <LayoutDashboardIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Дашборд</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="w-full shadow-md">
            <CardHeader className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Активные сделки</h3>
              <span className="text-2xl font-bold text-primary">0</span>
            </CardHeader>
            <Divider />
            <CardBody>
              <p className="text-center text-default-500 py-4">
                У вас пока нет активных сделок
              </p>
            </CardBody>
          </Card>
          
          <Card className="w-full shadow-md">
            <CardHeader className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Споры</h3>
              <span className="text-2xl font-bold text-warning">0</span>
            </CardHeader>
            <Divider />
            <CardBody>
              <p className="text-center text-default-500 py-4">
                У вас нет открытых споров
              </p>
            </CardBody>
          </Card>
          
          <Card className="w-full shadow-md">
            <CardHeader className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Сообщения</h3>
              <span className="text-2xl font-bold text-success">0</span>
            </CardHeader>
            <Divider />
            <CardBody>
              <p className="text-center text-default-500 py-4">
                У вас нет новых сообщений
              </p>
            </CardBody>
          </Card>
        </div>
        
        <Card className="w-full shadow-md">
          <CardHeader>
            <h3 className="text-xl font-semibold">Статистика аккаунта</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-default-50 rounded-lg">
                <p className="text-default-500">Завершенные сделки</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-default-50 rounded-lg">
                <p className="text-default-500">Объем сделок</p>
                <p className="text-2xl font-bold">0 ₽</p>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-default-50 rounded-lg">
                <p className="text-default-500">Рейтинг</p>
                <p className="text-2xl font-bold">0.0</p>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-default-50 rounded-lg">
                <p className="text-default-500">Дней в системе</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
