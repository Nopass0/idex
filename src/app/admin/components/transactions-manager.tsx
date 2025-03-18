"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { useDisclosure } from "@/hooks/use-disclosure";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { 
  DollarSignIcon, 
  SearchIcon, 
  PlusIcon, 
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  UserIcon
} from "lucide-react";
import { TransactionStatus } from "@prisma/client";
import type { RouterOutputs } from "@/trpc/react";

type Transaction = RouterOutputs["transaction"]["getTransactions"]["transactions"][number];
type User = RouterOutputs["transaction"]["getUsersForSelect"][number];

// Форматирование даты в удобочитаемый формат
function formatDate(date: Date | string) {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Компонент для отображения статуса транзакции
const StatusChip = ({ status }: { status: TransactionStatus }) => {
  const statusConfig = {
    PENDING: { color: "warning", label: "Ожидание" },
    VERIFICATION: { color: "primary", label: "Проверка" },
    FINALIZATION: { color: "secondary", label: "Завершение" },
    ACTIVE: { color: "success", label: "Активна" },
    HISTORY: { color: "default", label: "История" },
    CANCELLED: { color: "danger", label: "Отменена" }
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Chip
      color={config.color as any}
      variant="flat"
      size="sm"
    >
      {config.label}
    </Chip>
  );
};

export default function TransactionsManager() {
  // Состояние компонента
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | "">("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: TransactionStatus.PENDING as TransactionStatus,
    amountRUB: 0,
    amountUSDT: 0,
    description: "",
    bankName: "",
    cardNumber: "",
    phoneNumber: "",
    userId: undefined as number | undefined
  });

  // Модальные окна
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Получение данных с API
  const { data: transactionsData, isLoading: isTransactionsLoading, refetch: refetchTransactions } = 
    api.transaction.getTransactions.useQuery({
      page,
      perPage,
      search,
      status: filterStatus || undefined,
    });

  const { data: usersData, isLoading: isUsersLoading } = api.transaction.getUsersForSelect.useQuery();

  // Мутации для операций с транзакциями
  const createMutation = api.transaction.createTransaction.useMutation({
    onSuccess: () => {
      toast.success("Транзакция успешно создана");
      onCreateClose();
      void refetchTransactions();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Ошибка при создании транзакции: ${error.message}`);
    }
  });

  const updateMutation = api.transaction.updateTransaction.useMutation({
    onSuccess: () => {
      toast.success("Транзакция успешно обновлена");
      onEditClose();
      void refetchTransactions();
    },
    onError: (error) => {
      toast.error(`Ошибка при обновлении транзакции: ${error.message}`);
    }
  });

  const deleteMutation = api.transaction.deleteTransaction.useMutation({
    onSuccess: () => {
      toast.success("Транзакция успешно удалена");
      onDeleteClose();
      void refetchTransactions();
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении транзакции: ${error.message}`);
    }
  });

  // Обработчики форм
  const handleCreateTransaction = () => {
    createMutation.mutate({
      status: formData.status,
      amountRUB: Number(formData.amountRUB),
      amountUSDT: Number(formData.amountUSDT),
      description: formData.description,
      bankName: formData.bankName,
      cardNumber: formData.cardNumber,
      phoneNumber: formData.phoneNumber,
      userId: formData.userId,
      isMock: true
    });
  };

  const handleUpdateTransaction = () => {
    if (!selectedTransaction) return;

    updateMutation.mutate({
      id: selectedTransaction.id,
      status: formData.status,
      amountRUB: Number(formData.amountRUB),
      amountUSDT: Number(formData.amountUSDT),
      description: formData.description,
      bankName: formData.bankName,
      cardNumber: formData.cardNumber,
      phoneNumber: formData.phoneNumber,
      userId: formData.userId
    });
  };

  const handleDeleteTransaction = () => {
    if (!selectedTransaction) return;
    deleteMutation.mutate({ id: selectedTransaction.id });
  };

  // Вспомогательные функции
  const resetForm = () => {
    setFormData({
      status: TransactionStatus.PENDING,
      amountRUB: 0,
      amountUSDT: 0,
      description: "",
      bankName: "",
      cardNumber: "",
      phoneNumber: "",
      userId: undefined
    });
  };

  const openEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      status: transaction.status,
      amountRUB: transaction.amountRUB,
      amountUSDT: transaction.amountUSDT,
      description: transaction.description || "",
      bankName: transaction.bankName || "",
      cardNumber: transaction.cardNumber || "",
      phoneNumber: transaction.phoneNumber || "",
      userId: transaction.userId
    });
    onEditOpen();
  };

  const openViewModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    onViewOpen();
  };

  const openDeleteModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    onDeleteOpen();
  };

  // Основной интерфейс компонента
  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-md">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSignIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Управление транзакциями</h2>
          </div>
          <div className="flex gap-2">
            <Button 
              color="secondary" 
              onClick={() => {
                setIsLoading(true);
                api.transaction.createRandomTransactions.mutate({
                  count: 5
                }, {
                  onSuccess: () => {
                    toast.success("5 тестовых транзакций успешно созданы");
                    void refetchTransactions();
                    setIsLoading(false);
                  },
                  onError: (error: { message: string }) => {
                    toast.error(`Ошибка при создании транзакций: ${error.message}`);
                    setIsLoading(false);
                  }
                });
              }}
              isLoading={isLoading}
            >
              Создать 5 тестовых
            </Button>
            <Button 
              color="primary" 
              startContent={<PlusIcon className="h-4 w-4" />}
              onClick={onCreateOpen}
            >
              Создать транзакцию
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {/* Фильтры */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input 
              placeholder="Поиск транзакций..." 
              startContent={<SearchIcon className="h-4 w-4 text-default-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select 
              placeholder="Статус"
              selectedKeys={filterStatus ? [filterStatus] : []}
              onChange={(e) => setFilterStatus(e.target.value as TransactionStatus | "")}
              className="w-full sm:w-48"
            >
              <SelectItem key="" textValue="Все статусы">Все статусы</SelectItem>
              {Object.keys(TransactionStatus).map((status) => (
                <SelectItem key={status} textValue={status}>{status}</SelectItem>
              ))}
            </Select>
          </div>

          {/* Таблица транзакций */}
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <Table 
              aria-label="Список транзакций"
              bottomContent={
                transactionsData && transactionsData.pagination.totalPages > 0 ? (
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      total={transactionsData.pagination.totalPages}
                      onChange={(page) => setPage(page)}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>Статус</TableColumn>
                <TableColumn>Сумма RUB</TableColumn>
                <TableColumn>Сумма USDT</TableColumn>
                <TableColumn>Пользователь</TableColumn>
                <TableColumn>Дата создания</TableColumn>
                <TableColumn>Действия</TableColumn>
              </TableHeader>
              <TableBody>
                {transactionsData && transactionsData.transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Транзакции не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  transactionsData?.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>
                        <StatusChip status={transaction.status} />
                      </TableCell>
                      <TableCell>{transaction.amountRUB.toFixed(2)} ₽</TableCell>
                      <TableCell>{transaction.amountUSDT.toFixed(2)} USDT</TableCell>
                      <TableCell>
                        {transaction.User ? (
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-default-500" />
                            <span>{transaction.User.name || transaction.User.email}</span>
                          </div>
                        ) : (
                          <span className="text-default-400">Не назначен</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly variant="light" size="sm">
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Действия с транзакцией">
                            <DropdownItem key="view" 
                              startContent={<EyeIcon className="h-4 w-4" />}
                              onClick={() => openViewModal(transaction)}
                            >
                              Просмотр
                            </DropdownItem>
                            <DropdownItem key="edit"
                              startContent={<EditIcon className="h-4 w-4" />}
                              onClick={() => openEditModal(transaction)}
                            >
                              Редактировать
                            </DropdownItem>
                            <DropdownItem key="delete"
                              startContent={<TrashIcon className="h-4 w-4" />}
                              className="text-danger"
                              onClick={() => openDeleteModal(transaction)}
                            >
                              Удалить
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Модальное окно создания транзакции */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalContent>
          <ModalHeader>Создание новой транзакции</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Select 
                label="Пользователь" 
                placeholder="Выберите пользователя"
                selectedKeys={formData.userId ? [formData.userId.toString()] : []}
                onChange={(e) => setFormData({...formData, userId: e.target.value ? Number(e.target.value) : undefined})}
              >
                {usersData?.map((user) => (
                  <SelectItem key={user.id.toString()} textValue={user.name || user.email}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </Select>
              
              <Select 
                label="Статус" 
                selectedKeys={[formData.status]}
                onChange={(e) => setFormData({...formData, status: e.target.value as TransactionStatus})}
              >
                {Object.keys(TransactionStatus).map((status) => (
                  <SelectItem key={status} textValue={status}>
                    {status}
                  </SelectItem>
                ))}
              </Select>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Сумма RUB" 
                  type="number"
                  value={formData.amountRUB.toString()}
                  onChange={(e) => setFormData({...formData, amountRUB: parseFloat(e.target.value) || 0})}
                />
                <Input 
                  label="Сумма USDT" 
                  type="number"
                  value={formData.amountUSDT.toString()}
                  onChange={(e) => setFormData({...formData, amountUSDT: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <Input 
                label="Описание" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              
              <Input 
                label="Название банка" 
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
              />
              
              <Input 
                label="Номер карты" 
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
              />
              
              <Input 
                label="Номер телефона" 
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={onCreateClose}>
              Отмена
            </Button>
            <Button 
              color="primary" 
              onClick={handleCreateTransaction}
              isLoading={createMutation.isPending}
            >
              Создать
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно редактирования транзакции */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalContent>
          <ModalHeader>Редактирование транзакции</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Select 
                label="Пользователь" 
                placeholder="Выберите пользователя"
                selectedKeys={formData.userId ? [formData.userId.toString()] : []}
                onChange={(e) => setFormData({...formData, userId: e.target.value ? Number(e.target.value) : undefined})}
              >
                {usersData?.map((user) => (
                  <SelectItem key={user.id.toString()} textValue={user.name || user.email}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </Select>
              
              <Select 
                label="Статус" 
                selectedKeys={[formData.status]}
                onChange={(e) => setFormData({...formData, status: e.target.value as TransactionStatus})}
              >
                {Object.keys(TransactionStatus).map((status) => (
                  <SelectItem key={status} textValue={status}>
                    {status}
                  </SelectItem>
                ))}
              </Select>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Сумма RUB" 
                  type="number"
                  value={formData.amountRUB.toString()}
                  onChange={(e) => setFormData({...formData, amountRUB: parseFloat(e.target.value) || 0})}
                />
                <Input 
                  label="Сумма USDT" 
                  type="number"
                  value={formData.amountUSDT.toString()}
                  onChange={(e) => setFormData({...formData, amountUSDT: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <Input 
                label="Описание" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              
              <Input 
                label="Название банка" 
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
              />
              
              <Input 
                label="Номер карты" 
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
              />
              
              <Input 
                label="Номер телефона" 
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={onEditClose}>
              Отмена
            </Button>
            <Button 
              color="primary" 
              onClick={handleUpdateTransaction}
              isLoading={updateMutation.isPending}
            >
              Сохранить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно просмотра транзакции */}
      <Modal isOpen={isViewOpen} onClose={onViewClose}>
        <ModalContent>
          {selectedTransaction && (
            <>
              <ModalHeader>Детали транзакции #{selectedTransaction.id}</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-default-500">Статус:</p>
                    <StatusChip status={selectedTransaction.status} />
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Пользователь:</p>
                    <p>{selectedTransaction.User ? 
                      (selectedTransaction.User.name || selectedTransaction.User.email) : 
                      "Не назначен"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-default-500">Сумма RUB:</p>
                    <p className="font-semibold">{selectedTransaction.amountRUB.toFixed(2)} ₽</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Сумма USDT:</p>
                    <p className="font-semibold">{selectedTransaction.amountUSDT.toFixed(2)} USDT</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-default-500">Банк:</p>
                    <p>{selectedTransaction.bankName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Номер карты:</p>
                    <p>{selectedTransaction.cardNumber || "—"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-default-500">Телефон:</p>
                    <p>{selectedTransaction.phoneNumber || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Дата создания:</p>
                    <p>{formatDate(selectedTransaction.createdAt)}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-default-500">Описание:</p>
                  <p>{selectedTransaction.description || "Без описания"}</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={onViewClose}>
                  Закрыть
                </Button>
                <Button 
                  color="primary" 
                  onClick={() => {
                    onViewClose();
                    openEditModal(selectedTransaction);
                  }}
                >
                  Редактировать
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Модальное окно удаления транзакции */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Удаление транзакции</ModalHeader>
          <ModalBody>
            {selectedTransaction && (
              <>
                <p>Вы уверены, что хотите удалить транзакцию #{selectedTransaction.id}?</p>
                <p className="text-danger mt-2">Это действие нельзя отменить.</p>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={onDeleteClose}>
              Отмена
            </Button>
            <Button 
              color="danger" 
              onClick={handleDeleteTransaction}
              isLoading={deleteMutation.isPending}
            >
              Удалить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
