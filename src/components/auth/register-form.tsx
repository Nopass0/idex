"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { InfoIcon, EyeIcon, EyeOffIcon } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(3, "Имя должно содержать не менее 3 символов"),
  email: z.string().email("Пожалуйста, введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать не менее 6 символов"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register: registerUser, error, clearError, isLoading } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      setFormError(null);
      await registerUser(data.name, data.email, data.password);
      
      reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Регистрация не удалась. Пожалуйста, попробуйте снова.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      {(error || formError) && (
        <div className="text-danger text-small flex items-center gap-1 mb-4">
          <InfoIcon className="h-4 w-4" />
          <span>{error || formError}</span>
        </div>
      )}

      <Input
        {...register("name")}
        label="Имя"
        placeholder="Ваше имя"
        variant="bordered"
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message}
        className="mb-4"
      />

      <Input
        {...register("email")}
        label="Email"
        placeholder="you@example.com"
        type="email"
        variant="bordered"
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message}
        className="mb-4"
      />

      <Input
        {...register("password")}
        label="Пароль"
        placeholder="••••••"
        variant="bordered"
        endContent={
          <button type="button" onClick={togglePasswordVisibility} className="focus:outline-none">
            {isPasswordVisible ? (
              <EyeOffIcon className="h-4 w-4 text-default-400" />
            ) : (
              <EyeIcon className="h-4 w-4 text-default-400" />
            )}
          </button>
        }
        type={isPasswordVisible ? "text" : "password"}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message}
        className="mb-4"
      />

      <Input
        {...register("confirmPassword")}
        label="Подтверждение пароля"
        placeholder="••••••"
        variant="bordered"
        endContent={
          <button type="button" onClick={toggleConfirmPasswordVisibility} className="focus:outline-none">
            {isConfirmPasswordVisible ? (
              <EyeOffIcon className="h-4 w-4 text-default-400" />
            ) : (
              <EyeIcon className="h-4 w-4 text-default-400" />
            )}
          </button>
        }
        type={isConfirmPasswordVisible ? "text" : "password"}
        isInvalid={!!errors.confirmPassword}
        errorMessage={errors.confirmPassword?.message}
        className="mb-4"
      />

      <Button 
        type="submit" 
        color="primary" 
        className="w-full" 
        isLoading={isLoading}
      >
        {isLoading ? "Создание аккаунта..." : "Зарегистрироваться"}
      </Button>
    </form>
  );
}
