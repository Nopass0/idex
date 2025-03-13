"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { UserRole } from "@prisma/client";
import { useTheme } from "@/providers/theme-provider";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { 
  SunIcon, 
  MoonIcon, 
  UserIcon, 
  DollarSignIcon, 
  RussianRubleIcon,
  LayoutDashboardIcon, 
  HandshakeIcon,
  ShieldAlertIcon,
  CreditCardIcon,
  SmartphoneIcon,
  MessageSquareIcon,
  BanknoteIcon,
  ShieldIcon,
  UserCheckIcon
} from "lucide-react";

export function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Список пунктов меню для авторизованных пользователей
  const menuItems = [
    { href: "/dashboard", icon: <LayoutDashboardIcon className="h-4 w-4" />, label: "Дашборд" },
    { href: "/deals", icon: <HandshakeIcon className="h-4 w-4" />, label: "Сделки" },
    { href: "/disputes", icon: <ShieldAlertIcon className="h-4 w-4" />, label: "Споры" },
    { href: "/requisites", icon: <CreditCardIcon className="h-4 w-4" />, label: "Реквизиты" },
    { href: "/devices", icon: <SmartphoneIcon className="h-4 w-4" />, label: "Устройства" },
    { href: "/messages", icon: <MessageSquareIcon className="h-4 w-4" />, label: "Сообщения" },
    { href: "/withdrawals", icon: <BanknoteIcon className="h-4 w-4" />, label: "Выплаты" },
  ];

  return (
    <Navbar maxWidth="xl" className="relative">
      <NavbarBrand>
        <Link href="/" className="font-bold text-xl text-inherit">
          IDE<span className="text-primary">X</span>
        </Link>
      </NavbarBrand>
      
      {isAuthenticated && (
        <NavbarContent className="hidden md:flex gap-4" justify="center">
          {menuItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link 
                href={item.href} 
                className="text-foreground flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                {item.icon}
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
      )}
      
      <NavbarContent justify="end">
        <NavbarItem className="flex gap-2">
          <Button 
            isIconOnly 
            variant="light" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Переключить тему"
          >
            {theme === "dark" ? 
              <SunIcon className="h-5 w-5" /> : 
              <MoonIcon className="h-5 w-5" />
            }
          </Button>
          
          {isAuthenticated ? (
            <Dropdown>
              <DropdownTrigger>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-default-500">ID: {user?.id}</span>
                  </div>
                  <Avatar
                    as="button"
                    showFallback
                    name={user?.name?.charAt(0) || "П"}
                    className="cursor-pointer"
                    size="sm"
                  />
                </div>
              </DropdownTrigger>
              <DropdownMenu aria-label="Меню пользователя" className="min-w-[240px]">
                <DropdownItem key="user-info" isReadOnly textValue="user-info" className="cursor-default opacity-100">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-default-500">ID: {user?.id}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-default-500">USDT:</span>
                        <span className="text-xs font-medium flex items-center gap-1">
                          <DollarSignIcon className="h-3 w-3 text-success" />
                          {user?.balanceUSDT?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-default-500">RUB:</span>
                        <span className="text-xs font-medium flex items-center gap-1">
                          <RussianRubleIcon className="h-3 w-3 text-primary" />
                          {user?.balanceRUB?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownItem>
                <Divider />
                
                {/* Мобильное меню отображается только на маленьких экранах */}
                <div className="md:hidden">
                  {menuItems.map((item) => (
                    <DropdownItem key={item.href} textValue={item.href}>
                      <Link href={item.href} className="w-full flex items-center gap-2">
                        {item.icon}
                        {item.label}
                      </Link>
                    </DropdownItem>
                  ))}
                  <Divider />
                </div>
                
                <DropdownItem key="profile" textValue="profile">
                  <Link href="/profile" className="w-full flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Профиль
                  </Link>
                </DropdownItem>
                {user?.role === UserRole.ADMIN ? (
                  <>
                    <DropdownItem key="admin" textValue="admin">
                      <Link href="/admin" className="w-full flex items-center gap-2">
                        <ShieldIcon className="h-4 w-4" />
                        Панель администратора
                      </Link>
                    </DropdownItem>
                    <DropdownItem key="admin-users" textValue="admin-users">
                      <Link href="/admin/users" className="w-full flex items-center gap-2">
                        <UserCheckIcon className="h-4 w-4" />
                        Управление пользователями
                      </Link>
                    </DropdownItem>
                  </>
                ) : null}
                <DropdownItem 
                  key="logout" 
                  textValue="logout"
                  onClick={() => logout()}
                  color="danger"
                >
                  Выйти
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Button as={Link} href="/login" color="primary">
              Войти
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
