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
import { Select, SelectItem } from "@heroui/select";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
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
  DownloadIcon
} from "lucide-react";

// Моковые данные для выплат
const mockWithdrawals = [
  {
    id: 1648230,
    status: "Время истекло",
    createdAt: "13.03.25 21:04",
    confirmedAt: "13.03.25 22:34",
    amountRUB: 5000,
    amountUSDT: 56.47,
    recipient: {
      bank: "Сбербанк (MIR)",
      cardNumber: "2202 2063 8306 4545"
    },
    amountToCharge: {
      usdt: 52.21,
      rub: 5110.0
    },
    exchangeRate: 88.54,
    attachedFiles: [
      {
        name: "Документ-2025-03-14-023006",
        size: "44.0 KB"
      }
    ]
  },
  {
    id: 1648196,
    status: "Ожидание подтверждения",
    createdAt: "13.03.25 21:08",
    confirmedAt: "13.03.25 22:25",
    amountRUB: 13400,
    amountUSDT: 151.40,
    recipient: {
      bank: "Сбербанк (MIR)",
      cardNumber: "2202 2063 2964 1776"
    },
    amountToCharge: {
      usdt: 155.19,
      rub: 12753.68
    },
    exchangeRate: 88.51,
    attachedFiles: []
  },
  {
    id: 1648143,
    status: "Завершено",
    createdAt: "13.03.25 21:04",
    confirmedAt: "13.03.25 22:37",
    amountRUB: 5136.8,
    amountUSDT: 58.03,
    recipient: {
      bank: "Сбербанк (MIR)",
      cardNumber: "2202 2069 6486 5307"
    },
    amountToCharge: {
      usdt: 59.31,
      rub: 5246.99
    },
    exchangeRate: 88.5,
    attachedFiles: []
  },
  {
    id: 1648126,
    status: "Ожидание подтверждения",
    createdAt: "13.03.25 21:51",
    confirmedAt: "13.03.25 22:41",
    amountRUB: 5000,
    amountUSDT: 62.04,
    recipient: {
      bank: "Тинькофф",
      cardNumber: "+7 901 898 79 01"
    },
    amountToCharge: {
      usdt: 63.41,
      rub: 5621.60
    },
    exchangeRate: 88.65,
    attachedFiles: []
  },
  {
    id: 1648016,
    status: "Завершено",
    createdAt: "13.03.25 21:19",
    confirmedAt: "13.03.25 22:36",
    amountRUB: 5002.9,
    amountUSDT: 56.40,
    recipient: {
      bank: "Qiwi Банк (CARD)",
      cardNumber: "+7 990 167 73 45"
    },
    amountToCharge: {
      usdt: 57.70,
      rub: 5112.04
    },
    exchangeRate: 88.59,
    attachedFiles: []
  },
  {
    id: 1647955,
    status: "Ожидание подтверждения",
    createdAt: "13.03.25 21:23",
    confirmedAt: "13.03.25 22:40",
    amountRUB: 5500,
    amountUSDT: 62.03,
    recipient: {
      bank: "Банк ВТБ",
      cardNumber: "+7 999 167 98 33"
    },
    amountToCharge: {
      usdt: 63.40,
      rub: 5623.04
    },
    exchangeRate: 88.66,
    attachedFiles: []
  },
  {
    id: 1647871,
    status: "Финализация",
    createdAt: "13.03.25 21:09",
    confirmedAt: "13.03.25 21:14",
    amountRUB: 14500,
    amountUSDT: 160.71,
    recipient: {
      bank: "Банк ВТБ",
      cardNumber: "+7 962 324 24 80"
    },
    amountToCharge: {
      usdt: 164.24,
      rub: 14503.50
    },
    exchangeRate: 88.57,
    attachedFiles: []
  },
  {
    id: 1647725,
    status: "Ожидание подтверждения",
    createdAt: "13.03.25 20:47",
    confirmedAt: "13.03.25 21:32",
    amountRUB: 5003.4,
    amountUSDT: 56.47,
    recipient: {
      bank: "Альфа-БАНК",
      cardNumber: "+7 977 394 81 83"
    },
    amountToCharge: {
      usdt: 57.71,
      rub: 5112.64
    },
    exchangeRate: 88.58,
    attachedFiles: []
  },
  {
    id: 1647720,
    status: "Финализация",
    createdAt: "13.03.25 20:46",
    confirmedAt: "13.03.25 21:30",
    amountRUB: 6600.6,
    amountUSDT: 74.52,
    recipient: {
      bank: "Альфа-БАНК",
      cardNumber: "+7 921 562 54 34"
    },
    amountToCharge: {
      usdt: 76.72,
      rub: 6796.30
    },
    exchangeRate: 88.58,
    attachedFiles: []
  },
  {
    id: 1647619,
    status: "Ожидание подтверждения",
    createdAt: "13.03.25 19:19",
    confirmedAt: "13.03.25 19:30",
    amountRUB: 17000,
    amountUSDT: 216.20,
    recipient: {
      bank: "Qiwi Банк (CARD)",
      cardNumber: "+7 912 205 04 96"
    },
    amountToCharge: {
      usdt: 221.03,
      rub: 19627.40
    },
    exchangeRate: 88.78,
    attachedFiles: []
  }
];

