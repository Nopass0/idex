"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { InfoIcon, EyeIcon, EyeOffIcon } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Пожалуйста, введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать не менее 6 символов"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, error, clearError, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Если пользователь уже авторизован, перенаправляем на профиль
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, router]);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = async (data: LoginFormData) => {
    // Предотвращаем повторную отправку формы
    if (submitting) return;
    
    try {
      // Очищаем ошибки и устанавливаем состояние отправки
      clearError();
      setFormError(null);
      setSubmitting(true);
      
      // Вызываем функцию входа
      await login(data.email, data.password);
      
      // После успешного входа перенаправление произойдет через useEffect
    } catch (err) {
      console.error("Ошибка входа:", err);
      setFormError(err instanceof Error ? err.message : "Не удалось войти. Пожалуйста, попробуйте снова.");
      setSubmitting(false);
    }
  };

  // Отображаем состояние загрузки на кнопке
  const isButtonLoading = isLoading || submitting;
  const buttonText = isButtonLoading ? "Подождите..." : "Войти";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Input
          {...register("email")}
          label="Email"
          type="email"
          placeholder="email@example.com"
          errorMessage={errors.email?.message}
          isInvalid={!!errors.email}
          startContent={errors.email && <InfoIcon size={16} className="text-danger" />}
          isDisabled={isButtonLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Input
          {...register("password")}
          label="Пароль"
          placeholder="Введите пароль"
          type={isVisible ? "text" : "password"}
          errorMessage={errors.password?.message}
          isInvalid={!!errors.password}
          startContent={errors.password && <InfoIcon size={16} className="text-danger" />}
          endContent={
            <button 
              type="button" 
              className="focus:outline-none" 
              onClick={toggleVisibility}
              disabled={isButtonLoading}
            >
              {isVisible ? 
                <EyeOffIcon size={16} className="text-default-400" /> : 
                <EyeIcon size={16} className="text-default-400" />
              }
            </button>
          }
          isDisabled={isButtonLoading}
        />
      </div>
      
      {(error || formError) && (
        <p className="text-center text-danger">{error || formError}</p>
      )}
      
      <Button 
        type="submit" 
        color="primary" 
        fullWidth
        isLoading={isButtonLoading}
        isDisabled={isButtonLoading}
      >
        {buttonText}
      </Button>
    </form>
  );
}
