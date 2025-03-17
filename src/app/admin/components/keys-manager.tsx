"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { 
  KeyIcon,
  CopyIcon,
  CheckIcon,
  PlusIcon,
  DownloadIcon,
  ListIcon,
  InfoIcon
} from "lucide-react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { motion } from "framer-motion";
import { api } from "@/trpc/react";
import { Pagination } from "@heroui/pagination";
import generateAppleWatchAvatar from "@/lib/utils/avatar-generator";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function KeysManager() {
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [page, setPage] = useState(1);
  const [keysPerPage] = useState(10);
  const [batchSize, setBatchSize] = useState(5);

  // Получение списка ключей
  const keysQuery = api.user.getAllKeys.useQuery(undefined, {
    refetchInterval: false,
  });

  // Рефетч ключей после создания нового
  useEffect(() => {
    if (generatedKey || generatedKeys.length > 0) {
      keysQuery.refetch();
    }
  }, [generatedKey, generatedKeys]);

  // Создание нового ключа
  const createKeyMutation = api.user.createActivationKey.useMutation({
    onSuccess: (data) => {
      setGeneratedKey(data.key);
      setIsGeneratingKey(false);
      // Автоматический рефетч списка ключей
      keysQuery.refetch();
    },
    onError: () => {
      setIsGeneratingKey(false);
      alert("Не удалось создать ключ активации");
    },
  });

  // Создание пачки ключей
  const createBatchKeysMutation = api.user.createBatchActivationKeys.useMutation({
    onSuccess: (data) => {
      setGeneratedKeys(data.keys);
      setIsGeneratingBatch(false);
      // Автоматический рефетч списка ключей
      keysQuery.refetch();
    },
    onError: () => {
      setIsGeneratingBatch(false);
      alert("Не удалось создать пачку ключей активации");
    },
  });

  // Обработка создания ключа
  const handleCreateKey = async () => {
    setIsGeneratingKey(true);
    createKeyMutation.mutate({});
  };

  // Обработка создания пачки ключей
  const handleCreateBatchKeys = async () => {
    if (batchSize <= 0 || batchSize > 100) {
      alert("Количество ключей должно быть от 1 до 100");
      return;
    }
    
    setIsGeneratingBatch(true);
    createBatchKeysMutation.mutate({ count: batchSize });
  };

  // Копирование ключа в буфер обмена
  const copyToClipboard = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Экспорт ключей в TXT файл
  const exportKeysToTxt = () => {
    if (!generatedKeys.length) return;
    
    const keysText = generatedKeys.join('\n');
    const blob = new Blob([keysText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `activation_keys_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Фильтрация ключей
  const filteredKeys = keysQuery.data ? keysQuery.data.filter((key: any) => {
    if (selectedTab === "active") return key.isUsed;
    if (selectedTab === "inactive") return !key.isUsed;
    return true;
  }) : [];

  // Пагинация
  const indexOfLastKey = page * keysPerPage;
  const indexOfFirstKey = indexOfLastKey - keysPerPage;
  const currentKeys = filteredKeys.slice(indexOfFirstKey, indexOfLastKey);
  const totalPages = Math.ceil(filteredKeys.length / keysPerPage);

  // Создать моковые данные если API еще не реализован
  const mockKeys = [
    { id: 1, key: "XXXX-YYYY-ZZZZ-1111", isUsed: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), user: { name: "Пользователь 1", email: "user1@example.com" } },
    { id: 2, key: "XXXX-YYYY-ZZZZ-2222", isUsed: false, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), user: { name: "Пользователь 2", email: "user2@example.com" } },
    { id: 3, key: "XXXX-YYYY-ZZZZ-3333", isUsed: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), user: { name: "Пользователь 3", email: "user3@example.com" } },
    { id: 4, key: "XXXX-YYYY-ZZZZ-4444", isUsed: false, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), user: { name: "Пользователь 4", email: "user4@example.com" } },
    { id: 5, key: "XXXX-YYYY-ZZZZ-5555", isUsed: true, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), user: { name: "Пользователь 5", email: "user5@example.com" } },
  ];

  const keysToDisplay = keysQuery.data?.length ? currentKeys : mockKeys;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.3 }}
      className="container mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div 
          variants={fadeIn}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 order-2 lg:order-1"
        >
          <Card className="shadow-md">
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
                <p className="text-sm font-semibold">Создать пачку ключей</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="Количество"
                    value={batchSize.toString()}
                    onChange={(e) => setBatchSize(parseInt(e.target.value) || 0)}
                    size="sm"
                  />
                  <Button
                    onClick={handleCreateBatchKeys}
                    isDisabled={isGeneratingBatch}
                    isLoading={isGeneratingBatch}
                    color="primary"
                    size="sm"
                  >
                    Создать
                  </Button>
                </div>
                <p className="text-xs text-default-500">
                  <InfoIcon className="h-3 w-3 inline mr-1" />
                  Максимум 100 ключей за раз
                </p>
              </div>
              
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
                    Использованные
                  </Button>
                  
                  <Button 
                    color={selectedTab === "inactive" ? "warning" : "default"}
                    variant={selectedTab === "inactive" ? "solid" : "light"}
                    fullWidth
                    size="sm"
                    onClick={() => setSelectedTab("inactive")}
                    className="justify-start"
                    startContent={<KeyIcon className="h-4 w-4" />}
                  >
                    Не использованные
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
          {generatedKey && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-4 bg-success-50 border border-success-200 rounded-lg"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-success">Ключ успешно создан!</span>
                <Button
                  size="sm"
                  variant="flat"
                  color="success"
                  onClick={() => copyToClipboard(generatedKey)}
                  startContent={copied ? 
                    <CheckIcon className="h-4 w-4" /> : 
                    <CopyIcon className="h-4 w-4" />
                  }
                >
                  {copied ? "Скопировано" : "Копировать"}
                </Button>
              </div>
              <code className="block p-2 bg-white dark:bg-gray-800 rounded mt-2 text-success font-mono">
                {generatedKey}
              </code>
            </motion.div>
          )}
          
          {generatedKeys.length > 0 && (
            <div className="mt-4 p-4 bg-default-50 border border-default-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Сгенерированные ключи:</span>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onClick={exportKeysToTxt}
                  startContent={<DownloadIcon className="h-4 w-4" />}
                >
                  Экспорт
                </Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                {generatedKeys.map((key: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                    <code className="text-xs">{key}</code>
                    <Button
                      size="sm"
                      isIconOnly
                      variant="light"
                      onClick={() => copyToClipboard(key)}
                    >
                      {copied ? 
                        <CheckIcon className="h-3 w-3 text-success" /> : 
                        <CopyIcon className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Card className="shadow-md mb-6">
            <CardHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <KeyIcon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Ключи активации</h2>
              </div>
              <p className="text-sm text-default-500">
                Управление ключами активации для новых пользователей
              </p>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant={selectedTab === "all" ? "solid" : "flat"}
                    color={selectedTab === "all" ? "primary" : "default"}
                    size="sm"
                    onClick={() => setSelectedTab("all")}
                    startContent={<ListIcon className="h-4 w-4" />}
                  >
                    Все ключи
                  </Button>
                  <Button
                    variant={selectedTab === "active" ? "solid" : "flat"}
                    color={selectedTab === "active" ? "success" : "default"}
                    size="sm"
                    onClick={() => setSelectedTab("active")}
                    startContent={<CheckIcon className="h-4 w-4" />}
                  >
                    Активированные
                  </Button>
                  <Button
                    variant={selectedTab === "inactive" ? "solid" : "flat"}
                    color={selectedTab === "inactive" ? "warning" : "default"}
                    size="sm"
                    onClick={() => setSelectedTab("inactive")}
                    startContent={<KeyIcon className="h-4 w-4" />}
                  >
                    Неактивированные
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tooltip content="Обновить список ключей">
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onClick={() => keysQuery.refetch()}
                      isLoading={keysQuery.isRefetching}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </Button>
                  </Tooltip>
                </div>
              </div>
              
              {keysQuery.isLoading ? (
                <div className="flex flex-col items-center py-8">
                  <Spinner />
                  <p className="mt-2">Загрузка ключей...</p>
                </div>
              ) : (
                <Table 
                  removeWrapper
                  aria-label="Таблица ключей активации"
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
                    <TableColumn>КЛЮЧ</TableColumn>
                    <TableColumn>СТАТУС</TableColumn>
                    <TableColumn>СОЗДАН</TableColumn>
                    <TableColumn>АКТИВИРОВАН</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {keysToDisplay.map((keyItem: any, index: number) => (
                      <TableRow key={keyItem.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <KeyIcon className="h-4 w-4 text-default-400" />
                            <code className="font-mono text-xs">{keyItem.key}</code>
                            <Button
                              size="sm"
                              isIconOnly
                              variant="light"
                              onClick={() => copyToClipboard(keyItem.key)}
                            >
                              {copied ? 
                                <CheckIcon className="h-3 w-3 text-success" /> : 
                                <CopyIcon className="h-3 w-3" />
                              }
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            color={keyItem.isActive ? "success" : "warning"} 
                            variant="flat"
                            size="sm"
                          >
                            {keyItem.isActive ? "Активирован" : "Не активирован"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{new Date(keyItem.createdAt).toLocaleDateString("ru-RU")}</p>
                        </TableCell>
                        <TableCell>
                          {keyItem.isUsed && keyItem.user ? (
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full overflow-hidden">
                                {(() => {
                                  const avatarData = generateAppleWatchAvatar(
                                    keyItem.user.name || "Пользователь", 
                                    keyItem.user.email || `user-${keyItem.id}`
                                  );
                                  return <div dangerouslySetInnerHTML={{ __html: avatarData.svg.dark }} />;
                                })()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-small font-medium text-default-600">
                                  {keyItem.user.name}
                                </span>
                                <span className="text-xs text-default-400">
                                  {keyItem.user.email}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
