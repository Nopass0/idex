"use client";

import { useState, useMemo } from "react";
import { 
  Card, 
  CardBody, 
  CardHeader, 
  CardFooter 
} from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Pagination } from "@heroui/pagination";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Checkbox } from "@heroui/checkbox";
import { Radio, RadioGroup } from "@heroui/radio";
import { Select, SelectItem } from "@heroui/select";
import { Tabs, Tab } from "@heroui/tabs";
import { Badge } from "@heroui/badge";
import { useAuth } from "@/providers/auth-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCardIcon, 
  SearchIcon, 
  FilterIcon, 
  PlusIcon, 
  ArrowDownIcon, 
  EyeIcon, 
  EditIcon, 
  LockIcon, 
  UnlockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertCircleIcon,
  Landmark,
  PhoneIcon,
  LinkIcon,
  ArrowUpDown,
  ArrowDown
} from "lucide-react";

// Mock data for requisites
const mockRequisites = [
  {
    id: 1,
    name: "Иванов Иван Иванович",
    type: "card",
    cardNumber: "5678 **** **** 9543",
    bank: "Сбербанк",
    accountNumber: "40817810099910004312",
    status: "active",
    balance: 29145.30,
    limits: {
      daily: 26001,
      total: "∞"
    },
    successfulDeals: 4,
    traffic: "primary",
    createdAt: "2024-12-01",
    lastTransaction: "2025-03-12T22:56:00"
  },
  {
    id: 2,
    name: "Петров Петр Петрович",
    type: "account",
    accountNumber: "40817810099910002255",
    bank: "Тинькофф",
    status: "inactive",
    balance: 15420.75,
    limits: {
      daily: 100000,
      total: 500000
    },
    successfulDeals: 12,
    traffic: "secondary",
    createdAt: "2024-11-15",
    lastTransaction: "2025-03-10T14:33:00"
  },
  {
    id: 3,
    name: "Сидоров Алексей Владимирович",
    type: "sbp",
    accountNumber: "40817810099910003366",
    phone: "+7 (999) 123-45-67",
    bank: "Альфа-Банк",
    status: "blocked",
    balance: 0,
    limits: {
      daily: 50000,
      total: 200000
    },
    successfulDeals: 8,
    traffic: "vip",
    createdAt: "2025-01-20",
    lastTransaction: "2025-02-28T09:12:00"
  },
  {
    id: 4,
    name: "Николаева Мария Сергеевна",
    type: "link",
    accountNumber: "40817810099910001144",
    paymentLink: "https://pay.example.com/mnickolaeva",
    bank: "Райффайзен",
    status: "active",
    balance: 42680.90,
    limits: {
      daily: 75000,
      total: 300000
    },
    successfulDeals: 15,
    traffic: "anonymous",
    createdAt: "2025-02-01",
    lastTransaction: "2025-03-11T18:45:00"
  }
];

