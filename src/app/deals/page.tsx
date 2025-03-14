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
  HandshakeIcon, 
  SearchIcon,
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  DollarSignIcon,
  RussianRubleIcon,
  ArrowUpRightIcon,
  SmartphoneIcon,
  CreditCardIcon,
  UserIcon,
  SignalIcon,
  BatteryMediumIcon
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

// Моковые данные для сделок
const mockDeals = [
  {
    id: 64231811,
    status: "Завершенная сделка 🤖",
    date: new Date(2025, 2, 13, 22, 32), // Вчера, 22:32
    createdAt: new Date(2025, 2, 13, 22, 30), // Вчера, 22:30
    amountUSDT: 55.32,
    amountRUB: 5000.00,
    creditedUSDT: 51.44,
    creditedRUB: 4650.00,
    exchangeRate: 90.39, // 1 USDT = 90.39 ₽
    profit: 3.88, // USDT
    dealKey: "55.32 USDT / 5000 ₽",
    requisite: {
      number: "2202 2069 1208 7355",
      bank: "Sberbank"
    },
    user: {
      name: "Тотемиров Хусниддин",
      shortName: "сб",
      fullName: "Тоштемиров Хусниддин",
      status: "Не активно",
      limit: "68 003 ₽ / ∞ ₽",
      successRate: 69,
      successDeals: 11,
      totalDeals: 16
    },
    device: {
      name: "Тоштемиров Хусниддин",
      status: "Активно",
      lastActive: new Date(2025, 2, 14, 14, 55), // Сегодня, 14:55
      lastActiveType: "Запущено",
      requisitesCount: 2,
      state: "Онлайн",
      batteryPercentage: 27,
      connectionSpeed: -1
    }
  },
  {
    id: 64231708,
    status: "Сделка истекла",
    date: new Date(2025, 2, 13, 22, 41), // Вчера, 22:41
    createdAt: new Date(2025, 2, 13, 22, 30), // Вчера, 22:30
    amountUSDT: 33.19,
    amountRUB: 3000.00,
    creditedUSDT: 30.70,
    creditedRUB: 2775.00,
    exchangeRate: 90.39, // 1 USDT = 90.39 ₽
    profit: 0,
    dealKey: "33.19 USDT / 3000 ₽",
    requisite: {
      number: "2202 2083 6754 9012",
      bank: "Sberbank"
    },
    user: {
      name: "Сергеев Алексей",
      shortName: "са",
      fullName: "Сергеев Алексей Петрович",
      status: "Не активно",
      limit: "50 000 ₽ / 200 000 ₽",
      successRate: 85,
      successDeals: 17,
      totalDeals: 20
    },
    device: {
      name: "Сергеев Алексей",
      status: "Не активно",
      lastActive: new Date(2025, 2, 14, 10, 15), // Сегодня, 10:15
      lastActiveType: "Остановлено",
      requisitesCount: 3,
      state: "Офлайн",
      batteryPercentage: 45,
      connectionSpeed: 0
    }
  },
  {
    id: 64231651,
    status: "Завершенная сделка 🤖",
    date: new Date(2025, 2, 13, 22, 30), // Вчера, 22:30
    createdAt: new Date(2025, 2, 13, 22, 25), // Вчера, 22:25
    amountUSDT: 83.01,
    amountRUB: 7503.00,
    creditedUSDT: 77.20,
    creditedRUB: 6977.79,
    exchangeRate: 90.39, // 1 USDT = 90.39 ₽
    profit: 5.81, // USDT
    dealKey: "83.01 USDT / 7503 ₽",
    requisite: {
      number: "4276 5500 1234 5678",
      bank: "Тинькофф"
    },
    user: {
      name: "Иванов Петр",
      shortName: "ип",
      fullName: "Иванов Петр Сергеевич",
      status: "Активно",
      limit: "100 000 ₽ / 500 000 ₽",
      successRate: 95,
      successDeals: 38,
      totalDeals: 40
    },
    device: {
      name: "Иванов Петр",
      status: "Активно",
      lastActive: new Date(2025, 2, 14, 15, 30), // Сегодня, 15:30
      lastActiveType: "Запущено",
      requisitesCount: 4,
      state: "Онлайн",
      batteryPercentage: 78,
      connectionSpeed: 15
    }
  },
  {
    id: 64229432,
    status: "Завершенная сделка 🤖",
    date: new Date(2025, 2, 13, 22, 24), // Вчера, 22:24
    createdAt: new Date(2025, 2, 13, 22, 20), // Вчера, 22:20
    amountUSDT: 33.21,
    amountRUB: 3000.00,
    creditedUSDT: 30.72,
    creditedRUB: 2775.00,
    exchangeRate: 90.328, // 1 USDT = 90.328 ₽
    profit: 2.49, // USDT
    dealKey: "33.21 USDT / 3000 ₽",
    requisite: {
      number: "5536 9000 1234 5678",
      bank: "Альфа-Банк"
    },
    user: {
      name: "Смирнова Ольга",
      shortName: "со",
      fullName: "Смирнова Ольга Дмитриевна",
      status: "Активно",
      limit: "40 000 ₽ / 150 000 ₽",
      successRate: 92,
      successDeals: 23,
      totalDeals: 25
    },
    device: {
      name: "Смирнова Ольга",
      status: "Активно",
      lastActive: new Date(2025, 2, 14, 16, 10), // Сегодня, 16:10
      lastActiveType: "Запущено",
      requisitesCount: 2,
      state: "Онлайн",
      batteryPercentage: 65,
      connectionSpeed: 10
    }
  },
  {
    id: 64225233,
    status: "Сделка истекла",
    date: new Date(2025, 2, 13, 22, 23), // Вчера, 22:23
    createdAt: new Date(2025, 2, 13, 22, 15), // Вчера, 22:15
    amountUSDT: 44.32,
    amountRUB: 4004.00,
    creditedUSDT: 40.99,
    creditedRUB: 3703.70,
    exchangeRate: 90.352, // 1 USDT = 90.352 ₽
    profit: 0,
    dealKey: "44.32 USDT / 4004 ₽",
    requisite: {
      number: "2202 7001 5678 9012",
      bank: "ВТБ"
    },
    user: {
      name: "Козлов Михаил",
      shortName: "км",
      fullName: "Козлов Михаил Андреевич",
      status: "Не активно",
      limit: "60 000 ₽ / 250 000 ₽",
      successRate: 80,
      successDeals: 16,
      totalDeals: 20
    },
    device: {
      name: "Козлов Михаил",
      status: "Не активно",
      lastActive: new Date(2025, 2, 14, 12, 45), // Сегодня, 12:45
      lastActiveType: "Остановлено",
      requisitesCount: 1,
      state: "Офлайн",
      batteryPercentage: 30,
      connectionSpeed: 0
    }
  },
  {
    id: 64224520,
    status: "Завершенная сделка 🤖",
    date: new Date(2025, 2, 13, 22, 11), // Вчера, 22:11
    createdAt: new Date(2025, 2, 13, 22, 5), // Вчера, 22:05
    amountUSDT: 110.50,
    amountRUB: 10000.00,
    creditedUSDT: 102.76,
    creditedRUB: 9300.00,
    exchangeRate: 90.498, // 1 USDT = 90.498 ₽
    profit: 7.74, // USDT
    dealKey: "110.50 USDT / 10000 ₽",
    requisite: {
      number: "4276 1111 2222 3333",
      bank: "Тинькофф"
    },
    user: {
      name: "Николаев Андрей",
      shortName: "на",
      fullName: "Николаев Андрей Игоревич",
      status: "Активно",
      limit: "150 000 ₽ / 600 000 ₽",
      successRate: 98,
      successDeals: 49,
      totalDeals: 50
    },
    device: {
      name: "Николаев Андрей",
      status: "Активно",
      lastActive: new Date(2025, 2, 14, 17, 0), // Сегодня, 17:00
      lastActiveType: "Запущено",
      requisitesCount: 5,
      state: "Онлайн",
      batteryPercentage: 90,
      connectionSpeed: 25
    }
  },
  {
    id: 64210548,
    status: "Завершенная сделка 🤖",
    date: new Date(2025, 2, 13, 21, 27), // Вчера, 21:27
    createdAt: new Date(2025, 2, 13, 21, 20), // Вчера, 21:20
    amountUSDT: 55.07,
    amountRUB: 5000.00,
    creditedUSDT: 51.22,
    creditedRUB: 4650.00,
    exchangeRate: 90.79, // 1 USDT = 90.79 ₽
    profit: 3.85, // USDT
    dealKey: "55.07 USDT / 5000 ₽",
    requisite: {
      number: "5536 4444 5555 6666",
      bank: "Альфа-Банк"
    },
    user: {
      name: "Петрова Ирина",
      shortName: "пи",
      fullName: "Петрова Ирина Александровна",
      status: "Активно",
      limit: "80 000 ₽ / 300 000 ₽",
      successRate: 93,
      successDeals: 28,
      totalDeals: 30
    },
    device: {
      name: "Петрова Ирина",
      status: "Активно",
      lastActive: new Date(2025, 2, 14, 14, 15), // Сегодня, 14:15
      lastActiveType: "Запущено",
      requisitesCount: 3,
      state: "Онлайн",
      batteryPercentage: 55,
      connectionSpeed: 12
    }
  },
  {
    id: 64210301,
    status: "Завершенная сделка 🤖",
    date: new Date(2025, 2, 13, 21, 26), // Вчера, 21:26
    createdAt: new Date(2025, 2, 13, 21, 15), // Вчера, 21:15
    amountUSDT: 71.59,
    amountRUB: 6500.00,
    creditedUSDT: 66.58,
    creditedRUB: 6045.00,
    exchangeRate: 90.79, // 1 USDT = 90.79 ₽
    profit: 5.01, // USDT
    dealKey: "71.59 USDT / 6500 ₽",
    requisite: {
      number: "2202 8888 9999 0000",
      bank: "Сбербанк"
    },
    user: {
      name: "Сидоров Василий",
      shortName: "св",
      fullName: "Сидоров Василий Николаевич",
      status: "Активно",
      limit: "90 000 ₽ / 400 000 ₽",
      successRate: 96,
      successDeals: 24,
      totalDeals: 25
    },
    device: {
      name: "Сидоров Василий",
      status: "Активно",
      lastActive: new Date(2025, 2, 14, 15, 45), // Сегодня, 15:45
      lastActiveType: "Запущено",
      requisitesCount: 2,
      state: "Онлайн",
      batteryPercentage: 80,
      connectionSpeed: 18
    }
  },
  {
    id: 64209985,
    status: "Завершенная сделка 🤖",
    date: new Date(2025, 2, 13, 21, 25), // Вчера, 21:25
    createdAt: new Date(2025, 2, 13, 21, 15), // Вчера, 21:15
    amountUSDT: 55.07,
    amountRUB: 5000.00,
    creditedUSDT: 51.22,
    creditedRUB: 4650.00,
    exchangeRate: 90.79, // 1 USDT = 90.79 ₽
    profit: 3.85, // USDT
    dealKey: "55.07 USDT / 5000 ₽",
    requisite: {
      number: "4276 7777 8888 9999",
      bank: "Тинькофф"
    },
    user: {
      name: "Кузнецова Мария",
      shortName: "км",
      fullName: "Кузнецова Мария Владимировна",
      status: "Активно",
      limit: "70 000 ₽ / 350 000 ₽",
      successRate: 90,
      successDeals: 18,
      totalDeals: 20
    },
    device: {
      name: "Кузнецова Мария",
      status: "Активно",
      lastActive: new Date(2025, 2, 14, 16, 30), // Сегодня, 16:30
      lastActiveType: "Запущено",
      requisitesCount: 2,
      state: "Онлайн",
      batteryPercentage: 60,
      connectionSpeed: 8
    }
  },
  {
    id: 64205703,
    status: "Завершенная сделка 🤖",
    date: new Date(2025, 2, 13, 21, 6), // Вчера, 21:06
    createdAt: new Date(2025, 2, 13, 21, 0), // Вчера, 21:00
    amountUSDT: 55.35,
    amountRUB: 5014.00,
    creditedUSDT: 51.47,
    creditedRUB: 4663.02,
    exchangeRate: 90.592, // 1 USDT = 90.592 ₽
    profit: 3.88, // USDT
    dealKey: "55.35 USDT / 5014 ₽",
    requisite: {
      number: "2202 3333 4444 5555",
      bank: "Сбербанк"
    },
    user: {
      name: "Морозов Дмитрий",
      shortName: "мд",
      fullName: "Морозов Дмитрий Алексеевич",
      status: "Активно",
      limit: "85 000 ₽ / 350 000 ₽",
      successRate: 94,
      successDeals: 47,
      totalDeals: 50
    },
    device: {
      name: "Морозов Дмитрий",
      status: "Активно",
      lastActive: new Date(2025, 2, 14, 15, 0), // Сегодня, 15:00
      lastActiveType: "Запущено",
      requisitesCount: 3,
      state: "Онлайн",
      batteryPercentage: 70,
      connectionSpeed: 20
    }
  },
  {
    id: 64186516,
    status: "Сделка истекла",
    date: new Date(2025, 2, 13, 20, 10), // Вчера, 20:10
    createdAt: new Date(2025, 2, 13, 20, 0), // Вчера, 20:00
    amountUSDT: 110.60,
    amountRUB: 10000.00,
    creditedUSDT: 102.85,
    creditedRUB: 9300.00,
    exchangeRate: 90.42, // 1 USDT = 90.42 ₽
    profit: 0,
    dealKey: "110.60 USDT / 10000 ₽",
    requisite: {
      number: "5536 2222 3333 4444",
      bank: "Альфа-Банк"
    },
    user: {
      name: "Волков Сергей",
      shortName: "вс",
      fullName: "Волков Сергей Игоревич",
      status: "Не активно",
      limit: "120 000 ₽ / 500 000 ₽",
      successRate: 75,
      successDeals: 15,
      totalDeals: 20
    },
    device: {
      name: "Волков Сергей",
      status: "Не активно",
      lastActive: new Date(2025, 2, 14, 11, 30), // Сегодня, 11:30
      lastActiveType: "Остановлено",
      requisitesCount: 2,
      state: "Офлайн",
      batteryPercentage: 25,
      connectionSpeed: 0
    }
  }
];

