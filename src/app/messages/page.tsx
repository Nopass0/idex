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
import { Select, SelectItem } from "@heroui/select";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { 
  MessageSquareIcon, 
  BellIcon, 
  SearchIcon, 
  FilterIcon,
  CalendarIcon,
  ClockIcon,
  SmartphoneIcon,
  CreditCardIcon,
  UserIcon 
} from "lucide-react";
import { Badge } from "@heroui/badge";

// Моковые данные для сообщений
const mockMessages = [
  {
    id: 1001,
    sender: "Сбербанк",
    status: "Определено",
    message: "Перевод 5000р выполнен. Баланс: 12354.78р",
    device: "iPhone 13",
    requisite: "Карта *4589",
    receivedDate: "2025-03-10",
    receivedTime: "14:23:01",
    arrivedDate: "2025-03-10",
    arrivedTime: "14:23:05",
  },
  {
    id: 1002,
    sender: "Тинькофф",
    status: "Определено",
    message: "Пополнение +15000.00 ₽. Баланс 27634.42 ₽",
    device: "Samsung Galaxy S22",
    requisite: "Карта *7788",
    receivedDate: "2025-03-09",
    receivedTime: "10:15:22",
    arrivedDate: "2025-03-09",
    arrivedTime: "10:15:30",
  },
  {
    id: 1003,
    sender: "Альфа-Банк",
    status: "Нет совпадений",
    message: "Списание со счета 4000.00 руб. Доступно: 18500.00 руб.",
    device: "Xiaomi Redmi 10",
    requisite: "Счет *2233",
    receivedDate: "2025-03-08",
    receivedTime: "19:47:33",
    arrivedDate: "2025-03-08",
    arrivedTime: "19:48:01",
  },
  {
    id: 1004,
    sender: "ВТБ",
    status: "Не распознано",
    message: "Платеж поступил. Сумма 8745.20 руб.",
    device: "Google Pixel 6",
    requisite: "Карта *1122",
    receivedDate: "2025-03-07",
    receivedTime: "08:30:12",
    arrivedDate: "2025-03-07",
    arrivedTime: "08:30:45",
  },
  {
    id: 1005,
    sender: "Газпромбанк",
    status: "Определено",
    message: "Перевод от Иванов И.И. Сумма: 12000р получена",
    device: "iPhone 12",
    requisite: "Счет *6677",
    receivedDate: "2025-03-06",
    receivedTime: "16:42:55",
    arrivedDate: "2025-03-06",
    arrivedTime: "16:43:10",
  },
  {
    id: 1006,
    sender: "Райффайзенбанк",
    status: "Нет совпадений",
    message: "Пополнение счета: +30000 RUB. Баланс: 45600.78 RUB",
    device: "OnePlus 9",
    requisite: "Карта *3344",
    receivedDate: "2025-03-05",
    receivedTime: "13:12:45",
    arrivedDate: "2025-03-05",
    arrivedTime: "13:13:01",
  },
  {
    id: 1007,
    sender: "Почта Банк",
    status: "Не распознано",
    message: "Зачисление средств 4550 руб. Доступно: 7865.33 руб.",
    device: "Samsung Galaxy A52",
    requisite: "Счет *8899",
    receivedDate: "2025-03-04",
    receivedTime: "09:05:22",
    arrivedDate: "2025-03-04",
    arrivedTime: "09:06:00",
  },
  {
    id: 1008,
    sender: "Сбербанк",
    status: "Определено",
    message: "Оплата услуг 1200р выполнена. Баланс: 8765.43р",
    device: "Xiaomi Mi 11",
    requisite: "Карта *4589",
    receivedDate: "2025-03-03",
    receivedTime: "20:34:11",
    arrivedDate: "2025-03-03",
    arrivedTime: "20:34:33",
  },
  {
    id: 1009,
    sender: "Тинькофф",
    status: "Нет совпадений",
    message: "Перевод на карту *1234. Сумма: 5600 руб.",
    device: "iPhone 13 Pro",
    requisite: "Карта *7788",
    receivedDate: "2025-03-02",
    receivedTime: "11:23:44",
    arrivedDate: "2025-03-02",
    arrivedTime: "11:24:05",
  },
  {
    id: 1010,
    sender: "Альфа-Банк",
    status: "Определено",
    message: "Зачисление зарплаты: 67000.00 руб. Баланс: 85500.00 руб.",
    device: "Google Pixel 5",
    requisite: "Счет *2233",
    receivedDate: "2025-03-01",
    receivedTime: "09:00:01",
    arrivedDate: "2025-03-01",
    arrivedTime: "09:00:15",
  },
];

