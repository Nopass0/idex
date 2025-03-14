"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Input } from "@heroui/input";
import { Tabs, Tab } from "@heroui/tabs";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Chip } from "@heroui/chip";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Progress } from "@heroui/progress";
import { Avatar } from "@heroui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { 
  ShieldAlertIcon, 
  SearchIcon, 
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownIcon,
  FileIcon,
  PlusIcon,
  SmartphoneIcon,
  CreditCardIcon,
  UserIcon,
  SignalIcon,
  HandshakeIcon
} from "lucide-react";
import { format, subDays } from "date-fns";
import { ru } from "date-fns/locale";

// Функция форматирования даты "Вчера, 18:14" или "Сегодня, 14:22"
const formatDate = (date) => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  
  if (date.getDate() === today.getDate() && 
      date.getMonth() === today.getMonth() && 
      date.getFullYear() === today.getFullYear()) {
    return `Сегодня, ${format(date, "HH:mm")}`;
  } else if (date.getDate() === yesterday.getDate() && 
            date.getMonth() === yesterday.getMonth() && 
            date.getFullYear() === yesterday.getFullYear()) {
    return `Вчера, ${format(date, "HH:mm")}`;
  } else {
    return format(date, "dd.MM.yyyy, HH:mm");
  }
};

