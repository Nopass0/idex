"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { TransactionStatus, TrafficType } from "@prisma/client";

// UI Components
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Input, Textarea } from "@heroui/input";
import { Tabs, Tab } from "@heroui/tabs";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Chip } from "@heroui/chip";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Select, SelectItem } from "@heroui/select";
import { Alert } from "@heroui/alert";

// Icons
import { 
  BanknoteIcon,
  CopyIcon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  FileIcon,
  RussianRubleIcon,
  CreditCardIcon,
  ClipboardIcon,
  CheckIcon,
  EyeIcon,
  DownloadIcon,
  XIcon,
  PhoneIcon,
  PlusIcon,
  BriefcaseIcon,
  UploadIcon,
  AlertCircleIcon
} from "lucide-react";

// Банки для фильтра
const banks = [
  "Все",
  "Сбербанк",
  "T-Банк (Тинькофф)",
  "РНКБ Банк",
  "Райффайзенбанк",
  "БАНК УРАЛСИБ",
  "Озон Банк (Ozon)",
  "КБ УБРиР",
  "Цифра банк",
  "Банк ДОМ.РФ",
  "Газпромбанк",
  "АКБ Абсолют Банк",
  "АЛЬФА-БАНК",
  "Банк ВТБ",
  "АК БАРС БАНК",
  "Хоум кредит",
  "РОСБАНК",
  "ОТП Банк",
  "КБ Ренессанс Кредит",
  "Банк ЗЕНИТ",
  "Россельхозбанк",
  "Промсвязьбанк",
  "Почта Банк",
  "МТС-Банк",
  "Банк Русский Стандарт",
  "АКБ АВАНГАРД",
  "КБ Солидарность",
  "Дальневосточный банк",
  "ББР Банк",
  "ЮниКредит Банк",
  "ГЕНБАНК",
  "ЦМРБанк",
  "Свой Банк",
  "Ингосстрах Банк",
  "МОСКОВСКИЙ КРЕДИТНЫЙ БАНК",
  "Совкомбанк",
  "КБ Модульбанк",
  "Яндекс Банк",
  "КБ ЮНИСТРИМ",
  "АКБ ФОРА-БАНК",
  "Банк Санкт-Петербург",
  "КБ Кубань Кредит",
  "Кредит Европа Банк (Россия)",
  "АКБ НОВИКОМБАНК",
  "Банк Агророс",
  "Урал ФД (Клюква)",
  "ТКБ БАНК",
  "Сургутнефтегазбанк",
  "БКС Банк",
  "КБ РостФинанс",
  "Амра банк",
  "Металлинвестбанк",
  "АБ РОССИЯ",
  "Норвик Банк",
  "Аврора Банк",
  "Азиатско-Тихоокеанский Банк",
  "СДМ-Банк",
  "Мир Привилегий",
  "НС Банк",
  "Банк Точка",
  "ТАТСОЦБАНК",
  "Севергазбанк",
  "НКО ЮМани",
  "Банк Синара",
  "Цупис Кошелек",
  "Банк Финсервис",
  "КБ Долинск",
  "Углеметбанк",
  "Примсоцбанк (ПСКБ)",
  "Экспобанк",
  "КОШЕЛЕВ-БАНК",
  "КБЭР Банк Казани",
  "Банк Левобережный",
  "Интерпрогрессбанк (ИПБ)",
  "КБ ЛОКО-Банк",
  "Банк Оранжевый",
  "Банк АЛЕКСАНДРОВСКИЙ",
  "Живаго Банк",
  "КБ Пойдём!",
  "Банк Приморье",
  "Банк ВБРР",
  "Газтрансбанк",
  "НБКО Васл",
  "ЮГ-Инвестбанк",
  "Банк Кузнецкий",
  "Кубаньторгбанк",
  "Тамбовкредитпромбанк (ТКПБ)",
  "VK Pay",
  "АКБ Солид",
  "Матин",
  "АКБ Алмазэргиэнбанк"
];

// Типы профилей для фильтра
const profileTypes = ["Все", "СБП", "Банковская карта"];

