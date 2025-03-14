"use client";

import { Button } from "@heroui/button"; 
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { useAuth } from "@/providers/auth-provider";
import { ActivateForm } from "@/components/auth/activate-form";
import { UserRole } from "@prisma/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LogOutIcon, 
  ShieldIcon, 
  UserIcon, 
  UserCircleIcon,
  CalendarIcon,
  DollarSignIcon,
  RussianRubleIcon
} from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, isGuest } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Проверка аутентификации при загрузке страницы
  useEffect(() => {
    // Только после завершения начальной загрузки делаем редирект
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Обработка выхода из системы
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Редирект произойдет автоматически в auth-provider
    } catch (error) {
      console.error("Ошибка выхода:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Отображение загрузки
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-lg">Загрузка профиля...</p>
      </div>
    );
  }

  // Ранний возврат вместо редиректа для избежания циклической зависимости
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  // Отображение роли пользователя
  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return { label: "Администратор", color: "danger" as const, icon: <ShieldIcon className="h-4 w-4" /> };
      case UserRole.USER:
        return { label: "Активный пользователь", color: "success" as const, icon: <UserIcon className="h-4 w-4" /> };
      case UserRole.GUEST:
        return { label: "Гость (Не активирован)", color: "warning" as const, icon: <UserIcon className="h-4 w-4" /> };
      default:
        return { label: role as string, color: "default" as const, icon: <UserIcon className="h-4 w-4" /> };
    }
  };

  const roleInfo = user?.role ? getRoleDisplay(user.role) : { label: "Неизвестно", color: "default" as const, icon: <UserIcon className="h-4 w-4" /> };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold text-center mb-4">Личный кабинет</h1>
        
        {/* Основной профиль */}
        <Card className="w-full shadow-md">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="h-20 w-20 bg-default-100 rounded-full flex items-center justify-center">
              <UserCircleIcon size={60} className="text-default-500" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <div className="flex items-center mt-1">
                <Chip color={roleInfo.color} variant="flat" size="sm" startContent={roleInfo.icon}>
                  {roleInfo.label}
                </Chip>
                <span className="ml-2 text-small text-default-500">ID: {user?.id}</span>
              </div>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Общая информация */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Информация</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-default-500">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-default-500">Дата регистрации:</span>
                    <span className="font-medium flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-default-400" />
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Неизвестно"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Финансовая информация */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Баланс</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-default-500">USDT:</span>
                    <span className="font-medium flex items-center">
                      <DollarSignIcon className="h-4 w-4 mr-1 text-success" />
                      {user?.balanceUSDT !== undefined ? user.balanceUSDT.toFixed(2) : "0.00"} USDT
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-default-500">RUB:</span>
                    <span className="font-medium flex items-center">
                      <RussianRubleIcon className="h-4 w-4 mr-1 text-primary" />
                      {user?.balanceRUB !== undefined ? user.balanceRUB.toFixed(2) : "0.00"} ₽
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-end">
            <Button 
              color="danger" 
              variant="light" 
              startContent={<LogOutIcon size={16} />}
              onClick={handleLogout}
              isLoading={isLoggingOut}
              isDisabled={isLoggingOut}
            >
              {isLoggingOut ? "Выход из аккаунта..." : "Выйти из аккаунта"}
            </Button>
          </CardFooter>
        </Card>

        {/* Форма активации для гостей */}
        {isGuest && (

              <ActivateForm />

        )}
        
        {/* Дополнительные блоки для активного пользователя */}
        {!isGuest && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Последние сделки */}
            <Card className="w-full shadow-md">
              <CardHeader>
                <h3 className="text-xl font-bold">Последние сделки</h3>
              </CardHeader>
              <Divider />
              <CardBody>
                <p className="text-center text-default-500 py-4">У вас пока нет сделок</p>
              </CardBody>
            </Card>
            
            {/* Сообщения */}
            <Card className="w-full shadow-md">
              <CardHeader>
                <h3 className="text-xl font-bold">Новые сообщения</h3>
              </CardHeader>
              <Divider />
              <CardBody>
                <p className="text-center text-default-500 py-4">У вас нет новых сообщений</p>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