// Моковые данные для споров
const mockDisputes = [
  {
    id: 1001,
    status: "Принят",
    createdAt: new Date(2025, 2, 13, 18, 14), // Вчера, 18:14
    dealId: 64156439,
    originalAmount: 5500,
    newAmount: 5003,
    currencySymbol: "₽",
    difference: -497,
    acceptedAt: new Date(2025, 2, 13, 18, 14),
    sender: {
      id: 840,
      name: "andreqpolyakov7485",
      confirmedAt: new Date(2025, 2, 13, 18, 14)
    },
    recipient: {
      id: 1122,
      name: "Garry 1",
      confirmedAt: new Date(2025, 2, 13, 18, 14)
    },
    deal: {
      id: 64156439,
      status: "Завершенная сделка 🤌",
      completedAt: new Date(2025, 2, 13, 18, 6),
      amountUSDT: 55.29,
      amountRUB: 5003.00
    },
    device: {
      name: "Тулашев Илхомджон",
      status: "Не активно",
      lastActive: new Date(2025, 2, 14, 14, 22),
      requisitesCount: 2,
      state: "Онлайн",
      batteryPercentage: 40,
      connectionSpeed: -1
    },
    requisite: {
      name: "Реквизит 2202 2083 1909 5734",
      bank: "Sberbank"
    },
    user: {
      name: "Тулашев Илхомджон",
      shortName: "сб",
      fullName: "Тулашев Илхомджон",
      status: "Не активно",
      limit: "24 606 ₽ / ∞ ₽",
      successRate: 100,
      successDeals: 6,
      totalDeals: 6
    }
  },
  {
    id: 1002,
    status: "Отклонен",
    createdAt: new Date(2025, 2, 12, 11, 22), // 2 дня назад
    dealId: 64156440,
    originalAmount: 12000,
    newAmount: 11500,
    currencySymbol: "₽",
    difference: -500,
    acceptedAt: null,
    sender: {
      id: 753,
      name: "ivanov_85",
      confirmedAt: new Date(2025, 2, 12, 11, 22)
    },
    recipient: {
      id: 981,
      name: "TrustedSeller",
      confirmedAt: new Date(2025, 2, 12, 12, 15)
    },
    deal: {
      id: 64156440,
      status: "Отмененная сделка",
      completedAt: new Date(2025, 2, 12, 11, 0),
      amountUSDT: 127.20,
      amountRUB: 11500.00
    },
    device: {
      name: "Samsung Galaxy S22",
      status: "Активно",
      lastActive: new Date(2025, 2, 14, 10, 30),
      requisitesCount: 3,
      state: "Онлайн",
      batteryPercentage: 85,
      connectionSpeed: 15
    },
    requisite: {
      name: "Реквизит 4276 1234 5678 9101",
      bank: "Tinkoff"
    },
    user: {
      name: "Иванов Иван",
      shortName: "ии",
      fullName: "Иванов Иван Иванович",
      status: "Активно",
      limit: "50 000 ₽ / 150 000 ₽",
      successRate: 95,
      successDeals: 19,
      totalDeals: 20
    }
  },
  {
    id: 1003,
    status: "Принят",
    createdAt: new Date(2025, 2, 13, 9, 45), // Вчера, 9:45
    dealId: 64156457,
    originalAmount: 7800,
    newAmount: 7500,
    currencySymbol: "₽",
    difference: -300,
    acceptedAt: new Date(2025, 2, 13, 10, 15),
    sender: {
      id: 625,
      name: "cryptotrader_pro",
      confirmedAt: new Date(2025, 2, 13, 9, 45)
    },
    recipient: {
      id: 1021,
      name: "fast_exchanger",
      confirmedAt: new Date(2025, 2, 13, 10, 0)
    },
    deal: {
      id: 64156457,
      status: "Завершенная сделка 👍",
      completedAt: new Date(2025, 2, 13, 9, 30),
      amountUSDT: 83.10,
      amountRUB: 7500.00
    },
    device: {
      name: "iPhone 13 Pro",
      status: "Активно",
      lastActive: new Date(2025, 2, 14, 9, 15),
      requisitesCount: 1,
      state: "Онлайн",
      batteryPercentage: 92,
      connectionSpeed: 25
    },
    requisite: {
      name: "Реквизит 5536 9101 2345 6789",
      bank: "Альфа-Банк"
    },
    user: {
      name: "Петров Сергей",
      shortName: "пс",
      fullName: "Петров Сергей Александрович",
      status: "Активно",
      limit: "30 000 ₽ / 100 000 ₽",
      successRate: 98,
      successDeals: 49,
      totalDeals: 50
    }
  },
  {
    id: 1004,
    status: "Принят",
    createdAt: new Date(2025, 2, 11, 15, 30), // 3 дня назад
    dealId: 64156470,
    originalAmount: 25000,
    newAmount: 24000,
    currencySymbol: "₽",
    difference: -1000,
    acceptedAt: new Date(2025, 2, 11, 16, 20),
    sender: {
      id: 512,
      name: "trading_master",
      confirmedAt: new Date(2025, 2, 11, 15, 30)
    },
    recipient: {
      id: 815,
      name: "safe_deals",
      confirmedAt: new Date(2025, 2, 11, 16, 0)
    },
    deal: {
      id: 64156470,
      status: "Завершенная сделка",
      completedAt: new Date(2025, 2, 11, 15, 0),
      amountUSDT: 266.67,
      amountRUB: 24000.00
    },
    device: {
      name: "Google Pixel 6",
      status: "Активно",
      lastActive: new Date(2025, 2, 14, 11, 45),
      requisitesCount: 2,
      state: "Онлайн",
      batteryPercentage: 65,
      connectionSpeed: 10
    },
    requisite: {
      name: "Реквизит 2202 0000 1111 2222",
      bank: "ВТБ"
    },
    user: {
      name: "Смирнова Анна",
      shortName: "са",
      fullName: "Смирнова Анна Владимировна",
      status: "Активно",
      limit: "100 000 ₽ / 300 000 ₽",
      successRate: 90,
      successDeals: 18,
      totalDeals: 20
    }
  },
  {
    id: 1005,
    status: "Отклонен",
    createdAt: new Date(2025, 2, 14, 8, 15), // Сегодня, 8:15
    dealId: 64156485,
    originalAmount: 18500,
    newAmount: 17800,
    currencySymbol: "₽",
    difference: -700,
    acceptedAt: null,
    sender: {
      id: 732,
      name: "crypto_whale",
      confirmedAt: new Date(2025, 2, 14, 8, 15)
    },
    recipient: {
      id: 1203,
      name: "honest_buyer",
      confirmedAt: new Date(2025, 2, 14, 8, 45)
    },
    deal: {
      id: 64156485,
      status: "Отмененная сделка",
      completedAt: new Date(2025, 2, 14, 8, 0),
      amountUSDT: 197.78,
      amountRUB: 17800.00
    },
    device: {
      name: "OnePlus 9 Pro",
      status: "Не активно",
      lastActive: new Date(2025, 2, 14, 13, 30),
      requisitesCount: 1,
      state: "Офлайн",
      batteryPercentage: 20,
      connectionSpeed: 0
    },
    requisite: {
      name: "Реквизит 4405 6666 7777 8888",
      bank: "Газпромбанк"
    },
    user: {
      name: "Козлов Дмитрий",
      shortName: "кд",
      fullName: "Козлов Дмитрий Петрович",
      status: "Не активно",
      limit: "35 000 ₽ / 120 000 ₽",
      successRate: 85,
      successDeals: 17,
      totalDeals: 20
    }
  }
];

