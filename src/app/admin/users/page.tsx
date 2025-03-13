"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/trpc/react";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Tooltip } from "@heroui/tooltip";
import { Divider } from "@heroui/divider";
import { 
  AlertCircleIcon, 
  KeyIcon,
  UserCheckIcon,
  UserXIcon,
  ShieldIcon,
  InfoIcon,
  MoreVerticalIcon,
  CheckIcon,
  UserIcon
} from "lucide-react";
import { createTRPCClient, httpLink } from "@trpc/client";
import { appRouter } from "@/server/api/root";



export default function UsersManagementPage() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const usersQuery = api.auth.getAllUsers.useQuery(undefined, {
    enabled: isAuthenticated && isAdmin,
    refetchInterval: false,
  });

  // Отображение загрузки
  if (isLoading || usersQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-lg">Загрузка данных пользователей...</p>
      </div>
    );
  }

  // Перенаправление неадминов
  if (!isAdmin && !isLoading) {
    redirect("/");
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2">
          <UserIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Управление пользователями</h1>
        </div>
        <p className="text-default-500">Просмотр и управление пользователями в системе</p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Список пользователей</h2>
          <p className="text-default-500">
            Просмотр и управление учетными записями пользователей
          </p>
        </CardHeader>
        <Divider />
        <CardBody>
          {usersQuery.error ? (
            <div className="text-danger p-4 rounded-lg bg-danger-50 flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5" />
              <p>{usersQuery.error.message}</p>
            </div>
          ) : (
            <Table aria-label="Таблица пользователей">
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>ИМЯ</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>РОЛЬ</TableColumn>
                <TableColumn>БАЛАНС USDT</TableColumn>
                <TableColumn>БАЛАНС RUB</TableColumn>
                <TableColumn>ДАТА РЕГИСТРАЦИИ</TableColumn>
                <TableColumn>ДЕЙСТВИЯ</TableColumn>
              </TableHeader>
              <TableBody>
                {usersQuery.data && usersQuery.data.length > 0 ? (
                  usersQuery.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === UserRole.ADMIN ? (
                          <Chip color="danger" variant="flat" size="sm">
                            Администратор
                          </Chip>
                        ) : user.role === UserRole.USER ? (
                          <Chip color="success" variant="flat" size="sm">
                            Активный
                          </Chip>
                        ) : (
                          <Chip color="warning" variant="flat" size="sm">
                            Гость
                          </Chip>
                        )}
                      </TableCell>
                      <TableCell>{user.balanceUSDT.toFixed(2)}</TableCell>
                      <TableCell>{user.balanceRUB.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light"
                                isDisabled={actionLoading === user.id}
                              >
                                <MoreVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Действия с пользователем">
                              <DropdownItem key="view" textValue="view">
                                Просмотр профиля
                              </DropdownItem>
                              <DropdownItem key="edit" textValue="edit">
                                Редактировать
                              </DropdownItem>
                              <DropdownItem key="block" textValue="block">
                                Блокировать
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                          
                          <Tooltip content="Создать ключ активации">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              color="primary"
                              isLoading={actionLoading === user.id}
                              isDisabled={actionLoading !== null}
                            >
                              <KeyIcon className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="flex justify-center items-center p-4 text-default-500">
                        <InfoIcon className="h-5 w-5 mr-2" />
                        <span>Нет пользователей для отображения</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