// Моковые данные для пушей
const mockPushes = [
  {
    id: 2001,
    appName: "Сбербанк Онлайн",
    status: "Определено",
    message: "Перевод 5000р выполнен. Баланс: 12354.78р",
    device: "iPhone 13",
    requisite: "Карта *4589",
    receivedDate: "2025-03-10",
    receivedTime: "14:23:01",
    arrivedDate: "2025-03-10",
    arrivedTime: "14:23:05",
  },
  {
    id: 2002,
    appName: "Тинькофф",
    status: "Определено",
    message: "Пополнение +15000.00 ₽. Баланс 27634.42 ₽",
    device: "Samsung Galaxy S22",
    requisite: "Карта *7788",
    receivedDate: "2025-03-09",
    receivedTime: "10:15:22",
    arrivedDate: "2025-03-09",
    arrivedTime: "10:15:30",
  },
  {
    id: 2003,
    appName: "Альфа-Банк",
    status: "Нет совпадений",
    message: "Списание со счета 4000.00 руб. Доступно: 18500.00 руб.",
    device: "Xiaomi Redmi 10",
    requisite: "Счет *2233",
    receivedDate: "2025-03-08",
    receivedTime: "19:47:33",
    arrivedDate: "2025-03-08",
    arrivedTime: "19:48:01",
  },
  {
    id: 2004,
    appName: "ВТБ Онлайн",
    status: "Не распознано",
    message: "Платеж поступил. Сумма 8745.20 руб.",
    device: "Google Pixel 6",
    requisite: "Карта *1122",
    receivedDate: "2025-03-07",
    receivedTime: "08:30:12",
    arrivedDate: "2025-03-07",
    arrivedTime: "08:30:45",
  },
  {
    id: 2005,
    appName: "Газпромбанк",
    status: "Дубликат",
    message: "Перевод от Иванов И.И. Сумма: 12000р получена",
    device: "iPhone 12",
    requisite: "Счет *6677",
    receivedDate: "2025-03-06",
    receivedTime: "16:42:55",
    arrivedDate: "2025-03-06",
    arrivedTime: "16:43:10",
  },
  {
    id: 2006,
    appName: "Райффайзенбанк",
    status: "Нет совпадений",
    message: "Пополнение счета: +30000 RUB. Баланс: 45600.78 RUB",
    device: "OnePlus 9",
    requisite: "Карта *3344",
    receivedDate: "2025-03-05",
    receivedTime: "13:12:45",
    arrivedDate: "2025-03-05",
    arrivedTime: "13:13:01",
  },
  {
    id: 2007,
    appName: "Почта Банк",
    status: "Дубликат",
    message: "Зачисление средств 4550 руб. Доступно: 7865.33 руб.",
    device: "Samsung Galaxy A52",
    requisite: "Счет *8899",
    receivedDate: "2025-03-04",
    receivedTime: "09:05:22",
    arrivedDate: "2025-03-04",
    arrivedTime: "09:06:00",
  },
  {
    id: 2008,
    appName: "Сбербанк Онлайн",
    status: "Определено",
    message: "Оплата услуг 1200р выполнена. Баланс: 8765.43р",
    device: "Xiaomi Mi 11",
    requisite: "Карта *4589",
    receivedDate: "2025-03-03",
    receivedTime: "20:34:11",
    arrivedDate: "2025-03-03",
    arrivedTime: "20:34:33",
  },
  {
    id: 2009,
    appName: "Тинькофф",
    status: "Не распознано",
    message: "Перевод на карту *1234. Сумма: 5600 руб.",
    device: "iPhone 13 Pro",
    requisite: "Карта *7788",
    receivedDate: "2025-03-02",
    receivedTime: "11:23:44",
    arrivedDate: "2025-03-02",
    arrivedTime: "11:24:05",
  },
  {
    id: 2010,
    appName: "Альфа-Банк",
    status: "Определено",
    message: "Зачисление зарплаты: 67000.00 руб. Баланс: 85500.00 руб.",
    device: "Google Pixel 5",
    requisite: "Счет *2233",
    receivedDate: "2025-03-01",
    receivedTime: "09:00:01",
    arrivedDate: "2025-03-01",
    arrivedTime: "09:00:15",
  },
];