// Компонент для страницы споров
export default function DisputesPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Состояния для управления табами и фильтрами
  const [currentTab, setCurrentTab] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Проверка аутентификации при загрузке страницы
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Фильтрация споров по поиску и табу
  const filteredDisputes = mockDisputes.filter(dispute => {
    // Поиск по всем полям
    const matchesSearch = searchQuery === "" || 
      Object.values(dispute).some(value => {
        if (typeof value === 'object' && value !== null) {
          // Для вложенных объектов
          if (value instanceof Date) {
            return formatDate(value).toLowerCase().includes(searchQuery.toLowerCase());
          }
          return Object.values(value).some(v => 
            String(v).toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    
    // Фильтрация по табам
    let matchesTab = true;
    switch (currentTab) {
      case "active":
        matchesTab = !dispute.acceptedAt && dispute.status !== "Отклонен";
        break;
      case "accepted":
        matchesTab = dispute.status === "Принят";
        break;
      case "statement":
        // Здесь может быть логика для выписки
        matchesTab = true;
        break;
      default:
        matchesTab = true;
    }
    
    return matchesSearch && matchesTab;
  });

  // Пагинация
  const paginatedDisputes = filteredDisputes.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Функция для открытия модального окна с деталями спора
  const handleOpenDisputeDetails = (dispute) => {
    setSelectedDispute(dispute);
    setIsModalOpen(true);
  };

  // Функция для рендеринга статусного чипа
  const renderStatusChip = (status) => {
    let color = status === "Принят" ? "success" : "danger";
    let icon = status === "Принят" ? <CheckCircleIcon size={14} /> : <XCircleIcon size={14} />;
    
    return (
      <Chip 
        color={color} 
        size="sm" 
        variant="flat"
        startContent={icon}
      >
        {status}
      </Chip>
    );
  };

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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-2">
          <ShieldAlertIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Споры</h1>
        </div>
        
        <Card className="w-full shadow-md">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Tabs 
                selectedKey={currentTab} 
                onSelectionChange={setCurrentTab}
                color="primary"
                variant="underlined"
                classNames={{
                  tabList: "gap-6",
                }}
              >
                <Tab 
                  key="all" 
                  title={
                    <div className="flex items-center gap-2">
                      <span>Все</span>
                      <Badge color="primary" variant="flat">{mockDisputes.length}</Badge>
                    </div>
                  }
                />
                <Tab 
                  key="active" 
                  title={
                    <div className="flex items-center gap-2">
                      <span>Активные</span>
                      <Badge color="warning" variant="flat">
                        {mockDisputes.filter(d => !d.acceptedAt && d.status !== "Отклонен").length}
                      </Badge>
                    </div>
                  }
                />
                <Tab 
                  key="accepted" 
                  title={
                    <div className="flex items-center gap-2">
                      <span>Принятые</span>
                      <Badge color="success" variant="flat">
                        {mockDisputes.filter(d => d.status === "Принят").length}
                      </Badge>
                    </div>
                  }
                />
                <Tab 
                  key="statement" 
                  title={
                    <div className="flex items-center gap-2">
                      <span>Выписка</span>
                    </div>
                  }
                />
              </Tabs>
              
              <div className="w-full md:w-1/3">
                <Input
                  placeholder="Поиск по всем полям..."
                  startContent={<SearchIcon className="text-default-400" size={18} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          
          <Divider />
          
          <CardBody>
            {filteredDisputes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table
                  aria-label="Таблица споров"
                  bottomContent={
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={Math.ceil(filteredDisputes.length / rowsPerPage)}
                        onChange={(page) => setPage(page)}
                      />
                    </div>
                  }
                  classNames={{
                    wrapper: "min-h-[400px]",
                  }}
                  selectionMode="single"
                  onRowAction={key => {
                    const dispute = filteredDisputes.find(d => d.id === Number(key));
                    handleOpenDisputeDetails(dispute);
                  }}
                >
                  <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>Статус</TableColumn>
                    <TableColumn>Дата и время</TableColumn>
                    <TableColumn>ID сделки</TableColumn>
                    <TableColumn>Сумма</TableColumn>
                  </TableHeader>
                  <TableBody 
                    items={paginatedDisputes}
                    emptyContent={"Нет данных для отображения"}
                  >
                    {(dispute) => (
                      <TableRow key={dispute.id} className="cursor-pointer">
                        <TableCell>{dispute.id}</TableCell>
                        <TableCell>{renderStatusChip(dispute.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CalendarIcon size={14} />
                            {formatDate(dispute.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <HandshakeIcon size={14} />
                            {dispute.dealId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="line-through text-default-500">
                                {dispute.originalAmount} {dispute.currencySymbol}
                              </span>
                              <ArrowDownIcon size={12} className="text-default-500" />
                              <span className="font-semibold">
                                {dispute.newAmount} {dispute.currencySymbol}
                              </span>
                            </div>
                            <div className="text-xs text-danger">
                              {dispute.difference > 0 ? '+' : ''}{dispute.difference} {dispute.currencySymbol}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-default-500 py-10">
                Нет споров, соответствующих указанным критериям
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Модальное окно с деталями спора */}
      {selectedDispute && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          size="3xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ShieldAlertIcon className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">
                  Спор {selectedDispute.status.toLowerCase()}
                </h3>
              </div>
              <p className="text-sm text-default-500">
                Дата создания спора: {formatDate(selectedDispute.createdAt)}
              </p>
            </ModalHeader>
            <Divider />
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Левая колонка - информация о споре */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-default-500">ID сделки:</p>
                    <div className="flex items-center gap-2">
                      <HandshakeIcon size={18} className="text-primary" />
                      <span className="font-medium">{selectedDispute.dealId}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="line-through text-default-500">
                        {selectedDispute.originalAmount} {selectedDispute.currencySymbol}
                      </span>
                      <span className="font-semibold text-xl">
                        {selectedDispute.newAmount} {selectedDispute.currencySymbol}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {selectedDispute.sender.id} / {selectedDispute.sender.name}
                      </span>
                    </div>
                  </div>
                  
                  <Card className="bg-default-50">
                    <CardBody>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar
                              size="sm"
                              name={selectedDispute.sender.name}
                              showFallback
                            />
                            <span>{selectedDispute.sender.name}</span>
                          </div>
                          <Chip color="success" size="sm" variant="flat">
                            Подтвердил спор
                          </Chip>
                        </div>
                        <div className="text-xs text-default-500">
                          {formatDate(selectedDispute.sender.confirmedAt)}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                  
                  <Card className="bg-default-50">
                    <CardBody>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar
                              size="sm"
                              name={selectedDispute.recipient.name}
                              showFallback
                            />
                            <span>{selectedDispute.recipient.id} / {selectedDispute.recipient.name}</span>
                          </div>
                        </div>
                        <div className="text-xs text-default-500">
                          {formatDate(selectedDispute.recipient.confirmedAt)}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                  
                  <div>
                    <h4 className="font-medium mb-3">Информация о споре</h4>
                    <div className="flex flex-col gap-3">
                      <Button
                        startContent={<FileIcon size={18} />}
                        variant="flat"
                        color="primary"
                        fullWidth
                      >
                        Добавить новый файл
                      </Button>
                      
                      {selectedDispute.acceptedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Дата принятия</span>
                          <span>{formatDate(selectedDispute.acceptedAt)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Сделка ID</span>
                        <span>{selectedDispute.dealId}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Сделка</span>
                        <span>{selectedDispute.deal.status}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm"></span>
                        <span>{formatDate(selectedDispute.deal.completedAt)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Сумма</span>
                        <div className="flex flex-col items-end">
                          <span>{selectedDispute.deal.amountUSDT} USDT</span>
                          <span>{selectedDispute.deal.amountRUB} ₽</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Правая колонка - информация о пользователе и устройстве */}
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Устройство</h4>
                    <Card>
                      <CardBody className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Тулашев Илхомджон</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Реквизит</span>
                          <span>{selectedDispute.requisite.name}</span>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Пользователь</h4>
                    <Card>
                      <CardBody className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <Avatar
                            size="sm"
                            name={selectedDispute.user.shortName}
                            showFallback
                          />
                          <span>{selectedDispute.user.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Статус</span>
                          <Chip 
                            color={selectedDispute.user.status === "Активно" ? "success" : "default"} 
                            size="sm" 
                            variant="flat"
                          >
                            {selectedDispute.user.status}
                          </Chip>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Лимит</span>
                          <span>{selectedDispute.user.limit}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Успешные сделки</span>
                          <div className="flex items-center gap-2">
                            <span>{selectedDispute.user.successRate}%</span>
                            <span className="text-xs">
                              {selectedDispute.user.successDeals}/{selectedDispute.user.totalDeals}
                            </span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Устройство</h4>
                    <Card>
                      <CardBody className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Устройство</span>
                          <span>{selectedDispute.device.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Статус</span>
                          <Chip 
                            color={selectedDispute.device.status === "Активно" ? "success" : "default"} 
                            size="sm" 
                            variant="flat"
                          >
                            {selectedDispute.device.status}
                          </Chip>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Последняя активность</span>
                          <span>
                            {selectedDispute.device.status === "Не активно" ? "Остановлено: " : ""}
                            {formatDate(selectedDispute.device.lastActive)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Реквизиты</span>
                          <Badge color="primary" variant="flat">{selectedDispute.device.requisitesCount}</Badge>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Состояние</span>
                            <div className="flex items-center gap-2">
                              <Chip 
                                color={selectedDispute.device.state === "Онлайн" ? "success" : "danger"} 
                                size="sm" 
                                variant="dot"
                              >
                                {selectedDispute.device.state}
                              </Chip>
                              <span className="text-sm">{selectedDispute.device.batteryPercentage}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <SignalIcon size={14} className={selectedDispute.device.connectionSpeed > 0 ? "text-success" : "text-danger"} />
                            <span className="text-xs">
                              {selectedDispute.device.connectionSpeed > 0 ? selectedDispute.device.connectionSpeed : "-"} MBit/s
                            </span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                color="primary" 
                variant="light" 
                onPress={() => setIsModalOpen(false)}
              >
                Закрыть
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}