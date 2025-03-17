"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { motion } from "framer-motion";
import { useTheme } from "@/providers/theme-provider";
import { api } from "@/trpc/react";
import { 
  LayoutDashboardIcon, 
  UsersIcon, 
  KeyIcon, 
  SettingsIcon,
  ArrowRightIcon,
  DollarSignIcon
} from "lucide-react";

// Компоненты для каждого раздела админки
import KeysManager from "./components/keys-manager";
import UsersManager from "./components/users-manager";
import SettingsManager from "./components/settings-manager";
import TransactionsManager from "./components/transactions-manager";
// Анимации
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AdminPage() {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<"dashboard" | "users" | "keys" | "settings" | "transactions">("dashboard");

  // Отображение главной панели администратора
  const renderDashboard = () => {
    return (
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.3 }}
        className="container mx-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card className="shadow-md cursor-pointer transition-transform hover:scale-[1.02]" 
                onClick={() => setActiveSection("users")}>
            <CardBody className="flex flex-col items-center justify-center gap-4 p-8">
              <div className="p-4 rounded-full bg-primary-100 dark:bg-primary-900">
                <UsersIcon className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">Пользователи</h3>
                <p className="text-default-500">Управление пользователями системы</p>
              </div>
              <Button 
                color="primary" 
                variant="flat" 
                endContent={<ArrowRightIcon className="h-4 w-4" />}
              >
                Перейти
              </Button>
            </CardBody>
          </Card>
          
          <Card className="shadow-md cursor-pointer transition-transform hover:scale-[1.02]" 
                onClick={() => setActiveSection("keys")}>
            <CardBody className="flex flex-col items-center justify-center gap-4 p-8">
              <div className="p-4 rounded-full bg-warning-100 dark:bg-warning-900">
                <KeyIcon className="h-8 w-8 text-warning" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">Ключи активации</h3>
                <p className="text-default-500">Создание и управление ключами</p>
              </div>
              <Button 
                color="warning" 
                variant="flat" 
                endContent={<ArrowRightIcon className="h-4 w-4" />}
              >
                Перейти
              </Button>
            </CardBody>
          </Card>
          
          <Card className="shadow-md cursor-pointer transition-transform hover:scale-[1.02]" 
                onClick={() => setActiveSection("transactions")}>
            <CardBody className="flex flex-col items-center justify-center gap-4 p-8">
              <div className="p-4 rounded-full bg-success-100 dark:bg-success-900">
                <DollarSignIcon className="h-8 w-8 text-success" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">Транзакции</h3>
                <p className="text-default-500">Управление транзакциями пользователей</p>
              </div>
              <Button 
                color="success" 
                variant="flat" 
                endContent={<ArrowRightIcon className="h-4 w-4" />}
              >
                Перейти
              </Button>
            </CardBody>
          </Card>
          
          <Card className="shadow-md cursor-pointer transition-transform hover:scale-[1.02]" 
                onClick={() => setActiveSection("settings")}>
            <CardBody className="flex flex-col items-center justify-center gap-4 p-8">
              <div className="p-4 rounded-full bg-success-100 dark:bg-success-900">
                <SettingsIcon className="h-8 w-8 text-success" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">Настройки системы</h3>
                <p className="text-default-500">Управление настройками сайта</p>
              </div>
              <Button 
                color="success" 
                variant="flat" 
                endContent={<ArrowRightIcon className="h-4 w-4" />}
              >
                Перейти
              </Button>
            </CardBody>
          </Card>
        </div>
        
        <Card className="shadow-md mb-6">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Статистика системы</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="text-center py-4">
              <p className="text-default-500">Здесь будет отображаться основная статистика системы</p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  };

  // Отрисовка нужной секции на основе активного раздела
  const renderSection = () => {
    switch (activeSection) {
      case "users":
        return <UsersManager />;
      case "keys":
        return <KeysManager />;
      case "settings":
        return <SettingsManager />;
      case "transactions":
        return <TransactionsManager />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
      <motion.div 
        variants={fadeIn} 
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-2 mb-8"
      >
        <div className="flex items-center gap-2">
          <LayoutDashboardIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Панель администратора</h1>
        </div>
        <p className="text-default-500">Управление системой и пользователями</p>
      </motion.div>
      
      {/* Навигация между разделами */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={activeSection === "dashboard" ? "solid" : "light"}
          color={activeSection === "dashboard" ? "primary" : "default"}
          onClick={() => setActiveSection("dashboard")}
          startContent={<LayoutDashboardIcon className="h-4 w-4" />}
        >
          Главная
        </Button>
        <Button
          variant={activeSection === "users" ? "solid" : "light"}
          color={activeSection === "users" ? "primary" : "default"}
          onClick={() => setActiveSection("users")}
          startContent={<UsersIcon className="h-4 w-4" />}
        >
          Пользователи
        </Button>
        <Button
          variant={activeSection === "keys" ? "solid" : "light"}
          color={activeSection === "keys" ? "primary" : "default"}
          onClick={() => setActiveSection("keys")}
          startContent={<KeyIcon className="h-4 w-4" />}
        >
          Ключи активации
        </Button>
        <Button
          variant={activeSection === "transactions" ? "solid" : "light"}
          color={activeSection === "transactions" ? "primary" : "default"}
          onClick={() => setActiveSection("transactions")}
          startContent={<DollarSignIcon className="h-4 w-4" />}
        >
          Транзакции
        </Button>
        <Button
          variant={activeSection === "settings" ? "solid" : "light"}
          color={activeSection === "settings" ? "primary" : "default"}
          onClick={() => setActiveSection("settings")}
          startContent={<SettingsIcon className="h-4 w-4" />}
        >
          Настройки
        </Button>
      </div>
      
      {/* Динамическое содержимое раздела */}
      {renderSection()}
    </div>
  );
}