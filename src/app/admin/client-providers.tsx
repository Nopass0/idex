"use client";

import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  ShieldIcon,
  UserCheckIcon,
  KeyIcon,
  SettingsIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
  MenuIcon,
  XIcon
} from "lucide-react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Card } from "@heroui/card";
import { Tooltip } from "@heroui/tooltip";
import { Switch } from "@heroui/switch";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
}

const SidebarItem = ({ href, icon, title, isActive }: SidebarItemProps) => {
  return (
    <Link href={href} className="w-full">
      <Button
        variant={isActive ? "solid" : "light"}
        color={isActive ? "primary" : "default"}
        className={`w-full justify-start mb-1 ${isActive ? "font-medium" : ""}`}
        startContent={icon}
      >
        {title}
      </Button>
    </Link>
  );
};

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Закрываем мобильное меню при изменении пути
    setIsMobileSidebarOpen(false);
  }, [pathname]);

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

  const adminRoutes = [
    {
      href: "/admin",
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
      title: "Обзор"
    },
    {
      href: "/admin/users",
      icon: <UserCheckIcon className="h-5 w-5" />,
      title: "Пользователи"
    },
    {
      href: "/admin/keys",
      icon: <KeyIcon className="h-5 w-5" />,
      title: "Ключи активации"
    },
    {
      href: "/admin/settings",
      icon: <SettingsIcon className="h-5 w-5" />,
      title: "Настройки"
    },
  ];

  return (
    <>
      {/* Мобильная навигация */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-background shadow-sm">
        <div className="flex items-center">
          <ShieldIcon className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-xl font-bold">Панель администратора</h1>
        </div>
        <Button
          isIconOnly
          variant="light"
          aria-label="Меню"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          {isMobileSidebarOpen ? <XIcon /> : <MenuIcon />}
        </Button>
      </div>

      <div className="flex min-h-screen pt-[60px] lg:pt-0">
        {/* Мобильное боковое меню */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-10 lg:hidden"
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileSidebarOpen(false)} />
              <div className="absolute inset-y-0 left-0 w-64 max-w-[80vw] bg-background shadow-xl">
                <div className="p-4 space-y-4">
                  <div className="flex items-center mb-6">
                    <ShieldIcon className="h-6 w-6 text-primary mr-2" />
                    <h2 className="text-xl font-bold">Панель администратора</h2>
                  </div>
                  
                  <div className="space-y-1">
                    {adminRoutes.map((route) => (
                      <SidebarItem
                        key={route.href}
                        href={route.href}
                        icon={route.icon}
                        title={route.title}
                        isActive={
                          route.href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(route.href)
                        }
                      />
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm">Тёмная тема</span>
                      <Switch
                        isSelected={theme === "dark"}
                        onChange={() => setTheme(theme === "light" ? "dark" : "light")}
                        size="sm"
                        color="primary"
                        endContent={theme === "dark" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
                      />
                    </div>
                    
                    <div className="text-xs text-default-500">
                      Вы вошли как: <span className="font-medium">{user?.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Десктопное боковое меню */}
        <aside className="hidden lg:block w-64 min-h-screen border-r p-4 sticky top-0">
          <div className="flex items-center mb-6">
            <ShieldIcon className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-bold">Панель администратора</h2>
          </div>
          
          <div className="space-y-1 mb-8">
            {adminRoutes.map((route) => (
              <SidebarItem
                key={route.href}
                href={route.href}
                icon={route.icon}
                title={route.title}
                isActive={
                  route.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(route.href)
                }
              />
            ))}
          </div>
          
          <div className="mt-auto pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm">Тёмная тема</span>
              <Switch
                isSelected={theme === "dark"}
                onChange={() => setTheme(theme === "light" ? "dark" : "light")}
                size="sm"
                color="primary"
                endContent={theme === "dark" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
              />
            </div>
            
            <div className="text-xs text-default-500 mb-2">
              Вы вошли как: <span className="font-medium">{user?.name}</span>
            </div>
            
            <Link href="/">
              <Button
                variant="light" 
                color="danger"
                startContent={<LogOutIcon className="h-4 w-4" />}
                className="w-full justify-start mt-2"
              >
                Выйти из админ-панели
              </Button>
            </Link>
          </div>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 p-4 lg:p-8">
          <Card className="w-full shadow-sm">
            {children}
          </Card>
        </main>
      </div>
    </>
  );
}