// Причины отклонения транзакций
const rejectionReasons = [
  "Высокий риск мошенничества",
  "Получатель должен посетить банк",
  "Перевод отклонен банком получателя",
  "Технические проблемы",
  "Неверные реквизиты",
  "Другая причина"
];

// Вспомогательные функции
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear().toString().slice(2)} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const translateStatus = (status: TransactionStatus): string => {
  const statusMap: Record<TransactionStatus, string> = {
    [TransactionStatus.PENDING]: "Ожидание подтверждения",
    [TransactionStatus.VERIFICATION]: "Проверка",
    [TransactionStatus.FINALIZATION]: "Финализация",
    [TransactionStatus.ACTIVE]: "Завершено",
    [TransactionStatus.HISTORY]: "История",
    [TransactionStatus.CANCELLED]: "Отменено"
  };
  return statusMap[status] || status;
};

export default function TransactionsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Simple authentication check - replace with your actual auth logic
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Состояние страницы
  const [currentTab, setCurrentTab] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  
  // Состояние фильтров
  const [selectedProfileTypes, setSelectedProfileTypes] = useState(new Set(["Все"]));
  const [selectedBanksSBP, setSelectedBanksSBP] = useState(new Set(["Все"]));
  const [selectedBanksByCard, setSelectedBanksByCard] = useState(new Set(["Все"]));
  const [balance, setBalance] = useState("0");
  
  // Состояние элементов UI
  const [alert, setAlert] = useState({
    isVisible: false,
    message: "",
    color: "success" as "success" | "danger" | "warning" | "primary"
  });
  const [copySuccess, setCopySuccess] = useState("");
  
  // Модальные окна
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [confirmationTime, setConfirmationTime] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  
  // Определение фильтров для API запроса
  const statusFilter = currentTab === "all" 
    ? undefined 
    : currentTab === "active" 
      ? TransactionStatus.PENDING
      : currentTab === "verification" 
        ? TransactionStatus.VERIFICATION
        : currentTab === "finalization" 
          ? TransactionStatus.FINALIZATION
          : currentTab === "history" 
            ? TransactionStatus.ACTIVE
            : currentTab === "canceled" 
              ? TransactionStatus.CANCELLED
              : undefined;
  
  const inProgressFilter = currentTab === "inProgress" ? true : undefined;

  // API запросы
  const transactionsQuery = api.transaction.getUserTransactions.useQuery(
    {
      page,
      perPage,
      status: statusFilter,
      inProgress: inProgressFilter,
      search
    },
    {
      enabled: isAuthenticated,
      refetchOnWindowFocus: false
    }
  );
  
  const { data: transactionsData, isLoading: isLoadingTransactions, refetch: refetchTransactions } = transactionsQuery;

  const { data: transactionDetails, isLoading: isLoadingDetails } = api.transaction.getUserTransactionById.useQuery(
    { id: selectedTransactionId || 0 },
    { 
      enabled: !!selectedTransactionId && (isDetailsModalOpen || isConfirmModalOpen || isRejectModalOpen),
      refetchOnWindowFocus: false
    }
  );

  // Мутации
  const setInProgressMutation = api.transaction.setTransactionInProgress.useMutation({
    onSuccess: () => {
      setAlert({ isVisible: true, message: "Транзакция добавлена в работу", color: "success" });
      refetchTransactions();
    },
    onError: (error) => {
      setAlert({ isVisible: true, message: `Ошибка: ${error.message}`, color: "danger" });
    }
  });

  const acceptTransactionMutation = api.transaction.acceptTransaction.useMutation({
    onSuccess: () => {
      setAlert({ isVisible: true, message: "Транзакция успешно принята", color: "success" });
      setIsConfirmModalOpen(false);
      setReceiptFile(null);
      refetchTransactions();
    },
    onError: (error) => {
      setAlert({ isVisible: true, message: `Ошибка: ${error.message}`, color: "danger" });
    }
  });

  const rejectTransactionMutation = api.transaction.rejectTransaction.useMutation({
    onSuccess: () => {
      setAlert({ isVisible: true, message: "Транзакция отклонена", color: "success" });
      setIsRejectModalOpen(false);
      setSelectedReason("");
      setOtherReason("");
      setReceiptFile(null);
      refetchTransactions();
    },
    onError: (error) => {
      setAlert({ isVisible: true, message: `Ошибка: ${error.message}`, color: "danger" });
    }
  });

  // Вспомогательные функции
  const showAlert = (message: string, color: "success" | "danger" | "warning" | "primary") => {
    setAlert({ isVisible: true, message, color });
    setTimeout(() => setAlert(prev => ({ ...prev, isVisible: false })), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setAlert({ isVisible: true, message: "Скопировано в буфер обмена", color: "success" });
        setCopySuccess("Скопировано!");
        setTimeout(() => setCopySuccess(""), 1500);
      })
      .catch(() => {
        setAlert({ isVisible: true, message: "Не удалось скопировать текст", color: "danger" });
      });
  };

  const renderSelectedItems = (
    selectedItems: Set<string>, 
    setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>
  ) => {
    const items = Array.from(selectedItems);
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {items.map((item) => (
          <Chip 
            key={item} 
            onClose={() => {
              const newSelected = new Set(selectedItems);
              newSelected.delete(item);
              setSelectedItems(newSelected);
            }}
            variant="flat"
            size="sm"
          >
            {item}
          </Chip>
        ))}
      </div>
    );
  };

  const renderStatusChip = (status: TransactionStatus) => {
    const colorMap: Record<TransactionStatus, "primary" | "default" | "secondary" | "success" | "warning" | "danger"> = {
      [TransactionStatus.ACTIVE]: "success",
      [TransactionStatus.PENDING]: "warning",
      [TransactionStatus.FINALIZATION]: "primary",
      [TransactionStatus.VERIFICATION]: "secondary",
      [TransactionStatus.CANCELLED]: "danger",
      [TransactionStatus.HISTORY]: "default"
    };
    
    return <Chip color={colorMap[status] || "default"} size="sm" variant="flat">{translateStatus(status)}</Chip>;
  };

  // Обработчики событий
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setReceiptFile(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddToWork = (transactionId: number) => {
    setInProgressMutation.mutate(
      { id: transactionId },
      {
        onSuccess: () => {
          showAlert("Транзакция добавлена в работу", "success");
          // Если текущая вкладка не "В работе", то переключаемся на нее
          if (currentTab !== "inProgress") {
            setCurrentTab("inProgress");
            setPage(1);
          } else {
            void refetchTransactions();
          }
        },
        onError: (error) => {
          showAlert(`Ошибка: ${error.message}`, "danger");
        }
      }
    );
  };

  const handleSaveFilters = () => {
    setAlert({ isVisible: true, message: "Настройки фильтров сохранены", color: "success" });
    // Здесь был бы API-запрос для сохранения фильтров в БД
  };

  const handleAcceptTransaction = () => {
    if (!selectedTransactionId || !receiptFile) {
      setAlert({ isVisible: true, message: "Необходимо прикрепить чек оплаты", color: "danger" });
      return;
    }

    acceptTransactionMutation.mutate({
      id: selectedTransactionId,
      receiptFile
    });
  };

  const handleRejectTransaction = () => {
    if (!selectedTransactionId) return;

    const reason = selectedReason === "Другая причина" ? otherReason : selectedReason;
    
    if (!reason) {
      setAlert({ isVisible: true, message: "Необходимо указать причину отклонения", color: "danger" });
      return;
    }

    rejectTransactionMutation.mutate({
      id: selectedTransactionId,
      reason,
      receiptFile: receiptFile || undefined
    });
  };

  // Эффект для автоматического обновления данных
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isAuthenticated && !isLoadingTransactions) {
      interval = setInterval(() => {
        refetchTransactions();
      }, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, refetchTransactions, isLoadingTransactions]);

  // Эффект для проверки аутентификации - здесь можно добавить вашу реальную логику аутентификации
  useEffect(() => {
    // В реальном приложении здесь можно проверить куки, токены, и т.д.
    setAuthLoading(true);
    
    // Имитируем проверку аутентификации
    const timeoutId = setTimeout(() => {
      setIsAuthenticated(true);
      setAuthLoading(false);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Эффект для отслеживания времени с момента создания транзакции
  useEffect(() => {
    if ((isConfirmModalOpen || isRejectModalOpen) && transactionDetails) {
      const creationDate = new Date(transactionDetails.createdAt);
      
      const timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - creationDate.getTime()) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setConfirmationTime(`${minutes}м ${seconds.toString().padStart(2, '0')}с`);
      }, 1000);
      
      return () => clearInterval(timerInterval);
    }
  }, [isConfirmModalOpen, isRejectModalOpen, transactionDetails]);

  // Отображение загрузки
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-lg">Загрузка...</p>
      </div>
    );
  }

  // Ранний возврат, если пользователь не аутентифицирован
  if (!isAuthenticated) {
    return null;
  }

  const transactions = transactionsData?.transactions || [];
  const pagination = transactionsData?.pagination || { totalPages: 1 };

  return (
    <div className="mx-auto max-w-full px-10 py-8">
      {/* Уведомления */}
      <Alert
        color={alert.color}
        isVisible={alert.isVisible}
        onVisibleChange={(isVisible) => setAlert(prev => ({ ...prev, isVisible }))}
        className="fixed top-4 right-4 z-50 max-w-md shadow-lg"
      >
        {alert.message}
      </Alert>
      
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-2">
          <BanknoteIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Транзакции</h1>
        </div>
        
        <Card className="w-full shadow-md">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Tabs 
                selectedKey={currentTab} 
                onSelectionChange={(key) => {
                  if (typeof key === 'string' && key !== currentTab) {
                    setCurrentTab(key);
                    setPage(1);
                  }
                }}
                color="primary"
                variant="underlined"
                classNames={{
                  tabList: "gap-4 overflow-x-auto",
                }}
              >
                <Tab key="all" title="Все" />
                <Tab key="active" title="Активные" />
                <Tab key="inProgress" title="В работе" />
                <Tab key="verification" title="Проверка" />
                <Tab key="finalization" title="Финализация" />
                <Tab key="history" title="История" />
                <Tab key="canceled" title="Отмененные" />
              </Tabs>
              
              <div className="flex w-full md:w-auto">
                <Input
                  placeholder="Поиск транзакций..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full md:w-64"
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  }
                />
              </div>
            </div>
          </CardHeader>
          
          <Divider />
          
          <CardBody className="dark:bg-content1">
            {/* Фильтры */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-default-500 mb-1">Выбор типа трафика:</p>
                <Select
                  selectionMode="multiple"
                  selectedKeys={selectedProfileTypes}
                  onSelectionChange={(keys) => {
                    if (keys instanceof Set) {
                      setSelectedProfileTypes(new Set(Array.from(keys) as string[]));
                    }
                  }}
                  className="w-full"
                  variant="bordered"
                  placeholder="Выберите типы профиля"
                >
                  {profileTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </Select>
                {selectedProfileTypes.size > 0 && renderSelectedItems(selectedProfileTypes, setSelectedProfileTypes)}
              </div>
              
              <div>
                <p className="text-sm text-default-500 mb-1">Выбор банков СБП:</p>
                <Select
                  selectionMode="multiple"
                  selectedKeys={selectedBanksSBP}
                  onSelectionChange={(keys) => {
                    if (keys instanceof Set) {
                      setSelectedBanksSBP(new Set(Array.from(keys) as string[]));
                    }
                  }}
                  className="w-full"
                  variant="bordered"
                  placeholder="Выберите банки СБП"
                >
                  {banks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </Select>
                {selectedBanksSBP.size > 0 && renderSelectedItems(selectedBanksSBP, setSelectedBanksSBP)}
              </div>
              
              <div>
                <p className="text-sm text-default-500 mb-1">Выбор банков по картам:</p>
                <Select
                  selectionMode="multiple"
                  selectedKeys={selectedBanksByCard}
                  onSelectionChange={(keys) => {
                    if (keys instanceof Set) {
                      setSelectedBanksByCard(new Set(Array.from(keys) as string[]));
                    }
                  }}
                  className="w-full"
                  variant="bordered"
                  placeholder="Выберите банки по карте"
                >
                  {banks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </Select>
                {selectedBanksByCard.size > 0 && renderSelectedItems(selectedBanksByCard, setSelectedBanksByCard)}
              </div>
              
              <div className="flex flex-col">
                <p className="text-sm text-default-500">Баланс:</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    type="number"
                    className="w-full"
                  />
                  <Button 
                    color="primary"
                    onPress={handleSaveFilters}
                  >
                    Сохранить
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Таблица транзакций */}
            {isLoadingTransactions && transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Spinner size="lg" color="primary" />
                <p className="mt-4 text-lg">Загрузка транзакций...</p>
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table
                  shadow="sm"
                  selectionMode="none"
                  aria-label="Таблица транзакций"
                  classNames={{
                    base: "max-h-[480px] overflow-auto",
                    table: "min-w-[800px]",
                  }}
                >
                  <TableHeader>
                    <TableColumn key="id">ID</TableColumn>
                    <TableColumn key="date">Дата</TableColumn>
                    <TableColumn key="amount">Сумма</TableColumn>
                    <TableColumn key="status">Статус</TableColumn>
                    <TableColumn key="bank">Банк</TableColumn>
                    <TableColumn key="action">Действие</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent={
                      <div className="py-3 text-center">
                        {isLoadingTransactions ? (
                          <div className="flex flex-col items-center">
                            <Spinner size="sm" color="primary" />
                            <span className="mt-2">Загрузка транзакций...</span>
                          </div>
                        ) : (
                          "Нет доступных транзакций"
                        )}
                      </div>
                    }
                    items={transactions}
                  >
                    {(transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Button
                            variant="light"
                            onPress={() => {
                              setSelectedTransactionId(transaction.id);
                              setIsDetailsModalOpen(true);
                            }}
                            className="text-primary font-medium"
                            startContent={<EyeIcon size={16} />}
                          >
                            {transaction.id}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={14} className="text-default-500" />
                              <span>{formatDate(transaction.createdAt)}</span>
                            </div>
                            {transaction.confirmedAt && (
                              <div className="flex items-center gap-1">
                                <ClockIcon size={14} className="text-default-500" />
                                <span>{formatDate(transaction.confirmedAt)}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <RussianRubleIcon size={14} className="text-primary" />
                              <span>{transaction.amountRUB.toFixed(2)} ₽</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSignIcon size={14} className="text-success" />
                              <span>{transaction.amountUSDT.toFixed(2)} USDT</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {renderStatusChip(transaction.status)}
                            {transaction.inProgress && (
                              <Badge color="primary" variant="flat">В работе</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              {transaction.trafficType === TrafficType.SBP ? (
                                <PhoneIcon size={18} className="text-primary" />
                              ) : (
                                <CreditCardIcon size={18} className="text-primary" />
                              )}
                              <span className="font-medium">
                                {transaction.phoneNumber || transaction.cardNumber || "Не указано"}
                              </span>
                              <Button 
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => copyToClipboard(transaction.phoneNumber || transaction.cardNumber || "")}
                                isDisabled={!transaction.phoneNumber && !transaction.cardNumber}
                              >
                                <CopyIcon size={14} />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`text-xs px-2 py-0.5 rounded ${transaction.trafficType === TrafficType.SBP ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                                {transaction.trafficType === TrafficType.SBP ? "СБП" : "Банковская карта"}
                              </div>
                              <span className="text-default-500 text-sm">
                                {transaction.bankName || ""}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {transaction.status === TransactionStatus.PENDING && currentTab === "inProgress" ? (
                              // Кнопки принятия/отклонения для транзакций в работе
                              <>
                                <Button
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  className="min-w-[110px]"
                                  title="Подтвердить"
                                  onPress={() => {
                                    setSelectedTransactionId(transaction.id);
                                    setIsConfirmModalOpen(true);
                                  }}
                                  isDisabled={acceptTransactionMutation.isPending || rejectTransactionMutation.isPending}
                                >
                                  Подтвердить
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  className="min-w-[110px]"
                                  title="Отклонить"
                                  onPress={() => {
                                    setSelectedTransactionId(transaction.id);
                                    setIsRejectModalOpen(true);
                                  }}
                                  isDisabled={acceptTransactionMutation.isPending || rejectTransactionMutation.isPending}
                                >
                                  Отклонить
                                </Button>
                              </>
                            ) : transaction.status === TransactionStatus.PENDING && !transaction.inProgress ? (
                              // Кнопка добавления в работу для активных транзакций
                              <Button
                                isIconOnly
                                size="sm"
                                color="primary"
                                variant="flat"
                                className="min-w-[40px]"
                                title="Добавить в работу"
                                onPress={() => handleAddToWork(transaction.id)}
                                isDisabled={setInProgressMutation.isPending}
                              >
                                <BriefcaseIcon size={14} />
                              </Button>
                            ) : (
                              // Кнопка копирования для остальных транзакций
                              <Button
                                isIconOnly
                                size="sm"
                                color="primary"
                                variant="flat"
                                onPress={() => copyToClipboard(`ID: ${transaction.id}, Сумма: ${transaction.amountRUB.toFixed(2)} ₽`)}
                                className="min-w-[40px]"
                              >
                                {copySuccess ? <CheckIcon size={14} /> : <ClipboardIcon size={14} />}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              // Отображение, если нет транзакций
              <div className="flex flex-col items-center justify-center py-16">
                <div className="bg-default-100 p-4 rounded-full mb-4">
                  <AlertCircleIcon size={40} className="text-default-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Транзакции не найдены</h3>
                <p className="text-default-500 text-center max-w-md">
                  {search 
                    ? "Попробуйте изменить параметры поиска или фильтрации" 
                    : "В выбранной категории нет транзакций"}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Модальное окно с деталями транзакции */}
      <Modal
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)}
        size="lg"
      >
        <ModalContent>
          {(transactionDetails) ? (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <BanknoteIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Детали транзакции #{transactionDetails.id}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {renderStatusChip(transactionDetails.status)}
                  {transactionDetails.inProgress && (
                    <Badge color="primary" variant="flat">В работе</Badge>
                  )}
                </div>
              </ModalHeader>
              <Divider />
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-default-500">Дата создания:</p>
                    <p className="font-medium">{formatDate(transactionDetails.createdAt)}</p>
                  </div>
                  
                  {transactionDetails.confirmedAt && (
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-default-500">Дата подтверждения:</p>
                      <p className="font-medium">{formatDate(transactionDetails.confirmedAt)}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-default-500">Банк:</p>
                    <p className="font-medium">{transactionDetails.bankName || "Не указан"}</p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-default-500">Тип трафика:</p>
                    <p className="font-medium">{transactionDetails.trafficType === TrafficType.SBP ? "СБП" : "Банковская карта"}</p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-default-500">Сумма RUB:</p>
                    <p className="font-medium">{transactionDetails.amountRUB.toFixed(2)} ₽</p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-default-500">Сумма USDT:</p>
                    <p className="font-medium">{transactionDetails.amountUSDT.toFixed(2)} USDT</p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-default-500">Курс:</p>
                    <p className="font-medium">{transactionDetails.exchangeRate.toFixed(2)} ₽</p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-default-500">К списанию RUB:</p>
                    <p className="font-medium">{transactionDetails.amountToChargeRUB.toFixed(2)} ₽</p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-default-500">К списанию USDT:</p>
                    <p className="font-medium">{transactionDetails.amountToChargeUSDT.toFixed(2)} USDT</p>
                  </div>
                  
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <p className="text-sm text-default-500">Реквизиты:</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {transactionDetails.phoneNumber || transactionDetails.cardNumber || "Не указаны"}
                      </p>
                      <Button 
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={() => copyToClipboard(transactionDetails.phoneNumber || transactionDetails.cardNumber || "")}
                        isDisabled={!transactionDetails.phoneNumber && !transactionDetails.cardNumber}
                      >
                        <CopyIcon size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  {transactionDetails.description && (
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <p className="text-sm text-default-500">Описание:</p>
                      <p className="font-medium">{transactionDetails.description}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <p className="text-sm text-default-500">Прикреплённые чеки:</p>
                    {transactionDetails.Receipt.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {transactionDetails.Receipt.map((receipt) => (
                          <div key={receipt.id} className="flex items-center justify-between p-2 border dark:border-gray-500/20 rounded-md">
                            <div className="flex items-center gap-2">
                              <FileIcon size={16} className="text-primary" />
                              <span className="font-medium">Чек от {formatDate(receipt.createdAt)}</span>
                              <Badge color={receipt.isVerified ? "success" : "warning"}>
                                {receipt.isVerified ? "Проверен" : "Не проверен"}
                              </Badge>
                            </div>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              color="primary"
                              as="a"
                              href={receipt.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <DownloadIcon size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-default-500">Нет прикрепленных чеков</p>
                    )}
                  </div>
                  
                  {transactionDetails.disputes.length > 0 && (
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <p className="text-sm text-default-500">Споры:</p>
                      <div className="flex flex-col gap-2">
                        {transactionDetails.disputes.map((dispute) => (
                          <div key={dispute.id} className="flex flex-col p-2 border dark:border-gray-500/20 rounded-md">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">Спор #{dispute.id}</span>
                              <Badge color={dispute.resolved ? "success" : "warning"}>
                                {dispute.resolved ? "Разрешен" : "В процессе"}
                              </Badge>
                            </div>
                            <p className="text-sm text-default-700"><strong>Причина:</strong> {dispute.reason}</p>
                            <p className="text-sm text-default-700"><strong>Описание:</strong> {dispute.description}</p>
                            <p className="text-xs text-default-500 mt-1">Создан: {formatDate(dispute.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="primary" 
                  variant="light" 
                  onPress={() => setIsDetailsModalOpen(false)}
                >
                  Закрыть
                </Button>
                {transactionDetails.status === TransactionStatus.PENDING && !transactionDetails.inProgress && (
                  <Button 
                    color="primary"
                    onPress={() => {
                      setIsDetailsModalOpen(false);
                      handleAddToWork(transactionDetails.id);
                    }}
                    isDisabled={setInProgressMutation.isPending}
                  >
                    Добавить в работу
                  </Button>
                )}
              </ModalFooter>
            </>
          ) : (
            <div className="flex justify-center items-center py-8">
              <Spinner color="primary" />
            </div>
          )}
        </ModalContent>
      </Modal>

      {/* Модальное окно подтверждения транзакции */}
      <Modal
        isOpen={isConfirmModalOpen} 
        onClose={() => !acceptTransactionMutation.isPending && setIsConfirmModalOpen(false)}
        size="md"
      >
        <ModalContent>
          {(transactionDetails) ? (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <ClockIcon size={24} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Подтверждение транзакции</h3>
                  </div>
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={() => !acceptTransactionMutation.isPending && setIsConfirmModalOpen(false)}
                  >
                    <XIcon size={20} />
                  </Button>
                </div>
                <div className="text-default-500">{confirmationTime}</div>
              </ModalHeader>
              <Divider />
              <ModalBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-default-500">ID</p>
                    <p className="font-medium">{transactionDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Банк</p>
                    <p className="font-medium">{transactionDetails.bankName || "Не указан"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Сумма</p>
                    <p className="font-medium">
                      {transactionDetails.amountRUB.toFixed(2)} ₽ / {transactionDetails.amountUSDT.toFixed(2)} USDT
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Курс</p>
                    <p className="font-medium">{transactionDetails.exchangeRate.toFixed(2)} ₽</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-default-500">Реквизиты</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {transactionDetails.phoneNumber || transactionDetails.cardNumber || "Не указаны"}
                    </p>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => copyToClipboard(transactionDetails.phoneNumber || transactionDetails.cardNumber || "")}
                      isDisabled={!transactionDetails.phoneNumber && !transactionDetails.cardNumber}
                    >
                      <CopyIcon size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-default-500">Прикрепите чек оплаты</p>
                  
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                    />
                    
                    {receiptFile ? (
                      <div className="flex flex-col items-center">
                        <div className="bg-success/10 p-2 rounded-full mb-2">
                          <CheckIcon size={24} className="text-success" />
                        </div>
                        <p className="text-success font-medium">Файл загружен</p>
                        <p className="text-xs text-default-500 mt-1">Нажмите для замены</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="bg-primary/10 p-2 rounded-full mb-2">
                          <UploadIcon size={24} className="text-primary" />
                        </div>
                        <p className="text-primary font-medium">Перетащите файлы сюда или нажмите для загрузки</p>
                        <p className="text-xs text-default-500 mt-1">Поддерживаются JPG, PNG, PDF до 10 МБ</p>
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="primary" 
                  className="w-full"
                  onPress={handleAcceptTransaction}
                  isDisabled={acceptTransactionMutation.isPending || !receiptFile}
                  isLoading={acceptTransactionMutation.isPending}
                >
                  Подтвердить
                </Button>
              </ModalFooter>
            </>
          ) : (
            <div className="flex justify-center items-center py-8">
              <Spinner color="primary" />
            </div>
          )}
        </ModalContent>
      </Modal>

      {/* Модальное окно отклонения транзакции */}
      <Modal
        isOpen={isRejectModalOpen} 
        onClose={() => !rejectTransactionMutation.isPending && setIsRejectModalOpen(false)}
        size="md"
      >
        <ModalContent>
          {(transactionDetails) ? (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <ClockIcon size={24} className="text-danger" />
                    </div>
                    <h3 className="text-xl font-semibold">Отклонение транзакции</h3>
                  </div>
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={() => !rejectTransactionMutation.isPending && setIsRejectModalOpen(false)}
                  >
                    <XIcon size={20} />
                  </Button>
                </div>
                <div className="text-default-500">{confirmationTime}</div>
              </ModalHeader>
              <Divider />
              <ModalBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-default-500">ID</p>
                    <p className="font-medium">{transactionDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Банк</p>
                    <p className="font-medium">{transactionDetails.bankName || "Не указан"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Сумма</p>
                    <p className="font-medium">
                      {transactionDetails.amountRUB.toFixed(2)} ₽ / {transactionDetails.amountUSDT.toFixed(2)} USDT
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Курс</p>
                    <p className="font-medium">{transactionDetails.exchangeRate.toFixed(2)} ₽</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-default-500">Реквизиты</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {transactionDetails.phoneNumber || transactionDetails.cardNumber || "Не указаны"}
                    </p>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => copyToClipboard(transactionDetails.phoneNumber || transactionDetails.cardNumber || "")}
                      isDisabled={!transactionDetails.phoneNumber && !transactionDetails.cardNumber}
                    >
                      <CopyIcon size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-default-500">Причина отклонения</p>
                  <Select
                    className="w-full mt-2"
                    placeholder="Выберите причину отклонения"
                    selectedKeys={selectedReason ? [selectedReason] : []}
                    onSelectionChange={(keys) => {
                      if (keys instanceof Set) {
                        setSelectedReason(Array.from(keys)[0] as string);
                      }
                    }}
                  >
                    {rejectionReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </Select>
                  
                  {selectedReason === "Другая причина" && (
                    <Textarea
                      className="w-full mt-2"
                      placeholder="Укажите причину отклонения"
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      minRows={3}
                    />
                  )}
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-default-500">Прикрепите чек (опционально)</p>
                  
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                    />
                    
                    {receiptFile ? (
                      <div className="flex flex-col items-center">
                        <div className="bg-success/10 p-2 rounded-full mb-2">
                          <CheckIcon size={24} className="text-success" />
                        </div>
                        <p className="text-success font-medium">Файл загружен</p>
                        <p className="text-xs text-default-500 mt-1">Нажмите для замены</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="bg-primary/10 p-2 rounded-full mb-2">
                          <UploadIcon size={24} className="text-primary" />
                        </div>
                        <p className="text-primary font-medium">Перетащите файлы сюда или нажмите для загрузки</p>
                        <p className="text-xs text-default-500 mt-1">Поддерживаются JPG, PNG, PDF до 10 МБ</p>
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  className="w-full"
                  onPress={handleRejectTransaction}
                  isDisabled={rejectTransactionMutation.isPending || !selectedReason || (selectedReason === "Другая причина" && !otherReason)}
                  isLoading={rejectTransactionMutation.isPending}
                >
                  Отклонить
                </Button>
              </ModalFooter>
            </>
          ) : (
            <div className="flex justify-center items-center py-8">
              <Spinner color="primary" />
            </div>
          )}
        </ModalContent>
      </Modal>
      
      {/* Скрытый input для загрузки файлов */}
      <input 
        type="file" 
        className="hidden" 
        accept="image/*,.pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}