// Mock push notification data
const mockPushes = [
  {
    id: 8168778,
    packageName: "ru.sberbankmobile",
    status: "Совпадение: Сделка#63891646",
    text: "Перевод от Нима Батоевич Я.: + 5 000 ₽ — Баланс: 29 145,30 ₽ МИР •• 9543",
    received: "12.03.2025, 22:56",
    arrived: "12.03.2025, 22:56"
  },
  {
    id: 8168773,
    packageName: "ru.sberbankmobile",
    status: "Совпадение: Сделка#63891503",
    text: "Зачисление Промсвязьбанк: + 10 001 ₽ — Баланс: 24 145,30 ₽ МИР •• 9543",
    received: "12.03.2025, 22:56",
    arrived: "12.03.2025, 22:55"
  },
  {
    id: 8166851,
    packageName: "ru.sberbankmobile",
    status: "Совпадение: Сделка#63879407",
    text: "Перевод от Ирина Вячеславовна Н.: + 5 000 ₽ — Баланс: 14 144,30 ₽ МИР •• 9543",
    received: "12.03.2025, 22:11",
    arrived: "12.03.2025, 22:10"
  },
  {
    id: 8166808,
    packageName: "ru.sberbankmobile",
    status: "Совпадение: Сделка#63878967",
    text: "Перевод от Сильвия Семеновна К.: + 6 000 ₽ — Баланс: 9 144,30 ₽ МИР •• 9543",
    received: "12.03.2025, 22:10",
    arrived: "12.03.2025, 22:08"
  },
  {
    id: 8165561,
    packageName: "ru.sberbankmobile",
    status: "Нет совпадений",
    text: "Перевод от Артем Анатольевич С.: + 10 ₽ — Баланс: 3 144,30 ₽ МИР •• 9543",
    received: "12.03.2025, 21:50",
    arrived: "12.03.2025, 21:50"
  },
  {
    id: 8164265,
    packageName: "ru.sberbankmobile",
    status: "Нет совпадений",
    text: "Перевод от АРТЕМ ЮРЬЕВИЧ С.: Т‑Банк + 16 000 ₽ — Баланс: 16 050,30 ₽ MIR •• 9543",
    received: "12.03.2025, 21:32",
    arrived: "12.03.2025, 21:32"
  }
];

// Mock transaction data
const mockTransactions = [
  {
    id: 63891646,
    type: "primary",
    date: "12.03.2025, 22:56",
    amountUsdt: 50.12,
    amountRub: 5000,
    finalAmountUsdt: 49.61,
    finalAmountRub: 4950,
    commission: 1.0,
    rate: 99.76
  },
  {
    id: 63891503,
    type: "secondary",
    date: "12.03.2025, 22:55",
    amountUsdt: 100.25,
    amountRub: 10001,
    finalAmountUsdt: 99.25,
    finalAmountRub: 9901,
    commission: 1.0,
    rate: 99.76
  },
  {
    id: 63879407,
    type: "vip",
    date: "12.03.2025, 22:10",
    amountUsdt: 50.12,
    amountRub: 5000,
    finalAmountUsdt: 49.36,
    finalAmountRub: 4925,
    commission: 1.5,
    rate: 99.76
  },
  {
    id: 63878967,
    type: "anonymous",
    date: "12.03.2025, 22:08",
    amountUsdt: 60.15,
    amountRub: 6000,
    finalAmountUsdt: 59.25,
    finalAmountRub: 5910,
    commission: 1.5,
    rate: 99.76
  }
];

// Mock banks for dropdown
const banks = [
  { id: 1, name: "Сбербанк" },
  { id: 2, name: "Тинькофф" },
  { id: 3, name: "Альфа-Банк" },
  { id: 4, name: "Райффайзен" },
  { id: 5, name: "ВТБ" },
  { id: 6, name: "Промсвязьбанк" },
  { id: 7, name: "Газпромбанк" }
];

// Mock devices for dropdown
const devices = [
  { id: 1, name: "Samsung Galaxy S21" },
  { id: 2, name: "iPhone 13 Pro" },
  { id: 3, name: "Xiaomi Mi 11" },
  { id: 4, name: "Google Pixel 6" }
];