// Список банков для фильтра
const banks = [
  "Все банки",
  "Сбербанк",
  "Тинькофф",
  "Альфа-Банк",
  "ВТБ",
  "Газпромбанк",
  "Райффайзенбанк",
  "Почта Банк"
];

// Компонент для страницы сообщений
export default function MessagesPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Состояния для управления табами и фильтрами
  const [mainTab, setMainTab] = useState("messages");
  const [messagesSubTab, setMessagesSubTab] = useState("all");
  const [pushesSubTab, setPushesSubTab] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState("Все банки");

  // Проверка аутентификации при загрузке страницы
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Фильтрация сообщений по поиску, табу и банку
  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = searchQuery === "" || 
      Object.values(message).some(value => 
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesBank = selectedBank === "Все банки" || message.sender === selectedBank;
    
    let matchesTab = true;
    if (messagesSubTab !== "all") {
      const tabMap = {
        "defined": "Определено",
        "noMatches": "Нет совпадений",
        "notRecognized": "Не распознано"
      };
      matchesTab = message.status === tabMap[messagesSubTab];
    }
    
    return matchesSearch && matchesBank && matchesTab;
  });

  // Фильтрация пушей по поиску, табу и банку (банк заменен на appName)
  const filteredPushes = mockPushes.filter(push => {
    const matchesSearch = searchQuery === "" || 
      Object.values(push).some(value => 
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesBank = selectedBank === "Все банки" || push.appName.includes(selectedBank);
    
    let matchesTab = true;
    if (pushesSubTab !== "all") {
      const tabMap = {
        "defined": "Определено",
        "noMatches": "Нет совпадений",
        "notRecognized": "Не распознано",
        "duplicate": "Дубликат"
      };
      matchesTab = push.status === tabMap[pushesSubTab];
    }
    
    return matchesSearch && matchesBank && matchesTab;
  });

  // Пагинация
  const paginatedMessages = filteredMessages.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const paginatedPushes = filteredPushes.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Функция для рендеринга статусного чипа
  const renderStatusChip = (status) => {
    let color = "default";
    
    switch (status) {
      case "Определено":
        color = "success";
        break;
      case "Нет совпадений":
        color = "warning";
        break;
      case "Не распознано":
        color = "danger";
        break;
      case "Дубликат":
        color = "secondary";
        break;
    }
    
    return <Chip color={color} size="sm" variant="flat">{status}</Chip>;
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
          <MessageSquareIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Сообщения</h1>
        </div>
        
        <Card className="w-full shadow-md">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Tabs 
                selectedKey={mainTab} 
                onSelectionChange={setMainTab}
                color="primary"
                variant="underlined"
                classNames={{
                  tabList: "gap-6",
                }}
              >
                <Tab 
                  key="messages" 
                  title={
                    <div className="flex items-center gap-2">
                      <MessageSquareIcon size={18} />
                      <span>Сообщения</span>
                      <Badge color="primary" variant="flat">{mockMessages.length}</Badge>
                    </div>
                  }
                />
                <Tab 
                  key="pushes" 
                  title={
                    <div className="flex items-center gap-2">
                      <BellIcon size={18} />
                      <span>Пуши</span>
                      <Badge color="secondary" variant="flat">{mockPushes.length}</Badge>
                    </div>
                  }
                />
              </Tabs>
            </div>
          </CardHeader>
          
          <Divider />
          
          <CardBody>
            {/* Фильтры и поиск */}
            <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end">
              <div className="w-full md:w-1/3">
                <Input
                  label="Поиск"
                  placeholder="Поиск по всем полям..."
                  startContent={<SearchIcon className="text-default-400" size={18} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/3">
                <Select
                  label="Банк отправитель"
                  placeholder="Выберите банк"
                  startContent={<FilterIcon className="text-default-400" size={18} />}
                  defaultSelectedKeys={["Все банки"]}
                  onChange={(e) => setSelectedBank(e.target.value)}
                >
                  {banks.map(bank => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
            
            {/* Подтабы сообщений */}
            {mainTab === "messages" && (
              <div className="mb-6">
                <Tabs 
                  selectedKey={messagesSubTab} 
                  onSelectionChange={setMessagesSubTab}
                  variant="bordered"
                  size="sm"
                  color="primary"
                  classNames={{
                    tabList: "gap-4",
                  }}
                >
                  <Tab key="all" title="Все" />
                  <Tab key="defined" title="Определено" />
                  <Tab key="noMatches" title="Нет совпадений" />
                  <Tab key="notRecognized" title="Не распознано" />
                </Tabs>
              </div>
            )}
            
            {/* Подтабы пушей */}
            {mainTab === "pushes" && (
              <div className="mb-6">
                <Tabs 
                  selectedKey={pushesSubTab} 
                  onSelectionChange={setPushesSubTab}
                  variant="bordered"
                  size="sm"
                  color="secondary"
                  classNames={{
                    tabList: "gap-4",
                  }}
                >
                  <Tab key="all" title="Все" />
                  <Tab key="defined" title="Определено" />
                  <Tab key="noMatches" title="Нет совпадений" />
                  <Tab key="notRecognized" title="Не распознано" />
                  <Tab key="duplicate" title="Дубликат" />
                </Tabs>
              </div>
            )}
            
            {/* Таблица сообщений */}
            {mainTab === "messages" && (
              <div className="overflow-x-auto">
                <Table
                  aria-label="Таблица сообщений"
                  bottomContent={
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={Math.ceil(filteredMessages.length / rowsPerPage)}
                        onChange={(page) => setPage(page)}
                      />
                    </div>
                  }
                  classNames={{
                    wrapper: "min-h-[500px]",
                  }}
                >
                  <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>От кого СМС</TableColumn>
                    <TableColumn>Статус</TableColumn>
                    <TableColumn>Сообщение</TableColumn>
                    <TableColumn>Девайс</TableColumn>
                    <TableColumn>Реквизит</TableColumn>
                    <TableColumn>Получено</TableColumn>
                    <TableColumn>Пришло</TableColumn>
                  </TableHeader>
                  <TableBody 
                    items={paginatedMessages}
                    emptyContent={"Нет данных для отображения"}
                  >
                    {(item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserIcon size={14} />
                            {item.sender}
                          </div>
                        </TableCell>
                        <TableCell>{renderStatusChip(item.status)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={item.message}>
                            {item.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <SmartphoneIcon size={14} />
                            {item.device}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCardIcon size={14} />
                            {item.requisite}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={14} />
                              {item.receivedDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon size={14} />
                              {item.receivedTime}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={14} />
                              {item.arrivedDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon size={14} />
                              {item.arrivedTime}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Таблица пушей */}
            {mainTab === "pushes" && (
              <div className="overflow-x-auto">
                <Table
                  aria-label="Таблица пуш-уведомлений"
                  bottomContent={
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="secondary"
                        page={page}
                        total={Math.ceil(filteredPushes.length / rowsPerPage)}
                        onChange={(page) => setPage(page)}
                      />
                    </div>
                  }
                  classNames={{
                    wrapper: "min-h-[500px]",
                  }}
                >
                  <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>Название приложения</TableColumn>
                    <TableColumn>Статус</TableColumn>
                    <TableColumn>Сообщение</TableColumn>
                    <TableColumn>Девайс</TableColumn>
                    <TableColumn>Реквизит</TableColumn>
                    <TableColumn>Получено</TableColumn>
                    <TableColumn>Пришло</TableColumn>
                  </TableHeader>
                  <TableBody 
                    items={paginatedPushes}
                    emptyContent={"Нет данных для отображения"}
                  >
                    {(item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BellIcon size={14} />
                            {item.appName}
                          </div>
                        </TableCell>
                        <TableCell>{renderStatusChip(item.status)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={item.message}>
                            {item.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <SmartphoneIcon size={14} />
                            {item.device}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCardIcon size={14} />
                            {item.requisite}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={14} />
                              {item.receivedDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon size={14} />
                              {item.receivedTime}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={14} />
                              {item.arrivedDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon size={14} />
                              {item.arrivedTime}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}