// Банки для фильтра
const banks = [
  "Все",
  "Сбербанк",
  "Тинькофф",
  "Альфа-БАНК",
  "ВТБ",
  "Qiwi Банк",
  "Газпромбанк",
  "Райффайзенбанк"
];

// Типы профилей для фильтра
const profileTypes = [
  "Физическое лицо",
  "Банковский партнёр",
  "Коммерческая компания"
];

// Функция для форматирования копирования
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

export default function WithdrawalsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Состояния для управления интерфейсом
  const [currentTab, setCurrentTab] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const [selectedProfileType, setSelectedProfileType] = useState(new Set(["Физическое лицо"]));
  const [selectedBankSNP, setSelectedBankSNP] = useState(new Set(["Выберите банк"]));
  const [selectedBankByCard, setSelectedBankByCard] = useState(new Set(["Все"]));
  const [copySuccess, setCopySuccess] = useState("");

  // Проверка аутентификации при загрузке страницы
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Фильтрация выплат по активному табу
  const filteredWithdrawals = mockWithdrawals.filter(withdrawal => {
    switch (currentTab) {
      case "active":
        return withdrawal.status === "Ожидание подтверждения";
      case "verification":
        return withdrawal.status === "Проверка";
      case "finalization":
        return withdrawal.status === "Финализация";
      case "waiting":
        return withdrawal.status === "Ожидание";
      case "history":
        return withdrawal.status === "Завершено";
      case "canceled":
        return withdrawal.status === "Отменено";
      default:
        return true;
    }
  });

  // Пагинация
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Обработчик копирования
  const handleCopy = (text) => {
    copyToClipboard(text);
    setCopySuccess("Скопировано!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  // Открыть модальное окно с деталями выплаты
  const handleOpenWithdrawalDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsModalOpen(true);
  };

  // Сохранить настройки фильтров
  const handleSaveFilters = () => {
    // В реальном приложении здесь был бы API-запрос
    alert("Настройки фильтров сохранены");
  };
  
  // Функция для рендеринга статусного чипа
  const renderStatusChip = (status) => {
    let color = "default";
    
    switch (status) {
      case "Завершено":
        color = "success";
        break;
      case "Ожидание подтверждения":
        color = "warning";
        break;
      case "Финализация":
        color = "primary";
        break;
      case "Проверка":
        color = "secondary";
        break;
      case "Отменено":
        color = "danger";
        break;
      case "Время истекло":
        color = "danger";
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
          <BanknoteIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Выплаты</h1>
        </div>
        
        <Card className="w-full shadow-md">
          <CardHeader>
            <Tabs 
              selectedKey={currentTab} 
              onSelectionChange={setCurrentTab}
              color="primary"
              variant="underlined"
              classNames={{
                tabList: "gap-4 overflow-x-auto",
              }}
            >
              <Tab key="all" title="Все" />
              <Tab key="active" title="Активные" />
              <Tab key="verification" title="Проверка" />
              <Tab key="finalization" title="Финализация" />
              <Tab key="waiting" title="Ожидание" />
              <Tab key="history" title="История" />
              <Tab key="canceled" title="Отмененные" />
            </Tabs>
          </CardHeader>
          
          <Divider />
          
          <CardBody>
            {/* Фильтры */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-default-500 mb-1">Выбор типа профиля:</p>
                <Select
                  selectedKeys={selectedProfileType}
                  onSelectionChange={setSelectedProfileType}
                  className="w-full"
                >
                  {profileTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              
              <div>
                <p className="text-sm text-default-500 mb-1">Выбор банка СНП:</p>
                <Select
                  selectedKeys={selectedBankSNP}
                  onSelectionChange={setSelectedBankSNP}
                  className="w-full"
                >
                  <SelectItem key="Выберите банк" value="Выберите банк">
                    Выберите банк
                  </SelectItem>
                  {banks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              
              <div>
                <p className="text-sm text-default-500 mb-1">Выбор банка по карте:</p>
                <Select
                  selectedKeys={selectedBankByCard}
                  onSelectionChange={setSelectedBankByCard}
                  className="w-full"
                >
                  {banks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              
              <div className="flex flex-col">
                <p className="text-sm text-default-500 mb-1">Баланс:</p>
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
            
            {/* Таблица выплат */}
            {filteredWithdrawals.length > 0 ? (
              <div className="overflow-x-auto">
                <Table
                  aria-label="Таблица выплат"
                  bottomContent={
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={Math.ceil(filteredWithdrawals.length / rowsPerPage)}
                        onChange={(page) => setPage(page)}
                      />
                    </div>
                  }
                  classNames={{
                    wrapper: "min-h-[500px]",
                  }}
                >
                  <TableHeader>
                    <TableColumn>Заявка</TableColumn>
                    <TableColumn>Дата создания / подтверждения</TableColumn>
                    <TableColumn>Сумма</TableColumn>
                    <TableColumn>Получатель</TableColumn>
                    <TableColumn>Сумма к списанию</TableColumn>
                    <TableColumn>Курс</TableColumn>
                    <TableColumn>Действия</TableColumn>
                  </TableHeader>
                  <TableBody 
                    items={paginatedWithdrawals}
                    emptyContent={"Нет данных для отображения"}
                  >
                    {(withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell>
                          <Button
                            variant="light"
                            onPress={() => handleOpenWithdrawalDetails(withdrawal)}
                            className="text-primary font-medium"
                            startContent={<EyeIcon size={16} />}
                          >
                            {withdrawal.id}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={14} className="text-default-500" />
                              <span>{withdrawal.createdAt}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon size={14} className="text-default-500" />
                              <span>{withdrawal.confirmedAt}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <RussianRubleIcon size={14} className="text-primary" />
                              <span>{withdrawal.amountRUB.toFixed(2)} ₽</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSignIcon size={14} className="text-success" />
                              <span>{withdrawal.amountUSDT.toFixed(2)} USDT</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCardIcon size={14} className="text-default-500" />
                            <span>{withdrawal.recipient.bank}</span>
                            <Button 
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleCopy(withdrawal.recipient.cardNumber)}
                            >
                              <CopyIcon size={14} />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <DollarSignIcon size={14} className="text-success" />
                              <span>{withdrawal.amountToCharge.usdt.toFixed(2)} USDT</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <RussianRubleIcon size={14} className="text-primary" />
                              <span>{withdrawal.amountToCharge.rub.toFixed(2)} ₽</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="whitespace-nowrap">
                            {withdrawal.exchangeRate.toFixed(2)} ₽
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            isIconOnly
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handleCopy(`${withdrawal.id}: ${withdrawal.recipient.cardNumber} - ${withdrawal.amountRUB.toFixed(2)} ₽`)}
                            className="min-w-[40px]"
                          >
                            {copySuccess ? <CheckIcon size={14} /> : <ClipboardIcon size={14} />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-default-500 py-10">
                Нет выплат, соответствующих указанным критериям
              </p>
            )}
          </CardBody>
        </Card>
      </div>
      
      {/* Модальное окно с деталями выплаты */}
      {selectedWithdrawal && (
        <Modal
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <BanknoteIcon className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Просмотр заявки</h3>
              </div>
              <div className="flex items-center gap-2">
                {renderStatusChip(selectedWithdrawal.status)}
              </div>
            </ModalHeader>
            <Divider />
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-default-500">ID:</p>
                  <p className="font-medium">{selectedWithdrawal.id}</p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-default-500">Банк:</p>
                  <p className="font-medium">{selectedWithdrawal.recipient.bank}</p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-default-500">Сумма:</p>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <RussianRubleIcon size={14} className="text-primary" />
                      <span className="font-medium">{selectedWithdrawal.amountRUB.toFixed(2)} ₽</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSignIcon size={14} className="text-success" />
                      <span className="font-medium">{selectedWithdrawal.amountUSDT.toFixed(2)} USDT</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-default-500">Курс:</p>
                  <p className="font-medium">{selectedWithdrawal.exchangeRate.toFixed(2)} ₽</p>
                </div>
                
                <div className="flex flex-col gap-1 md:col-span-2">
                  <p className="text-sm text-default-500">Карта:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{selectedWithdrawal.recipient.cardNumber}</p>
                    <Button 
                      isIconOnly
                      size="sm"
                      variant="flat"
                      onPress={() => handleCopy(selectedWithdrawal.recipient.cardNumber)}
                    >
                      <CopyIcon size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 md:col-span-2">
                  <p className="text-sm text-default-500">Прикреплённые файлы:</p>
                  {selectedWithdrawal.attachedFiles.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {selectedWithdrawal.attachedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <FileIcon size={16} className="text-primary" />
                            <span className="font-medium">{file.name}</span>
                            <span className="text-xs text-default-500">{file.size}</span>
                          </div>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="primary"
                          >
                            <DownloadIcon size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-default-500">Нет прикрепленных файлов</p>
                  )}
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
              <Button 
                color="primary"
                onPress={() => handleCopy(`ID: ${selectedWithdrawal.id}, Сумма: ${selectedWithdrawal.amountRUB.toFixed(2)} ₽, Карта: ${selectedWithdrawal.recipient.cardNumber}`)}
              >
                {copySuccess ? "Скопировано" : "Скопировать данные"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}