"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/trpc/react";
import { redirect } from "next/navigation";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Tooltip } from "@heroui/tooltip";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Tabs, Tab } from "@heroui/tabs";
import { Pagination } from "@heroui/pagination";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { motion } from "framer-motion";
import { useTheme } from "@/providers/theme-provider";
import { 
  AlertCircleIcon, 
  KeyIcon,
  InfoIcon,
  CopyIcon,
  CheckIcon,
  PlusIcon,
  ListIcon,
  HistoryIcon,
  SearchIcon,
  FilterIcon
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function KeysManagementPage() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const { theme } = useTheme();
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [page, setPage] = useState(1);
  const [keysPerPage] = useState(10);

  // Получение списка ключей
  const keysQuery = api.auth.getAllKeys.useQuery(undefined, {
    enabled: isAuthenticated && isAdmin,
    refetchInterval: false,
  });

  // Рефетч ключей после создания нового
  useEffect(() => {
    if (generatedKey) {
      keysQuery.refetch();
    }
  }, [generatedKey]);

  // Создание нового ключа
  const createKeyMutation = api.auth.createActivationKey.useMutation({
    onSuccess: (data) => {
      setGeneratedKey(data.key);
      setIsGeneratingKey(false);
      // Автоматический рефетч списка ключей
      keysQuery.refetch();
    },
    onError: () => {
      setIsGeneratingKey(false);
    },
  });

  // Обработка создания ключа
  const handleCreateKey = async () => {
    setIsGeneratingKey(true);
    createKeyMutation.mutate({});
  };

  // Копирование ключа в буфер обмена
  const copyToClipboard = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Фильтрация ключей
  const filteredKeys = keysQuery.data ? keysQuery.data.filter(key => {
    if (selectedTab === "active") return key.isActive;
    if (selectedTab === "inactive") return !key.isActive;
    return true;
  }) : [];

  // Пагинация
  const indexOfLastKey = page * keysPerPage;
  const indexOfFirstKey = indexOfLastKey - keysPerPage;
  const currentKeys = filteredKeys.slice(indexOfFirstKey, indexOfLastKey);
  const totalPages = Math.ceil(filteredKeys.length / keysPerPage);

  // Отображение загрузки
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-lg">Загрузка данных ключей...</p>
      </div>
    );
  }

  // Перенаправление неадминов
  if (!isAdmin && !isLoading) {
    redirect("/");
  }

  // Создать моковые данные если API еще не реализован
  const mockKeys = [
    { id: 1, key: "XXXX-YYYY-ZZZZ-1111", isActive: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), updatedAt: new Date() },
    { id: 2, key: "XXXX-YYYY-ZZZZ-2222", isActive: false, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), updatedAt: new Date() },
    { id: 3, key: "XXXX-YYYY-ZZZZ-3333", isActive: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), updatedAt: new Date() },
    { id: 4, key: "XXXX-YYYY-ZZZZ-4444", isActive: false, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), updatedAt: new Date() },
    { id: 5, key: "XXXX-YYYY-ZZZZ-5555", isActive: true, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), updatedAt: new Date() },
  ];

  const keysToDisplay = keysQuery.data?.length ? currentKeys : mockKeys;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.3 }}
      className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-10"
    >
      <motion.div 
        variants={fadeIn} 
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-2 mb-8"
      >
        <div className="flex items-center gap-2">
          <KeyIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Управление ключами активации</h1>
        </div>
        <p className="text-default-500">Создание и управление ключами для активации пользователей</p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div 
          variants={fadeIn}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 order-2 lg:order-1"
        >
          <Card className="shadow-md sticky top-6">
            <CardHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">Действия</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <Button 
                onClick={handleCreateKey} 
                isDisabled={isGeneratingKey}
                isLoading={isGeneratingKey}
                color="primary"
                fullWidth
                size="lg"
                className="transition-transform hover:scale-[1.02]"
                startContent={<PlusIcon className="h-4 w-4" />}
              >
                Создать ключ
              </Button>
              
              <Divider />
              
              <div className="space-y-2">
                <p className="text-default-500 text-sm">Фильтры</p>
                <div className="flex flex-col gap-2">
                  <Button 
                    color={selectedTab === "all" ? "primary" : "default"}
                    variant={selectedTab === "all" ? "solid" : "light"}
                    fullWidth
                    size="sm"
                    onClick={() => setSelectedTab("all")}
                    className="justify-start"
                    startContent={<ListIcon className="h-4 w-4" />}
                  >
                    Все ключи
                  </Button>
                  
                  <Button 
                    color={selectedTab === "active" ? "success" : "default"}
                    variant={selectedTab === "active" ? "solid" : "light"}
                    fullWidth
                    size="sm"
                    onClick={() => setSelectedTab("active")}
                    className="justify-start"
                    startContent={<CheckIcon className="h-4 w-4" />}
                  >
                    Активированные
                  </Button>
                  
                  <Button 
                    color={selectedTab === "inactive" ? "warning" : "default"}
                    variant={selectedTab === "inactive" ? "solid" : "light"}
                    fullWidth
                    size="sm"
                    onClick={() => setSelectedTab("inactive")}
                    className="justify-start"
                    startContent={<AlertCircleIcon className="h-4 w-4" />}
                  >
                    Неактивированные
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
        
        <motion.div 
          variants={fadeIn}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 order-1 lg:order-2"
        >
          {generatedKey ? (
            <Card className="shadow-md mb-6">
              <CardHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-success flex items-center gap-2">
                  <CheckIcon className="h-5 w-5" />
                  Ключ успешно создан
                </h2>
              </CardHeader>
              <Divider />
              <CardBody className="p-6">
                <div className="space-y-6">
                  <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800 text-success flex items-center gap-2">
                    <CheckIcon className="h-5 w-5" />
                    <span className="font-medium">Ключ активации успешно создан!</span>
                  </div>
                  
                  <Card shadow="sm" className="border border-default-100">
                    <CardBody className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <InfoIcon className="h-5 w-5 text-primary" />
                          <h3 className="text-medium font-semibold">Ключ активации</h3>
                        </div>
                        <div className="flex items-center gap-2 bg-default-50 dark:bg-default-800 p-3 rounded-lg font-mono text-sm">
                          <span className="flex-1 break-all">{generatedKey}</span>
                          <Tooltip content={copied ? "Скопировано!" : "Скопировать в буфер обмена"}>
                            <Button 
                              isIconOnly 
                              size="sm" 
                              variant="light" 
                              onClick={() => copyToClipboard(generatedKey)}
                            >
                              {copied ? 
                                <CheckIcon className="h-4 w-4 text-success" /> : 
                                <CopyIcon className="h-4 w-4" />
                              }
                            </Button>
                          </Tooltip>
                        </div>
                        <p className="text-sm text-default-500">
                          Этот ключ можно использовать один раз для активации учетной записи пользователя.
                          Передайте его пользователю для активации аккаунта.
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                  
                  <div className="flex gap-3 flex-wrap">
                    <Button 
                      color="primary"
                      onClick={handleCreateKey}
                      isDisabled={isGeneratingKey}
                      isLoading={isGeneratingKey}
                      className="transition-transform hover:scale-[1.02]"
                    >
                      Создать еще один ключ
                    </Button>
                    <Button 
                      variant="flat"
                      onClick={() => setGeneratedKey(null)}
                    >
                      Закрыть
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : null}
          
          <Card className="shadow-md">
            <CardHeader className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Список ключей активации</h2>
                <Chip size="sm" variant="flat" color="primary">
                  Всего: {filteredKeys.length || mockKeys.length}
                </Chip>
              </div>
              <p className="text-default-500">
                Управление ключами активации пользователей
              </p>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
              <Table 
                aria-label="Таблица ключей активации"
                classNames={{
                  base: "min-h-[400px]",
                }}
              >
                <TableHeader>
                  <TableColumn>КЛЮЧ</TableColumn>
                  <TableColumn>СТАТУС</TableColumn>
                  <TableColumn>ДАТА СОЗДАНИЯ</TableColumn>
                  <TableColumn>ДАТА ОБНОВЛЕНИЯ</TableColumn>
                  <TableColumn>ДЕЙСТВИЯ</TableColumn>
                </TableHeader>
                <TableBody 
                  emptyContent={<div className="py-8 text-default-500">Ключи не найдены</div>}
                  items={keysToDisplay}
                >
                  {(item) => (
                    <TableRow key={item.id} className="transition-colors hover:bg-default-50 dark:hover:bg-default-800/50">
                      <TableCell>
                        <span className="font-mono text-xs">
                          {typeof item.key === 'string' ? 
                            item.key.substring(0, 8) + '...' + item.key.substring(item.key.length - 8) : 
                            item.key}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.isActive ? (
                          <Chip color="success" variant="flat" size="sm">Активирован</Chip>
                        ) : (
                          <Chip color="warning" variant="flat" size="sm">Не активирован</Chip>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(item.updatedAt).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Копировать ключ">
                            <Button 
                              isIconOnly 
                              size="sm" 
                              variant="light"
                              onClick={() => copyToClipboard(item.key)}
                            >
                              <CopyIcon className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardBody>
            <CardFooter>
              <div className="flex w-full justify-center">
                <Pagination
                  showControls
                  total={totalPages}
                  initialPage={1}
                  page={page}
                  onChange={setPage}
                />
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