export default function RequisitesPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  
  // State for pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  
  // State for filter and search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bankFilter, setBankFilter] = useState("all");
  const [sortBy, setSortBy] = useState("lastTransaction");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // State for modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequisite, setSelectedRequisite] = useState(null);
  const [selectedTab, setSelectedTab] = useState("transactions");
  
  // Form state for new requisite
  const [newRequisite, setNewRequisite] = useState({
    name: "",
    type: "card",
    bank: "",
    device: "",
    pushNotifications: true,
    smsNotifications: false,
    traffic: "primary",
    cardNumber: "",
    accountNumber: "",
    phone: "",
    paymentLink: ""
  });

  // Filtered and sorted requisites
  const filteredRequisites = useMemo(() => {
    return mockRequisites.filter(requisite => {
      // Filter by search query
      const matchesSearch = 
        requisite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        requisite.id.toString().includes(searchQuery) ||
        (requisite.cardNumber && requisite.cardNumber.includes(searchQuery));
      
      // Filter by status
      const matchesStatus = statusFilter === "all" || requisite.status === statusFilter;
      
      // Filter by bank
      const matchesBank = bankFilter === "all" || requisite.bank === bankFilter;
      
      return matchesSearch && matchesStatus && matchesBank;
    }).sort((a, b) => {
      if (sortBy === "limits") {
        // Sort by daily limit
        const aValue = typeof a.limits.daily === "number" ? a.limits.daily : Infinity;
        const bValue = typeof b.limits.daily === "number" ? b.limits.daily : Infinity;
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      } else if (sortBy === "lastTransaction") {
        // Sort by last transaction date
        return sortOrder === "asc" 
          ? new Date(a.lastTransaction) - new Date(b.lastTransaction)
          : new Date(b.lastTransaction) - new Date(a.lastTransaction);
      } else if (sortBy === "bank") {
        // Sort by bank name
        return sortOrder === "asc"
          ? a.bank.localeCompare(b.bank)
          : b.bank.localeCompare(a.bank);
      } else if (sortBy === "status") {
        // Sort by status
        return sortOrder === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      
      // Default sort by id
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    });
  }, [searchQuery, statusFilter, bankFilter, sortBy, sortOrder]);
  
  // Paginated requisites
  const paginatedRequisites = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRequisites.slice(start, end);
  }, [filteredRequisites, page]);
  
  // Stats calculation
  const stats = useMemo(() => {
    return {
      turnover: 286.65,
      balance: 0,
      profit: 20.07,
      conversion: "100%",
      dealsRatio: "4/4",
      limit: "26 001 ₽ / ∞ ₽"
    };
  }, []);

  // Handle opening requisite details
  const handleOpenDetails = (requisite) => {
    setSelectedRequisite(requisite);
    setDetailModalOpen(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRequisite(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New requisite:", newRequisite);
    setAddModalOpen(false);
    // Here you would normally add the new requisite to your data
  };

  // Handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

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

  // Render status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge color="success" variant="flat">Активно</Badge>;
      case "inactive":
        return <Badge color="warning" variant="flat">Неактивно</Badge>;
      case "blocked":
        return <Badge color="danger" variant="flat">Заблокировано</Badge>;
      default:
        return <Badge color="default" variant="flat">{status}</Badge>;
    }
  };

  // Render traffic badge
  const renderTrafficBadge = (traffic) => {
    switch (traffic) {
      case "primary":
        return <Badge color="primary" variant="flat">Первичный</Badge>;
      case "secondary":
        return <Badge color="secondary" variant="flat">Вторичный</Badge>;
      case "vip":
        return <Badge color="success" variant="flat">ВИП</Badge>;
      case "anonymous":
        return <Badge color="warning" variant="flat">Анонимный</Badge>;
      default:
        return <Badge color="default" variant="flat">{traffic}</Badge>;
    }
  };

  // Render icon based on requisite type
  const renderTypeIcon = (type) => {
    switch (type) {
      case "card":
        return <CreditCardIcon className="h-5 w-5 text-primary" />;
      case "account":
        return <Landmark className="h-5 w-5 text-success" />;
      case "sbp":
        return <PhoneIcon className="h-5 w-5 text-warning" />;
      case "link":
        return <LinkIcon className="h-5 w-5 text-secondary" />;
      default:
        return <CreditCardIcon className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header with stats */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Реквизиты</h1>
          </div>
          
          <Card className="shadow-sm">
            <CardBody className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4">
              <div>
                <p className="text-sm text-default-500">Оборот</p>
                <p className="font-semibold">{stats.turnover} USDT</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Баланс</p>
                <p className="font-semibold">{stats.balance} ₽</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Прибыль</p>
                <p className="font-semibold">{stats.profit} USDT</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Конверсия</p>
                <p className="font-semibold">{stats.conversion}</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Сделки</p>
                <p className="font-semibold">{stats.dealsRatio}</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Лимит</p>
                <p className="font-semibold">{stats.limit}</p>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Filter and search controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Tabs 
              selectedKey={statusFilter} 
              onSelectionChange={setStatusFilter}
              variant="light"
              color="primary"
              className="w-full md:w-auto"
            >
              <Tab key="all" title="Все" />
              <Tab key="active" title="Активные" />
              <Tab key="inactive" title="Неактивные" />
              <Tab key="blocked" title="Заблокированные" />
            </Tabs>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Input
              placeholder="Поиск по ID, ФИО, номеру..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<SearchIcon className="h-4 w-4 text-default-400" />}
              className="w-full sm:w-64"
            />
            
            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat" startIcon={<FilterIcon className="h-4 w-4" />}>
                  Банк
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                selectedKeys={[bankFilter]} 
                onSelectionChange={(keys) => setBankFilter(Array.from(keys)[0] || "all")}
                selectionMode="single"
              >
                <DropdownItem key="all">Все банки</DropdownItem>
                {banks.map(bank => (
                  <DropdownItem key={bank.name}>{bank.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            
            <Button
              color="primary"
              startIcon={<PlusIcon className="h-4 w-4" />}
              onClick={() => setAddModalOpen(true)}
            >
              Добавить
            </Button>
          </div>
        </div>
        
        {/* Main table */}
        <Card className="w-full shadow-md">
          <CardHeader>
            <h3 className="text-xl font-semibold">Платежные реквизиты</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            {filteredRequisites.length > 0 ? (
              <Table
                aria-label="Таблица реквизитов"
                bottomContent={
                  <div className="flex justify-center">
                    <Pagination
                      total={Math.ceil(filteredRequisites.length / rowsPerPage)}
                      page={page}
                      onChange={setPage}
                    />
                  </div>
                }
              >
                <TableHeader>
                  <TableColumn onClick={() => handleSort("id")} className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      ID
                      {sortBy === "id" && (
                        <ArrowDown className={`h-4 w-4 ${sortOrder === "desc" ? "transform rotate-0" : "transform rotate-180"}`} />
                      )}
                    </div>
                  </TableColumn>
                  <TableColumn>ФИО</TableColumn>
                  <TableColumn>Реквизит</TableColumn>
                  <TableColumn onClick={() => handleSort("bank")} className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Банк
                      {sortBy === "bank" && (
                        <ArrowDown className={`h-4 w-4 ${sortOrder === "desc" ? "transform rotate-0" : "transform rotate-180"}`} />
                      )}
                    </div>
                  </TableColumn>
                  <TableColumn onClick={() => handleSort("status")} className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Статус
                      {sortBy === "status" && (
                        <ArrowDown className={`h-4 w-4 ${sortOrder === "desc" ? "transform rotate-0" : "transform rotate-180"}`} />
                      )}
                    </div>
                  </TableColumn>
                  <TableColumn>Баланс</TableColumn>
                  <TableColumn onClick={() => handleSort("limits")} className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Лимиты
                      {sortBy === "limits" && (
                        <ArrowDown className={`h-4 w-4 ${sortOrder === "desc" ? "transform rotate-0" : "transform rotate-180"}`} />
                      )}
                    </div>
                  </TableColumn>
                  <TableColumn>Трафик</TableColumn>
                  <TableColumn>Сделки</TableColumn>
                  <TableColumn>Действия</TableColumn>
                </TableHeader>
                <TableBody>
                  {paginatedRequisites.map(requisite => (
                    <TableRow key={requisite.id} className="cursor-pointer hover:bg-default-50" onClick={() => handleOpenDetails(requisite)}>
                      <TableCell>{requisite.id}</TableCell>
                      <TableCell>{requisite.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderTypeIcon(requisite.type)}
                          {requisite.type === "card" && requisite.cardNumber}
                          {requisite.type === "account" && requisite.accountNumber}
                          {requisite.type === "sbp" && `${requisite.accountNumber} (${requisite.phone})`}
                          {requisite.type === "link" && "Ссылка на оплату"}
                        </div>
                      </TableCell>
                      <TableCell>{requisite.bank}</TableCell>
                      <TableCell>{renderStatusBadge(requisite.status)}</TableCell>
                      <TableCell>{requisite.balance.toLocaleString()} ₽</TableCell>
                      <TableCell>{requisite.limits.daily.toLocaleString()} ₽ / {requisite.limits.total === "∞" ? "∞" : `${requisite.limits.total.toLocaleString()} ₽`}</TableCell>
                      <TableCell>{renderTrafficBadge(requisite.traffic)}</TableCell>
                      <TableCell>{requisite.successfulDeals}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetails(requisite);
                            }}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Edit requisite", requisite.id);
                            }}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          {requisite.status === "active" ? (
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Block requisite", requisite.id);
                              }}
                            >
                              <LockIcon className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="success"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Unblock requisite", requisite.id);
                              }}
                            >
                              <UnlockIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-default-500 py-10">
                {searchQuery || statusFilter !== "all" || bankFilter !== "all" 
                  ? "Нет реквизитов, соответствующих выбранным фильтрам" 
                  : "У вас пока не добавлено ни одного платежного реквизита"}
              </p>
            )}
          </CardBody>
        </Card>
      </div>
      
      {/* Add Requisite Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} size="3xl">
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              <h3 className="text-xl font-semibold">Добавить реквизит</h3>
            </ModalHeader>
            <Divider />
            <ModalBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Название реквизита"
                    placeholder="Введите название"
                    name="name"
                    value={newRequisite.name}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </div>
                
                <div>
                  <Select
                    label="Устройство"
                    placeholder="Выберите устройство"
                    name="device"
                    value={newRequisite.device}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  >
                    {devices.map(device => (
                      <SelectItem key={device.id} value={device.name}>
                        {device.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Select
                    label="Банк"
                    placeholder="Выберите банк"
                    name="bank"
                    value={newRequisite.bank}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  >
                    {banks.map(bank => (
                      <SelectItem key={bank.id} value={bank.name}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium mb-1">Уведомления</p>
                  <div className="flex gap-4">
                    <Checkbox
                      name="pushNotifications"
                      checked={newRequisite.pushNotifications}
                      onChange={handleInputChange}
                    >
                      Пуш-уведомления
                    </Checkbox>
                    <Checkbox
                      name="smsNotifications"
                      checked={newRequisite.smsNotifications}
                      onChange={handleInputChange}
                    >
                      СМС
                    </Checkbox>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-sm font-medium mb-1">Трафик</p>
                  <RadioGroup
                    orientation="horizontal"
                    name="traffic"
                    value={newRequisite.traffic}
                    onChange={handleInputChange}
                  >
                    <Radio value="primary">Первичный</Radio>
                    <Radio value="secondary">Вторичный</Radio>
                    <Radio value="anonymous">Анонимный</Radio>
                    <Radio value="vip">ВИП</Radio>
                  </RadioGroup>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-sm font-medium mb-1">Тип реквизита</p>
                  <RadioGroup
                    orientation="horizontal"
                    name="type"
                    value={newRequisite.type}
                    onChange={handleInputChange}
                  >
                    <Radio value="card">Банковская карта</Radio>
                    <Radio value="account">Банковский счет</Radio>
                    <Radio value="sbp">СБП</Radio>
                    <Radio value="link">Ссылка на оплату</Radio>
                  </RadioGroup>
                </div>
                
                {newRequisite.type === "card" && (
                  <div className="md:col-span-2">
                    <Input
                      label="Номер карты"
                      placeholder="XXXX XXXX XXXX XXXX"
                      name="cardNumber"
                      value={newRequisite.cardNumber}
                      onChange={handleInputChange}
                      required
                      fullWidth
                    />
                  </div>
                )}
                
                {(newRequisite.type === "account" || newRequisite.type === "sbp" || newRequisite.type === "link") && (
                  <div className="md:col-span-2">
                    <Input
                      label="Номер счета"
                      placeholder="XXXXXXXXXXXXXXXX"
                      name="accountNumber"
                      value={newRequisite.accountNumber}
                      onChange={handleInputChange}
                      required
                      fullWidth
                    />
                  </div>
                )}
                
                {newRequisite.type === "sbp" && (
                  <div className="md:col-span-2">
                    <Input
                      label="Номер телефона"
                      placeholder="+7 (XXX) XXX-XX-XX"
                      name="phone"
                      value={newRequisite.phone}
                      onChange={handleInputChange}
                      required
                      fullWidth
                    />
                  </div>
                )}
                
                {newRequisite.type === "link" && (
                  <div className="md:col-span-2">
                    <Input
                      label="Ссылка на оплату"
                      placeholder="https://..."
                      name="paymentLink"
                      value={newRequisite.paymentLink}
                      onChange={handleInputChange}
                      required
                      fullWidth
                    />
                  </div>
                )}
              </div>
            </ModalBody>
            <Divider />
            <ModalFooter>
              <Button variant="flat" onClick={() => setAddModalOpen(false)}>
                Отмена
              </Button>
              <Button color="primary" type="submit">
                Добавить
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      
      {/* Detail Modal */}
      {selectedRequisite && (
        <Modal 
          isOpen={detailModalOpen} 
          onClose={() => setDetailModalOpen(false)}
          size="5xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-2">
                {renderTypeIcon(selectedRequisite.type)}
                <h3 className="text-xl font-semibold">
                  {selectedRequisite.name} - {selectedRequisite.id}
                </h3>
              </div>
            </ModalHeader>
            <Divider />
            <ModalBody className="p-0">
              {/* General information */}
              <div className="bg-default-50 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-default-500">Тип</p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderTypeIcon(selectedRequisite.type)}
                      <p className="font-medium">
                        {selectedRequisite.type === "card" && "Банковская карта"}
                        {selectedRequisite.type === "account" && "Банковский счет"}
                        {selectedRequisite.type === "sbp" && "СБП"}
                        {selectedRequisite.type === "link" && "Ссылка на оплату"}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-default-500">Банк</p>
                    <p className="font-medium mt-1">{selectedRequisite.bank}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-default-500">Статус</p>
                    <div className="mt-1">{renderStatusBadge(selectedRequisite.status)}</div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-default-500">Трафик</p>
                    <div className="mt-1">{renderTrafficBadge(selectedRequisite.traffic)}</div>
                  </div>
                  
                  {selectedRequisite.type === "card" && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-default-500">Номер карты</p>
                      <p className="font-medium mt-1">{selectedRequisite.cardNumber}</p>
                    </div>
                  )}
                  
                  <div className="md:col-span-2">
                    <p className="text-sm text-default-500">Номер счета</p>
                    <p className="font-medium mt-1">{selectedRequisite.accountNumber}</p>
                  </div>
                  
                  {selectedRequisite.type === "sbp" && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-default-500">Номер телефона</p>
                      <p className="font-medium mt-1">{selectedRequisite.phone}</p>
                    </div>
                  )}
                  
                  {selectedRequisite.type === "link" && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-default-500">Ссылка на оплату</p>
                      <p className="font-medium mt-1">{selectedRequisite.paymentLink}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-default-500">Баланс</p>
                    <p className="font-medium mt-1">{selectedRequisite.balance.toLocaleString()} ₽</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-default-500">Лимиты</p>
                    <p className="font-medium mt-1">
                      {selectedRequisite.limits.daily.toLocaleString()} ₽ / 
                      {selectedRequisite.limits.total === "∞" ? " ∞" : ` ${selectedRequisite.limits.total.toLocaleString()} ₽`}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-default-500">Успешные сделки</p>
                    <p className="font-medium mt-1">{selectedRequisite.successfulDeals}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-default-500">Дата создания</p>
                    <p className="font-medium mt-1">{selectedRequisite.createdAt}</p>
                  </div>
                </div>
                
                <div className="flex mt-6 gap-2">
                  <Button
                    color="primary"
                    startIcon={<EditIcon className="h-4 w-4" />}
                    onClick={() => {
                      console.log("Edit requisite", selectedRequisite.id);
                      setDetailModalOpen(false);
                    }}
                  >
                    Редактировать
                  </Button>
                  
                  {selectedRequisite.status === "active" ? (
                    <Button
                      color="danger"
                      variant="flat"
                      startIcon={<LockIcon className="h-4 w-4" />}
                      onClick={() => {
                        console.log("Block requisite", selectedRequisite.id);
                        setDetailModalOpen(false);
                      }}
                    >
                      Заблокировать
                    </Button>
                  ) : (
                    <Button
                      color="success"
                      variant="flat"
                      startIcon={<UnlockIcon className="h-4 w-4" />}
                      onClick={() => {
                        console.log("Unblock requisite", selectedRequisite.id);
                        setDetailModalOpen(false);
                      }}
                    >
                      Возобновить
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Tabs for detailed information */}
              <div className="p-6">
                <Tabs 
                  selectedKey={selectedTab} 
                  onSelectionChange={setSelectedTab}
                  variant="underlined"
                  className="w-full"
                >
                  <Tab key="transactions" title="Сделки" />
                  <Tab key="messages" title="Сообщения" />
                  <Tab key="pushes" title="Пуши" />
                </Tabs>
                
                <div className="mt-4">
                  {selectedTab === "transactions" && (
                    <Table aria-label="Таблица сделок">
                      <TableHeader>
                        <TableColumn>№ Заявки</TableColumn>
                        <TableColumn>Тип</TableColumn>
                        <TableColumn>Дата и время</TableColumn>
                        <TableColumn>Сумма USDT</TableColumn>
                        <TableColumn>Сумма ₽</TableColumn>
                        <TableColumn>К зачислению USDT</TableColumn>
                        <TableColumn>К зачислению ₽</TableColumn>
                        <TableColumn>Комиссия %</TableColumn>
                        <TableColumn>Курс</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {mockTransactions.map(transaction => (
                          <TableRow key={transaction.id}>
                            <TableCell>{transaction.id}</TableCell>
                            <TableCell>{renderTrafficBadge(transaction.type)}</TableCell>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>{transaction.amountUsdt}</TableCell>
                            <TableCell>{transaction.amountRub.toLocaleString()} ₽</TableCell>
                            <TableCell>{transaction.finalAmountUsdt}</TableCell>
                            <TableCell>{transaction.finalAmountRub.toLocaleString()} ₽</TableCell>
                            <TableCell>{transaction.commission}%</TableCell>
                            <TableCell>1 USDT = {transaction.rate} ₽</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  
                  {selectedTab === "messages" && (
                    <p className="text-center text-default-500 py-10">
                      Нет сообщений для отображения
                    </p>
                  )}
                  
                  {selectedTab === "pushes" && (
                    <Table aria-label="Таблица пушей">
                      <TableHeader>
                        <TableColumn>ID</TableColumn>
                        <TableColumn>Package name</TableColumn>
                        <TableColumn>Статус</TableColumn>
                        <TableColumn>Текст</TableColumn>
                        <TableColumn>Получено</TableColumn>
                        <TableColumn>Пришло</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {mockPushes.map(push => (
                          <TableRow key={push.id}>
                            <TableCell>{push.id}</TableCell>
                            <TableCell>{push.packageName}</TableCell>
                            <TableCell>
                              {push.status.includes("Совпадение") ? (
                                <span className="flex items-center gap-1 text-success">
                                  <CheckCircleIcon className="h-4 w-4" />
                                  {push.status}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-warning">
                                  <XCircleIcon className="h-4 w-4" />
                                  {push.status}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-md truncate" title={push.text}>
                                {push.text}
                              </div>
                            </TableCell>
                            <TableCell>{push.received}</TableCell>
                            <TableCell>{push.arrived}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </ModalBody>
            <Divider />
            <ModalFooter>
              <Button color="primary" onClick={() => setDetailModalOpen(false)}>
                Закрыть
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}