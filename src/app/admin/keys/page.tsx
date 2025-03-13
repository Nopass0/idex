"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/trpc/react";
import { redirect } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Tooltip } from "@heroui/tooltip";
import { Divider } from "@heroui/divider";
import { 
  AlertCircleIcon, 
  KeyIcon,
  InfoIcon,
  CopyIcon,
  CheckIcon,
  PlusIcon,
  ListIcon
} from "lucide-react";

export default function KeysManagementPage() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createKeyMutation = api.auth.createActivationKey.useMutation({
    onSuccess: (data) => {
      setGeneratedKey(data.key);
      setIsGeneratingKey(false);
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
  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2">
          <KeyIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Управление ключами активации</h1>
        </div>
        <p className="text-default-500">Создание и управление ключами для активации пользователей</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
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
                startContent={<PlusIcon className="h-4 w-4" />}
              >
                Создать ключ
              </Button>
              
              <Button 
                color="default"
                variant="flat"
                fullWidth
                startContent={<ListIcon className="h-4 w-4" />}
              >
                Список ключей
              </Button>
            </CardBody>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card className="shadow-md">
            <CardHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">Создание ключа активации</h2>
              <p className="text-default-500">
                Создайте ключ для активации учетной записи пользователя
              </p>
            </CardHeader>
            <Divider />
            <CardBody className="p-6">
              {generatedKey ? (
                <div className="space-y-6">
                  <div className="p-4 bg-success-50 rounded-lg border border-success-200 text-success flex items-center gap-2">
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
                        <div className="flex items-center gap-2 bg-default-50 p-3 rounded-lg font-mono text-sm">
                          <span className="flex-1 break-all">{generatedKey}</span>
                          <Tooltip content={copied ? "Скопировано!" : "Скопировать в буфер обмена"}>
                            <Button 
                              isIconOnly 
                              size="sm" 
                              variant="light" 
                              onClick={copyToClipboard}
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
                  
                  <div className="flex gap-3">
                    <Button 
                      color="primary"
                      onClick={handleCreateKey}
                      isDisabled={isGeneratingKey}
                      isLoading={isGeneratingKey}
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
              ) : (
                <div className="flex flex-col items-center justify-center py-10 space-y-6">
                  <div className="text-center space-y-2">
                    <KeyIcon className="h-12 w-12 text-default-300 mx-auto" />
                    <h3 className="text-xl font-semibold">Создание ключа активации</h3>
                    <p className="text-default-500 max-w-md">
                      Ключи активации используются для активации учетных записей пользователей. 
                      Каждый ключ можно использовать только один раз.
                    </p>
                  </div>
                  <Button 
                    color="primary"
                    size="lg"
                    onClick={handleCreateKey}
                    isDisabled={isGeneratingKey}
                    isLoading={isGeneratingKey}
                    startContent={isGeneratingKey ? null : <KeyIcon className="h-4 w-4" />}
                  >
                    {isGeneratingKey ? "Создание..." : "Создать новый ключ"}
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
