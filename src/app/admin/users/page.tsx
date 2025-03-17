"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/trpc/react";
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
import { Tabs, Tab } from "@heroui/tabs";
import { motion } from "framer-motion";
import { useTheme } from "@/providers/theme-provider";
import { 
  AlertCircleIcon, 
  KeyIcon,
  UserCheckIcon,
  UserXIcon,
  UserIcon,
  SearchIcon,
  FilterIcon,
  TrendingUpIcon,
  CalendarIcon,
  RefreshCwIcon,
  MoreVerticalIcon,
  CheckIcon,
  ShieldIcon,
  EyeIcon
} from "lucide-react";

// Типы для статистики регистраций
interface RegistrationStat {
  date: string;
  регистрации: number;
  активации: number;
}

export default function UsersManagementPage() {
  const { theme } = useTheme();
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [page, setPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [registrationStats, setRegistrationStats] = useState<RegistrationStat[]>([]);

  // Получение данных пользователей
  const usersQuery = api.auth.getAllUsers.useQuery(undefined, {
    refetchInterval: false,
  });
  
  // Получение статистики по пользователям (временно закомментировано до реализации API)
  // const statsQuery = api.auth.getUserStats.useQuery(undefined, {
  //   refetchInterval: 60000, // обновление раз в минуту
  // });

  // Создание моковых данных для графика
  useEffect(() => {
    const now = new Date();
    const data: RegistrationStat[] = [];
    // Создание данных за последние 7 дней
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const formattedDate = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      
      // Рандомные данные для примера (заменить на реальные)
      data.push({
        date: formattedDate,
        регистрации: Math.floor(Math.random() * 8) + 1,
        активации: Math.floor(Math.random() * 5)
      });
    }
    setRegistrationStats(data);
  }, []);

  // Фильтрация пользователей
  const filteredUsers = usersQuery.data ? usersQuery.data.filter(user => {
    // Фильтр по поиску
    const searchMatches = searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Фильтр по вкладке
    const tabMatches = selectedTab === "all" || 
      (selectedTab === "admin" && user.role === UserRole.ADMIN) ||
      (selectedTab === "user" && user.role === UserRole.USER) ||
      (selectedTab === "guest" && user.role === UserRole.GUEST);
    
    return searchMatches && tabMatches;
  }) : [];

  // Пагинация
  const indexOfLastUser = page * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Обновление данных
  const handleRefresh = () => {
    usersQuery.refetch();
    // statsQuery.refetch();
  };
  
  // Создание ключа для пользователя
  const handleCreateKeyForUser = (userId: number) => {
    setActionLoading(userId);
    // Здесь будет логика создания ключа для пользователя
    setTimeout(() => {
      setActionLoading(null);
    }, 1000);
  };

  // Отображение загрузки
  if (usersQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-lg">Загрузка данных пользователей...</p>
      </div>
    );
  }
  
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
    <div className="p-4 sm:p-6">
      <div className="flex flex-col mb-6">
        <div className="flex items-center gap-2 mb-2">
          <UserIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Пользователи</h1>
        </div>
        <p className="text-default-500">Управление пользователями системы</p>
      </div>
      
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
            <span className="text-xl font-semibold">{mockUsers.filter(u => u.role === UserRole.ADMIN).length}</span>
            <span className="text-sm text-default-500">Администраторов</span>
          </CardBody>
        </Card>
      </div>
      
      <Card className="shadow-sm mb-6">
        <CardHeader className="p-4 pb-0 flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-default-500" />
            <h2 className="text-xl font-semibold">Фильтры</h2>
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
            
            <Button
              color="primary"
              onClick={handleRefresh}
              isIconOnly
              isLoading={usersQuery.isRefetching}
              size="sm"
            >
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardBody className="px-4 pt-3 pb-2 overflow-hidden">
          <Tabs 
            variant="underlined"
            aria-label="Фильтр пользователей"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key.toString())}
            classNames={{
              base: "w-full",
              tabList: "gap-6",
            }}
            className="mb-4"
          >
            <Tab key="all" title="Все пользователи" />
            <Tab key="admin" title="Администраторы" />
            <Tab key="user" title="Пользователи" />
            <Tab key="guest" title="Неактивированные" />
          </Tabs>
        </CardBody>
      </Card>

      <Card className="shadow-sm mb-6">
        <CardBody className="px-3">
          <Table 
            aria-label="Таблица пользователей" 
            removeWrapper
            isStriped
            classNames={{
              table: "min-w-full",
              th: "bg-default-100/50 py-3 px-3 text-default-600",
            }}
          >
            <TableHeader>
              <TableColumn>ПОЛЬЗОВАТЕЛЬ</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>РОЛЬ</TableColumn>
              <TableColumn>ДАТА РЕГИСТРАЦИИ</TableColumn>
              <TableColumn>БАЛАНС</TableColumn>
              <TableColumn>ДЕЙСТВИЯ</TableColumn>
            </TableHeader>
            <TableBody>
              {usersToDisplay.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="whitespace-nowrap font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role === UserRole.ADMIN ? (
                      <Chip color="primary" size="sm" variant="flat">Админ</Chip>
                    ) : user.role === UserRole.USER ? (
                      <Chip color="success" size="sm" variant="flat">Пользователь</Chip>
                    ) : (
                      <Chip color="warning" size="sm" variant="flat">Гость</Chip>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.createdAt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <Tooltip content={`${user.balanceRUB.toFixed(2)} ₽`}>
                      <span>${user.balanceUSDT.toFixed(2)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Tooltip content="Просмотреть профиль">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    
                    <Dropdown>
                      <DropdownTrigger>
                        <Button 
                          isIconOnly
                          size="sm"
                          variant="light"
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Действия с пользователем">
                        <DropdownItem
                          key="create-key"
                          startContent={<KeyIcon className="h-4 w-4" />}
                          onClick={() => handleCreateKeyForUser(user.id)}
                          isDisabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? "Создание..." : "Создать ключ"}
                        </DropdownItem>
                        <DropdownItem
                          key="block-user"
                          startContent={<UserXIcon className="h-4 w-4" />}
                          className="text-danger"
                        >
                          Заблокировать
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
        
        <CardFooter className="flex justify-between items-center">
          <span className="text-sm text-default-500">
            Показано {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} из {filteredUsers.length}
          </span>
          
          {totalPages > 1 && (
            <Pagination
              total={totalPages}
              page={page}
              onChange={setPage}
              showControls
              classNames={{
                cursor: "bg-primary text-white font-medium",
              }}
            />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
