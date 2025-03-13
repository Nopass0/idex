"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import Link from "next/link";
import { 
  ShieldIcon,
  UserCheckIcon,
  KeyIcon,
  SettingsIcon,
  LayoutDashboardIcon
} from "lucide-react";

export default function AdminPage() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();

  // Отображение загрузки
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-lg">Загрузка панели управления...</p>
      </div>
    );
  }

  // Перенаправление неадминов
  if (!isAdmin && !isLoading) {
    redirect("/");
  }

  const adminSections = [
    {
      title: "Управление пользователями",
      description: "Просмотр, редактирование и блокировка пользователей",
      href: "/admin/users",
      icon: <UserCheckIcon className="h-6 w-6" />,
      color: "primary"
    },
    {
      title: "Ключи активации",
      description: "Создание и управление ключами активации",
      href: "/admin/keys",
      icon: <KeyIcon className="h-6 w-6" />,
      color: "success"
    },
    {
      title: "Настройки системы",
      description: "Управление глобальными настройками платформы",
      href: "/admin/settings",
      icon: <SettingsIcon className="h-6 w-6" />,
      color: "warning"
    }
  ];

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2">
          <ShieldIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Панель администратора</h1>
        </div>
        <p className="text-default-500">Управление платформой и пользователями</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-md">
          <CardHeader className="flex flex-col gap-1 pb-2">
            <h2 className="text-lg font-bold">Общая статистика</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-default-50 rounded-lg">
                <span className="text-default-500 text-sm">Пользователей</span>
                <span className="text-2xl font-bold">0</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-default-50 rounded-lg">
                <span className="text-default-500 text-sm">Активных</span>
                <span className="text-2xl font-bold">0</span>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="flex flex-col gap-1 pb-2">
            <h2 className="text-lg font-bold">Транзакции</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-default-50 rounded-lg">
                <span className="text-default-500 text-sm">Всего</span>
                <span className="text-2xl font-bold">0</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-default-50 rounded-lg">
                <span className="text-default-500 text-sm">Объем (₽)</span>
                <span className="text-2xl font-bold">0</span>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="flex flex-col gap-1 pb-2">
            <h2 className="text-lg font-bold">Споры</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-default-50 rounded-lg">
                <span className="text-default-500 text-sm">Активных</span>
                <span className="text-2xl font-bold">0</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-default-50 rounded-lg">
                <span className="text-default-500 text-sm">Решено</span>
                <span className="text-2xl font-bold">0</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Разделы админки</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Card key={section.href} className="shadow-md">
            <CardBody className="p-6">
              <div className="flex flex-col gap-4">
                <div className={`text-${section.color} mb-2`}>
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                  <p className="text-default-500 mb-4">{section.description}</p>
                </div>
                <Button 
                  as={Link} 
                  href={section.href} 
                  color={section.color as any}
                  startContent={<LayoutDashboardIcon className="h-4 w-4" />}
                >
                  Открыть раздел
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
