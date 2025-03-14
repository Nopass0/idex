"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { useAuth } from "@/providers/auth-provider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BatteryIcon, PlusIcon, SearchIcon, SignalIcon, SmartphoneIcon, TabletIcon, WifiIcon } from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Tabs, Tab } from "@heroui/tabs";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Pagination } from "@heroui/pagination";
import { Badge } from "@heroui/badge";

export default function DevicesPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Интерфейсы для типизации данных
  interface Device {
    id: string;
    name: string;
    type: string;
    status: string;
    version: string;
    lastActive: string;
    requisites: string;
    batteryLevel: number;
    networkSpeed: string;
    isOnline: boolean;
  }

  interface ActivityHistory {
    id: number;
    deviceId: string;
    type: string;
    timestamp: string;
    details: string;
    ip: string;
    location: string;
  }

  // Mock data for devices
  const mockDevices: Device[] = [
    { id: "d1", name: "iPhone 14 Pro", type: "phone", status: "active", version: "1.2.3", lastActive: "2023-07-15T14:30:00", requisites: "Apple/iOS 16.5", batteryLevel: 85, networkSpeed: "4G", isOnline: true },
    { id: "d2", name: "Samsung Galaxy S23", type: "phone", status: "active", version: "1.2.1", lastActive: "2023-07-14T19:45:00", requisites: "Samsung/Android 13", batteryLevel: 67, networkSpeed: "5G", isOnline: true },
    { id: "d3", name: "iPad Pro", type: "tablet", status: "inactive", version: "1.1.5", lastActive: "2023-06-30T08:15:00", requisites: "Apple/iPadOS 16", batteryLevel: 25, networkSpeed: "WiFi", isOnline: false },
    { id: "d4", name: "OnePlus 10", type: "phone", status: "active", version: "1.2.3", lastActive: "2023-07-15T10:20:00", requisites: "OnePlus/Android 13", batteryLevel: 92, networkSpeed: "4G", isOnline: true },
    { id: "d5", name: "Xiaomi Mi 12", type: "phone", status: "inactive", version: "1.2.0", lastActive: "2023-07-01T16:40:00", requisites: "Xiaomi/MIUI 14", batteryLevel: 45, networkSpeed: "3G", isOnline: false },
    { id: "d6", name: "Google Pixel 7", type: "phone", status: "active", version: "1.2.3", lastActive: "2023-07-14T22:10:00", requisites: "Google/Android 13", batteryLevel: 78, networkSpeed: "5G", isOnline: true },
    { id: "d7", name: "Samsung Galaxy Tab S8", type: "tablet", status: "active", version: "1.2.2", lastActive: "2023-07-13T11:25:00", requisites: "Samsung/Android 13", batteryLevel: 63, networkSpeed: "WiFi", isOnline: true },
    { id: "d8", name: "iPhone 13 Mini", type: "phone", status: "inactive", version: "1.1.8", lastActive: "2023-06-28T09:50:00", requisites: "Apple/iOS 16.4", batteryLevel: 12, networkSpeed: "4G", isOnline: false },
    { id: "d9", name: "Huawei P50", type: "phone", status: "active", version: "1.2.1", lastActive: "2023-07-15T08:05:00", requisites: "Huawei/EMUI 12", batteryLevel: 55, networkSpeed: "4G", isOnline: true },
    { id: "d10", name: "Oppo Find X5", type: "phone", status: "inactive", version: "1.1.9", lastActive: "2023-07-05T17:30:00", requisites: "Oppo/ColorOS 12", batteryLevel: 8, networkSpeed: "WiFi", isOnline: false },
    { id: "d11", name: "Realme GT Neo 3", type: "phone", status: "active", version: "1.2.3", lastActive: "2023-07-14T15:45:00", requisites: "Realme/Android 12", batteryLevel: 72, networkSpeed: "5G", isOnline: true },
    { id: "d12", name: "Motorola Edge 30", type: "phone", status: "active", version: "1.2.2", lastActive: "2023-07-13T20:15:00", requisites: "Motorola/Android 12", batteryLevel: 81, networkSpeed: "4G", isOnline: true },
    { id: "d13", name: "Sony Xperia 1 IV", type: "phone", status: "inactive", version: "1.2.0", lastActive: "2023-07-08T12:40:00", requisites: "Sony/Android 12", batteryLevel: 29, networkSpeed: "3G", isOnline: false },
    { id: "d14", name: "iPad Air", type: "tablet", status: "active", version: "1.2.1", lastActive: "2023-07-14T11:10:00", requisites: "Apple/iPadOS 16", batteryLevel: 65, networkSpeed: "WiFi", isOnline: true },
    { id: "d15", name: "Vivo X80", type: "phone", status: "inactive", version: "1.1.7", lastActive: "2023-06-25T14:20:00", requisites: "Vivo/Funtouch OS 12", batteryLevel: 18, networkSpeed: "4G", isOnline: false },
    { id: "d16", name: "Asus ROG Phone 6", type: "phone", status: "active", version: "1.2.3", lastActive: "2023-07-15T09:30:00", requisites: "Asus/Android 12", batteryLevel: 88, networkSpeed: "5G", isOnline: true },
    { id: "d17", name: "Samsung Galaxy Z Fold 4", type: "phone", status: "active", version: "1.2.2", lastActive: "2023-07-14T16:55:00", requisites: "Samsung/Android 13", batteryLevel: 76, networkSpeed: "5G", isOnline: true },
    { id: "d18", name: "Nokia X30", type: "phone", status: "inactive", version: "1.1.9", lastActive: "2023-07-03T10:15:00", requisites: "Nokia/Android 12", batteryLevel: 31, networkSpeed: "4G", isOnline: false },
    { id: "d19", name: "Honor 70", type: "phone", status: "active", version: "1.2.1", lastActive: "2023-07-13T18:40:00", requisites: "Honor/Magic UI 6", batteryLevel: 59, networkSpeed: "5G", isOnline: true },
    { id: "d20", name: "Samsung Galaxy Tab A8", type: "tablet", status: "inactive", version: "1.1.8", lastActive: "2023-06-29T13:25:00", requisites: "Samsung/Android 12", batteryLevel: 22, networkSpeed: "WiFi", isOnline: false },
  ];

  // Mock data for activity history
  const mockActivityHistory: ActivityHistory[] = [
    { id: 1, deviceId: "d1", type: "login", timestamp: "2023-07-15T14:30:00", details: "Вход выполнен успешно", ip: "192.168.1.100", location: "Москва, Россия" },
    { id: 2, deviceId: "d1", type: "update", timestamp: "2023-07-15T13:45:00", details: "Обновление до версии 1.2.3", ip: "192.168.1.100", location: "Москва, Россия" },
    { id: 3, deviceId: "d1", type: "sync", timestamp: "2023-07-15T12:30:00", details: "Синхронизация данных", ip: "192.168.1.100", location: "Москва, Россия" },
    { id: 4, deviceId: "d1", type: "login", timestamp: "2023-07-14T10:15:00", details: "Вход выполнен успешно", ip: "192.168.1.100", location: "Москва, Россия" },
    { id: 5, deviceId: "d2", type: "login", timestamp: "2023-07-14T19:45:00", details: "Вход выполнен успешно", ip: "172.16.0.15", location: "Санкт-Петербург, Россия" },
    { id: 6, deviceId: "d2", type: "update", timestamp: "2023-07-14T18:30:00", details: "Обновление до версии 1.2.1", ip: "172.16.0.15", location: "Санкт-Петербург, Россия" },
    { id: 7, deviceId: "d2", type: "error", timestamp: "2023-07-14T15:20:00", details: "Ошибка соединения с сервером", ip: "172.16.0.15", location: "Санкт-Петербург, Россия" },
    { id: 8, deviceId: "d3", type: "login", timestamp: "2023-06-30T08:15:00", details: "Вход выполнен успешно", ip: "10.0.0.5", location: "Екатеринбург, Россия" },
    { id: 9, deviceId: "d3", type: "logout", timestamp: "2023-06-30T07:45:00", details: "Выход из системы", ip: "10.0.0.5", location: "Екатеринбург, Россия" },
    { id: 10, deviceId: "d4", type: "login", timestamp: "2023-07-15T10:20:00", details: "Вход выполнен успешно", ip: "192.168.0.10", location: "Новосибирск, Россия" },
  ];

  // Filter devices based on active tab and search query
  const filteredDevices = mockDevices.filter(device => {
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "active" && device.isOnline) || 
      (activeTab === "inactive" && !device.isOnline);
    
    const searchableTerms = [
      device.id,
      device.name,
      device.type,
      device.version,
      device.requisites,
      device.networkSpeed,
      device.batteryLevel.toString(),
      device.status
    ].map(term => term.toLowerCase());
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" || 
      searchableTerms.some(term => term.includes(searchLower));
    
    return matchesTab && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const currentDevices = filteredDevices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const handleAddDevice = () => {
    // Here you would typically add the device to your database
    setIsModalOpen(false);
    setDeviceName("");
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return "success";
    if (level > 20) return "warning";
    return "danger";
  };

  const handleViewDetails = (device: Device) => {
    setSelectedDevice(device);
    setIsDetailsModalOpen(true);
  };

  const getActivityForDevice = (deviceId: string) => {
    return mockActivityHistory.filter(activity => activity.deviceId === deviceId);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return <SignalIcon className="h-4 w-4 text-success" />;
      case "logout":
        return <SignalIcon className="h-4 w-4 text-default-400" />;
      case "update":
        return <PlusIcon className="h-4 w-4 text-primary" />;
      case "sync":
        return <WifiIcon className="h-4 w-4 text-primary" />;
      case "error":
        return <BatteryIcon className="h-4 w-4 text-danger" />;
      default:
        return <SmartphoneIcon className="h-4 w-4 text-default-500" />;
    }
  };

  const getStatusDisplay = (device: Device) => {
    const statusColor = device.status === "active" ? "primary" : "default";
    const onlineColor = device.isOnline ? "success" : "danger";
    const onlineText = device.isOnline ? "Онлайн" : "Оффлайн";
    
    return (
      <div className="flex flex-col gap-2">
        <div 
          className={`text-xs rounded-md w-auto inline-flex justify-center px-2 py-1 ${
            device.status === "active" 
              ? "bg-primary-100 text-primary-700" 
              : "bg-secondary-100 text-secondary-700"
          }`}
        >
          {device.status === "active" ? "Активный" : "Неактивный"}
        </div>
        <div 
          className={`text-xs rounded-md w-auto inline-flex justify-center px-2 py-1 ${
            device.isOnline 
              ? "bg-success-50 text-success-700" 
              : "bg-danger-50 text-danger-700"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <div className="relative h-2.5 w-2.5 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full ${
                device.isOnline ? "bg-success-500" : "bg-danger-500"
              }`}></div>
              {device.isOnline && (
                <>
                  <div className="absolute inset-0 rounded-full bg-success-400 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full bg-success-300 animate-pulse"></div>
                </>
              )}
            </div>
            <span className="font-medium">{onlineText}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <SmartphoneIcon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Устройства</h1>
          </div>
          <Button color="primary" startContent={<PlusIcon />} onClick={() => setIsModalOpen(true)}>
            Добавить устройство
          </Button>
        </div>
        
        <Card className="w-full shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <Tabs 
                selectedKey={activeTab} 
                // @ts-ignore
                onSelectionChange={setActiveTab} 
                color="primary" 
                variant="underlined"
                className="w-full sm:w-auto"
              >
                <Tab key="all" title="Все устройства" />
                <Tab key="active" title="Онлайн" />
                <Tab key="inactive" title="Оффлайн" />
              </Tabs>
              <Input
                placeholder="Поиск устройств..."
                startContent={<SearchIcon className="h-4 w-4 text-default-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            {currentDevices.length > 0 ? (
              <div className="space-y-4">
                {currentDevices.map((device) => (
                  <div key={device.id} className="p-4 bg-default-50 rounded-lg flex flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-3 md:w-1/6">
                      {device.type === "phone" ? 
                        <SmartphoneIcon className="h-10 w-10 text-primary" /> : 
                        <TabletIcon className="h-10 w-10 text-primary" />
                      }
                      <div>
                        <h4 className="font-semibold">{device.name}</h4>
                        <p className="text-xs text-default-500">ID: {device.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 md:w-1/6">
                      <span className="text-sm font-medium">Версия: {device.version}</span>
                      <span className="text-xs text-default-500">{device.requisites}</span>
                    </div>
                    <div className="flex flex-col gap-1 md:w-1/6">
                      <div className="flex items-center gap-2">
                        <BatteryIcon className={`h-4 w-4 text-${getBatteryColor(device.batteryLevel)}`} />
                        <div className="w-full bg-default-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-${getBatteryColor(device.batteryLevel)}`} 
                            style={{width: `${device.batteryLevel}%`}}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{device.batteryLevel}%</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {device.networkSpeed === "WiFi" ? (
                          <WifiIcon className="h-4 w-4 text-primary" />
                        ) : (
                          <SignalIcon className="h-4 w-4 text-primary" />
                        )}
                        <span className="text-xs">{device.networkSpeed}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 md:w-1/6">
                      <span className="text-xs text-default-500">
                        Последняя активность:<br />
                        {new Date(device.lastActive).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <div className="md:w-1/6 flex items-center">
                      {getStatusDisplay(device)}
                    </div>
                    <div className="md:w-1/6 flex justify-end items-center">
                      <Button color="primary" variant="light" size="sm" onClick={() => handleViewDetails(device)}>
                        Подробнее
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-default-500">Устройства не найдены</p>
              </div>
            )}
          </CardBody>
          <Divider />
          <div className="flex justify-center p-4">
            <Pagination 
              total={totalPages} 
              initialPage={currentPage}
              onChange={(page) => setCurrentPage(page)}
              color="primary"
            />
          </div>
        </Card>
      </div>

      {/* Модальное окно добавления устройства */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Добавить новое устройство</ModalHeader>
          <ModalBody>
            <Input 
              label="Название устройства" 
              placeholder="Введите название устройства"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" color="default" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button color="primary" onClick={handleAddDevice}>
              Добавить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно детальной информации */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)}
        size="3xl"
      >
        <ModalContent>
          {selectedDevice && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {selectedDevice.type === "phone" ? 
                    <SmartphoneIcon className="h-6 w-6 text-primary" /> : 
                    <TabletIcon className="h-6 w-6 text-primary" />
                  }
                  <span>{selectedDevice.name}</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Card>
                    <CardHeader>
                      <h4 className="text-lg font-semibold">Информация об устройстве</h4>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-default-500">ID:</span>
                          <span className="font-medium">{selectedDevice.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Тип:</span>
                          <span className="font-medium">{selectedDevice.type === "phone" ? "Смартфон" : "Планшет"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Версия:</span>
                          <span className="font-medium">{selectedDevice.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">ОС:</span>
                          <span className="font-medium">{selectedDevice.requisites}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Последняя активность:</span>
                          <span className="font-medium">{new Date(selectedDevice.lastActive).toLocaleString('ru-RU')}</span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardHeader>
                      <h4 className="text-lg font-semibold">Статус устройства</h4>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                      <div className="space-y-4">
                        <div>
                          <span className="text-default-500 block mb-1">Статус:</span>
                          <div className="flex gap-2">
                            <div 
                              className={`text-xs rounded-md px-3 py-1.5 font-medium ${
                                selectedDevice.status === "active" 
                                  ? "bg-primary-100 text-primary-700" 
                                  : "bg-default-100 text-default-700"
                              }`}
                            >
                              {selectedDevice.status === "active" ? "Активный" : "Неактивный"}
                            </div>
                            <div 
                              className={`text-xs rounded-md px-3 py-1.5 font-medium flex items-center gap-2 ${
                                selectedDevice.isOnline 
                                  ? "bg-success-100 text-success-700" 
                                  : "bg-danger-100 text-danger-700"
                              }`}
                            >
                              <div className={`h-2.5 w-2.5 rounded-full ${
                                selectedDevice.isOnline 
                                  ? "bg-success-500 animate-pulse" 
                                  : "bg-danger-500"
                              }`}></div>
                              <span>{selectedDevice.isOnline ? "Онлайн" : "Оффлайн"}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="text-default-500 block mb-1">Уровень заряда:</span>
                          <div className="flex items-center gap-2">
                            <BatteryIcon className={`h-5 w-5 text-${getBatteryColor(selectedDevice.batteryLevel)}`} />
                            <div className="w-full bg-default-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full bg-${getBatteryColor(selectedDevice.batteryLevel)}`} 
                                style={{width: `${selectedDevice.batteryLevel}%`}}
                              ></div>
                            </div>
                            <span className="font-medium">{selectedDevice.batteryLevel}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-default-500 block mb-1">Сетевое подключение:</span>
                          <div className="flex items-center gap-2">
                            {selectedDevice.networkSpeed === "WiFi" ? (
                              <WifiIcon className="h-5 w-5 text-primary" />
                            ) : (
                              <SignalIcon className="h-5 w-5 text-primary" />
                            )}
                            <span className="font-medium">{selectedDevice.networkSpeed}</span>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <h4 className="text-lg font-semibold">История активности</h4>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <div className="space-y-4">
                      {getActivityForDevice(selectedDevice.id).length > 0 ? (
                        getActivityForDevice(selectedDevice.id).map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 bg-default-50 rounded-lg">
                            <div className="mt-1">{getActivityIcon(activity.type)}</div>
                            <div className="flex-grow">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                <span className="font-medium">{activity.details}</span>
                                <span className="text-xs text-default-500">{new Date(activity.timestamp).toLocaleString('ru-RU')}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-4 mt-1 text-xs text-default-400">
                                <span>IP: {activity.ip}</span>
                                <span>Местоположение: {activity.location}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-default-500">История активности отсутствует</p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light">
                  Отключить устройство
                </Button>
                <Button color="primary" onClick={() => setIsDetailsModalOpen(false)}>
                  Закрыть
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
