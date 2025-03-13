"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { useAuth } from "@/providers/auth-provider";
import { InfoIcon, KeyIcon } from "lucide-react";

const activateSchema = z.object({
  key: z.string().min(1, "Ключ активации обязателен"),
});

type ActivateFormData = z.infer<typeof activateSchema>;

export function ActivateForm() {
  const { activateAccount, isGuest, error, clearError, isLoading } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<ActivateFormData>({
    resolver: zodResolver(activateSchema),
    defaultValues: {
      key: "",
    },
  });

  const onSubmit = async (data: ActivateFormData) => {
    try {
      clearError();
      setFormError(null);
      await activateAccount(data.key);
      
      setActivationSuccess(true);
      reset();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Активация не удалась. Пожалуйста, попробуйте снова.");
    }
  };

  if (!isGuest) {
    return (
      <Card>
        <CardHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">Статус аккаунта</h3>
          <p className="text-small text-default-500">Ваш аккаунт уже активирован</p>
        </CardHeader>
        <CardBody>
          <p className="text-success">
            Ваша учетная запись активирована. У вас полный доступ к системе.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1">
        <h3 className="text-xl font-bold">Активация аккаунта</h3>
        <p className="text-small text-default-500">
          Введите ключ активации для получения полного доступа
        </p>
      </CardHeader>
      <CardBody>
        {activationSuccess ? (
          <div className="text-success flex flex-col items-center gap-2">
            <KeyIcon size={32} />
            <p>Ваш аккаунт успешно активирован!</p>
            <p className="text-small text-default-500">
              Обновите страницу, чтобы увидеть изменения
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {(error || formError) && (
              <div className="text-danger text-small flex items-center gap-1">
                <InfoIcon className="h-4 w-4" />
                <span>{error || formError}</span>
              </div>
            )}
            
            <Input
              {...register("key")}
              label="Ключ активации"
              placeholder="Введите ключ активации"
              variant="bordered"
              startContent={<KeyIcon className="h-4 w-4 text-default-400" />}
              isInvalid={!!errors.key}
              errorMessage={errors.key?.message}
              className="mb-4"
            />
            
            <Button 
              type="submit" 
              color="primary" 
              className="w-full" 
              isLoading={isLoading}
            >
              {isLoading ? "Активация..." : "Активировать аккаунт"}
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