// Компонент для страницы сделок
export default function DealsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Состояния для управления табами и фильтрами
  const [currentTab, setCurrentTab] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Проверка аутентификации при загрузке страницы
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Фильтрация сделок по поиску и табу
  const filteredDeals = mockDeals.filter(deal => {
    // Поиск по всем полям
    const matchesSearch = searchQuery === "" || 
      Object.values(deal).some(value => {
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
        matchesTab = deal.status.includes("Активн");
        break;
      case "successful":
        matchesTab = deal.status.includes("Завершенная");
        break;
      case "expired":
        matchesTab = deal.status.includes("истекла");
        break;
      case "duplicates":
        matchesTab = deal.status.includes("Дубликат");
        break;
      case "error":
        matchesTab = deal.status.includes("Ошибка");
        break;
      default:
        matchesTab = true;
    }
    
    return matchesSearch && matchesTab;
  });

  // Пагинация
  const paginatedDeals = filteredDeals.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Функция для открытия модального окна с деталями сделки
  const handleOpenDealDetails = (deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  // Функция для рендеринга статусного чипа
  const renderStatusChip = (status) => {
    let color = "default";
    
    if (status.includes("Завершенная")) {
      color = "success";
    } else if (status.includes("истекла")) {
      color = "warning";
    } else if (status.includes("Ошибка")) {
      color = "danger";
    } else if (status.includes("Дубликат")) {
      color = "secondary";
    } else if (status.includes("Активн")) {
      color = "primary";
    }
    
    return <Chip color={color} size="sm" variant="flat">{status}</Chip>;
  };

  // Функция для экспорта данных
  const handleExport = () => {
    // В реальном приложении здесь будет логика экспорта данных
    alert("Экспорт данных...");
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandshakeIcon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Сделки</h1>
          </div>
          <Button 
            color="primary" 
            variant="flat" 
            startContent={<DownloadIcon size={18} />}
            onPress={handleExport}
          >
            Экспорт
          </Button>
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
                  tabList: "gap-4 overflow-x-auto",
                }}
              >
                <Tab 
                  key="all" 
                  title={
                    <div className="flex items-center gap-2">
                      <span>Все</span>
                      <Badge color="primary" variant="flat">{mockDeals.length}</Badge>
                    </div>
                  }
                />
                <Tab 
                  key="active" 
                  title={
                    <div className="flex items-center gap-2">
                      <span>Активные</span>
                      <Badge color="primary" variant="flat">
                        {mockDeals.filter(d => d.status.includes("Активн")).length}
                      </Badge>
                    </div>
                  }
                />
                <Tab 
                  key="successful" 
                  title={
                    <div className="flex items-center gap-2">
                      <span>Успешные</span>
                      <Badge color="success" variant="flat">
                        {mockDeals.filter(d => d.status.includes("Завершенная")).length}
                      </Badge>
                    </div>
                  }
                />
                <Tab 
                  key="expired" 
                  title={
                    <div className="flex items-center gap-2">
                      <span>Истекшие</span>
                      <Badge color="warning" variant="flat">
                        {mockDeals.filter(d => d.status.includes("истекла")).length}
                      </Badge>
                    </div>
                  }
                />
                <Tab 
                  key="duplicates" 
                  title={
                    <div className="flex items-center gap-2">
                      <span>Дубликаты</span>
                      <Badge color="secondary" variant="flat">
                        {mockDeals.filter(d => d.status.includes("Дубликат")).length}
                      </Badge>
                    </div>
                  }
                />
                <Tab 
                  key="error" 
                  title={
                    <div className="flex items-center gap-2">
                      <span>Ошибка</span>
                      <Badge color="danger" variant="flat">
                        {mockDeals.filter(d => d.status.includes("Ошибка")).length}
                      </Badge>
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
            {filteredDeals.length > 0 ? (
              <div className="overflow-x-auto">
                <Table
                  aria-label="Таблица сделок"
                  bottomContent={
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={Math.ceil(filteredDeals.length / rowsPerPage)}
                        onChange={(page) => setPage(page)}
                      />
                    </div>
                  }
                  classNames={{
                    wrapper: "min-h-[500px]",
                  }}
                  selectionMode="single"
                  onRowAction={key => {
                    const deal = filteredDeals.find(d => d.id === Number(key));
                    handleOpenDealDetails(deal);
                  }}
                >
                  <TableHeader>
                    <TableColumn>Заявка</TableColumn>
                    <TableColumn>Сделка</TableColumn>
                    <TableColumn>Сумма</TableColumn>
                    <TableColumn>Сумма к зачислению (-комиссия)</TableColumn>
                    <TableColumn>Курс</TableColumn>
                  </TableHeader>
                  <TableBody 
                    items={paginatedDeals}
                    emptyContent={"Нет данных для отображения"}
                  >
                    {(deal) => (
                      <TableRow key={deal.id} className="cursor-pointer">
                        <TableCell>{deal.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {renderStatusChip(deal.status)}
                            <div className="text-xs text-default-500">
                              {formatDate(deal.date)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <DollarSignIcon className="h-3 w-3 text-success" />
                              <span>{deal.amountUSDT.toFixed(2)} USDT</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <RussianRubleIcon className="h-3 w-3 text-primary" />
                              <span>{deal.amountRUB.toFixed(2)} ₽</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <DollarSignIcon className="h-3 w-3 text-success" />
                              <span>{deal.creditedUSDT.toFixed(2)} USDT</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <RussianRubleIcon className="h-3 w-3 text-primary" />
                              <span>{deal.creditedRUB.toFixed(2)} ₽</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            1 USDT = {deal.exchangeRate.toFixed(2)} ₽
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-default-500 py-10">
                Нет сделок, соответствующих указанным критериям
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Модальное окно с деталями сделки */}
      {selectedDeal && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          size="3xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <HandshakeIcon className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">
                  {selectedDeal.status}
                </h3>
              </div>
              <p className="text-sm text-default-500">
                ID: {selectedDeal.id}
              </p>
            </ModalHeader>
            <Divider />
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Левая колонка - информация о сделке */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-default-500">Ключ сделки:</p>
                    <p className="font-medium">{selectedDeal.dealKey}</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Дата создания</span>
                      <span>{formatDate(selectedDeal.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Дата зачисления</span>
                      <span>{formatDate(selectedDeal.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Прибыль</span>
                      <span className="font-medium text-success">{selectedDeal.profit.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Курс</span>
                      <span>{selectedDeal.exchangeRate.toFixed(2)} ₽</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Реквизит</h4>
                    <Card>
                      <CardBody className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Реквизит</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCardIcon size={16} />
                          <span>{selectedDeal.requisite.number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{selectedDeal.requisite.bank}</span>
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
                            name={selectedDeal.user.shortName}
                            showFallback
                          />
                          <div className="flex flex-col">
                            <span>{selectedDeal.user.name} {selectedDeal.user.shortName}</span>
                            <span className="text-xs text-default-500">{selectedDeal.user.fullName}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Статус</span>
                          <Chip 
                            color={selectedDeal.user.status === "Активно" ? "success" : "default"} 
                            size="sm" 
                            variant="flat"
                          >
                            {selectedDeal.user.status}
                          </Chip>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Лимит</span>
                          <span>{selectedDeal.user.limit}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Успешные сделки</span>
                          <div className="flex items-center gap-2">
                            <span>{selectedDeal.user.successRate}%</span>
                            <span className="text-xs">
                              {selectedDeal.user.successDeals}/{selectedDeal.user.totalDeals}
                            </span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
                
                {/* Правая колонка - информация об устройстве */}
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Устройство</h4>
                    <Card>
                      <CardBody className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Устройство</span>
                          <span>{selectedDeal.device.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Статус</span>
                          <Chip 
                            color={selectedDeal.device.status === "Активно" ? "success" : "default"} 
                            size="sm" 
                            variant="flat"
                          >
                            {selectedDeal.device.status}
                          </Chip>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Последняя активность</span>
                          <span>
                            {selectedDeal.device.lastActiveType}: {formatDate(selectedDeal.device.lastActive)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Реквизиты</span>
                          <Badge color="primary" variant="flat">{selectedDeal.device.requisitesCount}</Badge>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Состояние</span>
                            <div className="flex items-center gap-2">
                              <Chip 
                                color={selectedDeal.device.state === "Онлайн" ? "success" : "danger"} 
                                size="sm" 
                                variant="dot"
                              >
                                {selectedDeal.device.state}
                              </Chip>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BatteryMediumIcon size={16} className={selectedDeal.device.batteryPercentage > 20 ? "text-success" : "text-danger"} />
                              <span>{selectedDeal.device.batteryPercentage} %</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <SignalIcon size={16} className={selectedDeal.device.connectionSpeed > 0 ? "text-success" : "text-danger"} />
                              <span>{selectedDeal.device.connectionSpeed > 0 ? selectedDeal.device.connectionSpeed : "-1"} MBit/s</span>
                            </div>
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