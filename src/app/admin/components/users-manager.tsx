"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Tooltip } from "@heroui/tooltip";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { motion } from "framer-motion";
import { api } from "@/trpc/react";
import generateAppleWatchAvatar from "@/lib/utils/avatar-generator";
import { 
  UserCheckIcon,
  UserXIcon,
  UserIcon,
  SearchIcon,
  MoreVerticalIcon,
  CheckIcon,
  ShieldIcon,
  KeyIcon
} from "lucide-react";

// Анимации
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function UsersManager() {
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Получение данных пользователей
  const usersQuery = api.auth.getAllUsers.useQuery(undefined, {
    refetchInterval: false,
  });
  
  // Обновление роли пользователя
  const updateRoleMutation = api.user.updateUserRole.useMutation({
    onSuccess: () => {
      setActionLoading(null);
      usersQuery.refetch();
    },
    onError: (error: { message: string }) => {
      setActionLoading(null);
      alert(`Ошибка: ${error.message}`);
    }
  });

  // Мутация для создания ключа активации для пользователя
  const createKeyForUserMutation = api.auth.createActivationKey.useMutation({
    onSuccess: (data) => {
      alert(`Ключ активации успешно создан: ${data.key}`);
      // Обновляем список пользователей после успешного создания ключа
      usersQuery.refetch();
    },
    onError: (error: { message: string }) => {
      alert(`Ошибка создания ключа: ${error.message || "Неизвестная ошибка"}`);
    }
  });

  // Фильтрация пользователей
  const filteredUsers = usersQuery.data ? usersQuery.data.filter(user => {
    // Фильтр по поиску
    const searchMatches = searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Фильтр по роли
    const roleMatches = selectedRole === null || 
      user.role === selectedRole;
    
    return searchMatches && roleMatches;
  }) : [];

  // Пагинация
  const indexOfLastUser = page * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  // Обработчики действий
  const handleUpdateRole = (userId: number, newRole: UserRole) => {
    setActionLoading(userId);
    updateRoleMutation.mutate({ userId, role: newRole });
  };
  
  const handleCreateKeyForUser = (userId: number) => {
    setActionLoading(userId);
    createKeyForUserMutation.mutate({ userId });
  };

  // Создание моковых данных пользователей если API не реализован
  const mockUsers = [
    { id: 1, name: "Алексей Иванов", email: "alexey@example.com", role: UserRole.ADMIN, balanceUSDT: 250.75, balanceRUB: 20500.50, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { id: 2, name: "Елена Смирнова", email: "elena@example.com", role: UserRole.USER, balanceUSDT: 120.30, balanceRUB: 9500.25, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
    { id: 3, name: "Иван Петров", email: "ivan@example.com", role: UserRole.USER, balanceUSDT: 85.40, balanceRUB: 6700.00, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
    { id: 4, name: "Мария Сидорова", email: "maria@example.com", role: UserRole.GUEST, balanceUSDT: 0, balanceRUB: 0, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { id: 5, name: "Дмитрий Козлов", email: "dmitry@example.com", role: UserRole.USER, balanceUSDT: 310.20, balanceRUB: 24500.75, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  ];

  const usersToDisplay = usersQuery.data?.length ? currentUsers : mockUsers;
  const totalUsers = usersQuery.data?.length || mockUsers.length;
  const activeUsers = usersQuery.data ? 
    usersQuery.data.filter(u => u.role === UserRole.USER || u.role === UserRole.ADMIN).length : 
    mockUsers.filter(u => u.role === UserRole.USER || u.role === UserRole.ADMIN).length;
  
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.3 }}
      className="container mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-sm">
          <CardBody className="p-5 flex flex-col items-center">
            <div className="mb-2 p-3 rounded-full bg-primary/10">
              <UserCheckIcon className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-semibold">{totalUsers}</span>
            <span className="text-sm text-default-500">Всего пользователей</span>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm">
          <CardBody className="p-5 flex flex-col items-center">
            <div className="mb-2 p-3 rounded-full bg-success/10">
              <CheckIcon className="h-6 w-6 text-success" />
            </div>
            <span className="text-xl font-semibold">{activeUsers}</span>
            <span className="text-sm text-default-500">Активных пользователей</span>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm">
          <CardBody className="p-5 flex flex-col items-center">
            <div className="mb-2 p-3 rounded-full bg-warning/10">
              <ShieldIcon className="h-6 w-6 text-warning" />
            </div>
            <span className="text-xl font-semibold">
              {(usersQuery.data || mockUsers).filter(u => u.role === UserRole.ADMIN).length}
            </span>
            <span className="text-sm text-default-500">Администраторов</span>
          </CardBody>
        </Card>
      </div>
      
      <Card className="shadow-sm mb-6">
        <CardHeader className="p-4 pb-0 flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5 text-default-500" />
            <h2 className="text-xl font-semibold">Поиск пользователей</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:mt-0">
            <Input
              placeholder="Поиск пользователя..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<SearchIcon className="h-4 w-4 text-default-500" />}
              className="w-full sm:w-auto"
              size="sm"
            />
            
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="flat" 
                  size="sm"
                  startContent={<UserIcon className="h-4 w-4" />}
                >
                  {selectedRole ? 
                    selectedRole === UserRole.ADMIN ? "Администраторы" : 
                    selectedRole === UserRole.USER ? "Пользователи" : 
                    "Гости" : 
                    "Все роли"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Фильтр по ролям"
                selectionMode="single"
                selectedKeys={selectedRole ? new Set([selectedRole]) : new Set()}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  setSelectedRole(selected === "all" ? null : selected as string);
                }}
              >
                <DropdownItem key="all">Все роли</DropdownItem>
                <DropdownItem key={UserRole.ADMIN}>Администраторы</DropdownItem>
                <DropdownItem key={UserRole.USER}>Пользователи</DropdownItem>
                <DropdownItem key={UserRole.GUEST}>Гости</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardHeader>
        <CardBody>
        </CardBody>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <h2 className="text-xl font-bold">Список пользователей</h2>
        </CardHeader>
        <Divider />
        <CardBody className="p-0">
          <Table 
            removeWrapper
            aria-label="Таблица пользователей системы"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={totalPages}
                    onChange={(page) => setPage(page)}
                    className="my-4"
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn>ПОЛЬЗОВАТЕЛЬ</TableColumn>
              <TableColumn>РОЛЬ</TableColumn>
              <TableColumn>ДАТА РЕГИСТРАЦИИ</TableColumn>
              <TableColumn width={100}>БАЛАНС</TableColumn>
              <TableColumn width={120}>ДЕЙСТВИЯ</TableColumn>
            </TableHeader>
            <TableBody>
              {usersToDisplay.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        {(() => {
                          const avatar = generateAppleWatchAvatar(user.name || "Пользователь", user.email || "user");
                          return <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: avatar.svg.dark }} />;
                        })()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-small font-medium text-default-600">{user.name}</span>
                        <span className="text-xs text-default-400">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={user.role === UserRole.ADMIN ? "danger" : 
                             user.role === UserRole.USER ? "success" : "warning"} 
                      variant="flat"
                      size="sm"
                      startContent={user.role === UserRole.ADMIN ? <ShieldIcon className="h-3 w-3" /> : 
                                   user.role === UserRole.USER ? <CheckIcon className="h-3 w-3" /> : 
                                   <UserXIcon className="h-3 w-3" />}
                    >
                      {user.role === UserRole.ADMIN ? "Админ" : 
                       user.role === UserRole.USER ? "Пользователь" : 
                       "Гость"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{new Date(user.createdAt).toLocaleDateString("ru-RU")}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{user.balanceUSDT.toFixed(2)} USDT</p>
                      <p className="text-xs text-default-500">{user.balanceRUB.toFixed(2)} ₽</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Tooltip content="Создать ключ для пользователя">
                        <Button
                          color="primary"
                          variant="light"
                          isIconOnly
                          size="sm"
                          isLoading={actionLoading === user.id}
                          onClick={() => handleCreateKeyForUser(user.id)}
                        >
                          <KeyIcon className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                      
                      <Dropdown>
                        <DropdownTrigger>
                          <Button 
                            color="default" 
                            variant="light" 
                            isIconOnly 
                            size="sm"
                          >
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Действия с пользователем">
                          <DropdownItem
                            key="admin"
                            description="Предоставить права администратора"
                            startContent={<ShieldIcon className="h-4 w-4 text-warning" />}
                            isDisabled={user.role === UserRole.ADMIN}
                            onClick={() => handleUpdateRole(user.id, UserRole.ADMIN)}
                          >
                            Сделать админом
                          </DropdownItem>
                          <DropdownItem
                            key="user"
                            description="Установить обычного пользователя"
                            startContent={<UserCheckIcon className="h-4 w-4 text-success" />}
                            isDisabled={user.role === UserRole.USER}
                            onClick={() => handleUpdateRole(user.id, UserRole.USER)}
                          >
                            Сделать пользователем
                          </DropdownItem>
                          <DropdownItem
                            key="guest"
                            description="Понизить до гостя (деактивировать)"
                            startContent={<UserXIcon className="h-4 w-4 text-danger" />}
                            isDisabled={user.role === UserRole.GUEST}
                            onClick={() => handleUpdateRole(user.id, UserRole.GUEST)}
                          >
                            Сделать гостем
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {usersQuery.isLoading && (
            <div className="flex justify-center p-6">
              <Spinner size="md" color="primary" />
            </div>
          )}
          
          {!usersQuery.isLoading && usersToDisplay.length === 0 && (
            <div className="text-center p-6">
              <p>Пользователи не найдены</p>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}
