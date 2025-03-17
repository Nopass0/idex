"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";
import { 
  SaveIcon,
  InfoIcon,
  WalletIcon,
  PercentIcon,
  ShieldIcon,
  ServerIcon,
  DatabaseIcon,
  AlertTriangleIcon,
  CheckCircleIcon
} from "lucide-react";
import { api } from "@/trpc/react";

// Анимации
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function SettingsManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState("general");
  
  // Состояния для настроек
  const [systemWalletAddress, setSystemWalletAddress] = useState("");
  const [commissionRate, setCommissionRate] = useState(9.0);
  const [siteTitle, setSiteTitle] = useState("IDEX - Обмен валюты");
  const [siteDescription, setSiteDescription] = useState("Быстрый и надежный обмен валюты USDT на рубли и обратно");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Запрос для получения текущих настроек
  const { data: systemSettings, refetch: refetchSettings } = api.user.getSystemSettings.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  });
  
  // Загрузка настроек при получении данных
  useEffect(() => {
    if (systemSettings) {
      setSystemWalletAddress(systemSettings.systemWalletAddress || "");
      setCommissionRate(systemSettings.commissionRate || 9.0);
      // Другие системные настройки можно добавить здесь
    }
  }, [systemSettings]);
  
  // Мутация для обновления настроек
  const updateSettingsMutation = api.user.updateSystemSettings.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      alert("Настройки успешно сохранены");
      // Обновляем данные после успешного сохранения
      refetchSettings();
    },
    onError: (error) => {
      setIsSaving(false);
      alert(`Ошибка сохранения: ${error.message || "Не удалось сохранить настройки"}`);
    }
  });
  
  // Сохранение настроек
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Проверка валидности данных
    if (!systemWalletAddress) {
      setIsSaving(false);
      alert("Ошибка: Адрес системного кошелька не может быть пустым");
      return;
    }
    
    if (commissionRate < 0 || commissionRate > 100) {
      setIsSaving(false);
      alert("Ошибка: Комиссия должна быть от 0 до 100%");
      return;
    }
    
    // Отправляем запрос на обновление
    updateSettingsMutation.mutate({
      systemWalletAddress,
      commissionRate
    });
  };
  
  // Отображение загрузки
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-lg">Загрузка настроек системы...</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.3 }}
      className="container mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Боковое меню настроек */}
        <motion.div 
          variants={fadeIn}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 order-2 lg:order-1"
        >
          <Card className="shadow-md">
            <CardHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">Разделы настроек</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-2">
              <Button 
                onClick={() => setSelectedTab("general")} 
                color={selectedTab === "general" ? "primary" : "default"}
                variant={selectedTab === "general" ? "solid" : "light"}
                fullWidth
                className="justify-start"
                startContent={<ServerIcon className="h-4 w-4" />}
              >
                Основные настройки
              </Button>
              
              <Button 
                onClick={() => setSelectedTab("payment")} 
                color={selectedTab === "payment" ? "primary" : "default"}
                variant={selectedTab === "payment" ? "solid" : "light"}
                fullWidth
                className="justify-start"
                startContent={<WalletIcon className="h-4 w-4" />}
              >
                Настройки платежей
              </Button>
              
              <Button 
                onClick={() => setSelectedTab("seo")} 
                color={selectedTab === "seo" ? "primary" : "default"}
                variant={selectedTab === "seo" ? "solid" : "light"}
                fullWidth
                className="justify-start"
                startContent={<DatabaseIcon className="h-4 w-4" />}
              >
                SEO и метаданные
              </Button>
              
              <Button 
                onClick={() => setSelectedTab("maintenance")} 
                color={selectedTab === "maintenance" ? "primary" : "default"}
                variant={selectedTab === "maintenance" ? "solid" : "light"}
                fullWidth
                className="justify-start"
                startContent={<AlertTriangleIcon className="h-4 w-4" />}
              >
                Техобслуживание
              </Button>
            </CardBody>
          </Card>
        </motion.div>
        
        {/* Основной контент настроек */}
        <motion.div 
          variants={fadeIn}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 order-1 lg:order-2"
        >
          <Card className="shadow-md">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {selectedTab === "general" && "Основные настройки"}
                {selectedTab === "payment" && "Настройки платежей"}
                {selectedTab === "seo" && "SEO и метаданные"}
                {selectedTab === "maintenance" && "Техническое обслуживание"}
              </h2>
              
              <Button
                onClick={handleSaveSettings}
                isDisabled={isSaving}
                isLoading={isSaving}
                color="primary"
                startContent={<SaveIcon className="h-4 w-4" />}
              >
                Сохранить
              </Button>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-6">
              {/* Основные настройки */}
              {selectedTab === "general" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Информация о системе</h3>
                    <p className="text-default-500 text-sm mb-4">
                      Основные параметры системы и конфигурации
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Версия системы</p>
                        <Chip color="primary" variant="flat">v1.0.0</Chip>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Статус системы</p>
                        <Chip color="success" variant="flat" startContent={<CheckCircleIcon className="h-3 w-3" />}>
                          Активна
                        </Chip>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Настройки платежей */}
              {selectedTab === "payment" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Настройки кошелька</h3>
                    <p className="text-default-500 text-sm mb-4">
                      Адрес кошелька системы для приема платежей
                    </p>
                    
                    <Input
                      label="Адрес системного кошелька"
                      placeholder="Введите адрес кошелька"
                      value={systemWalletAddress}
                      onChange={(e) => setSystemWalletAddress(e.target.value)}
                      startContent={<WalletIcon className="h-4 w-4 text-default-500" />}
                      description="Адрес кошелька TRC20 для получения платежей в USDT"
                      className="mb-4"
                    />
                    
                    <h3 className="text-lg font-semibold mb-2">Комиссия системы</h3>
                    <p className="text-default-500 text-sm mb-4">
                      Настройки комиссии за операции в системе
                    </p>
                    
                    <Input
                      label="Процент комиссии"
                      placeholder="Введите процент комиссии"
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={commissionRate.toString()}
                      onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                      startContent={<PercentIcon className="h-4 w-4 text-default-500" />}
                      description="Комиссия за операции обмена валюты (в процентах)"
                    />
                  </div>
                </div>
              )}
              
              {/* SEO настройки */}
              {selectedTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Метаданные сайта</h3>
                    <p className="text-default-500 text-sm mb-4">
                      Настройки SEO и метаданных для улучшения поисковой оптимизации
                    </p>
                    
                    <Input
                      label="Заголовок сайта"
                      placeholder="Введите заголовок сайта"
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      className="mb-4"
                    />
                    
                    <Input
                      label="Описание сайта"
                      placeholder="Введите описание сайта"
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      description="Краткое описание сайта для поисковых систем"
                    />
                  </div>
                </div>
              )}
              
              {/* Настройки обслуживания */}
              {selectedTab === "maintenance" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Режим обслуживания</h3>
                    <p className="text-default-500 text-sm mb-4">
                      Управление режимом технического обслуживания сайта
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <Chip 
                        color={maintenanceMode ? "danger" : "success"} 
                        variant="flat"
                      >
                        {maintenanceMode ? "Включен" : "Выключен"}
                      </Chip>
                      
                      <Button
                        color={maintenanceMode ? "success" : "danger"}
                        variant="flat"
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                      >
                        {maintenanceMode ? "Отключить" : "Включить"} режим обслуживания
                      </Button>
                    </div>
                    
                    <p className="text-warning text-sm mt-4">
                      <InfoIcon className="h-4 w-4 inline mr-1" />
                      Включение режима обслуживания ограничит доступ к сайту для обычных пользователей.
                      Администраторы сохранят доступ к системе.
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
            <Divider />
            <CardFooter>
              <div className="flex justify-end w-full">
                <Button
                  onClick={handleSaveSettings}
                  isDisabled={isSaving}
                  isLoading={isSaving}
                  color="primary"
                  startContent={<SaveIcon className="h-4 w-4" />}
                >
                  Сохранить изменения
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
