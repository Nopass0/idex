"use client";

import { useState } from "react";
import { Card } from "@heroui/card";
import { CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

// Определяем тип для Key, который может быть string | number
type Key = string | number;

export type AuthTabsProps = {
  defaultTab?: "login" | "register";
};

export function AuthTabs({ defaultTab = "login" }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-100px)] p-4 animate-fadeIn">
      <div className="transform animate-scaleIn">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col gap-1 items-center">
            <h1 className="text-2xl font-bold">
              {activeTab === "login" ? "Добро пожаловать!" : "Создание аккаунта"}
            </h1>
            <p className="text-center text-small text-default-500 animate-fadeInDelay">
              {activeTab === "login" 
                ? "Введите данные для входа в систему" 
                : "Заполните данные для создания нового аккаунта"}
            </p>
          </CardHeader>
          <CardBody>
            <Tabs 
              selectedKey={activeTab} 
              onSelectionChange={(key: Key) => setActiveTab(key.toString())}
              fullWidth
              size="lg"
              aria-label="Вкладки аутентификации"
            >
              <Tab key="login" title="Вход">
                <div className={`${activeTab === "login" ? "animate-fadeIn" : ""}`}>
                  <LoginForm />
                </div>
              </Tab>
              <Tab key="register" title="Регистрация">
                <div className={`${activeTab === "register" ? "animate-fadeIn" : ""}`}>
                  <RegisterForm onSuccess={() => setActiveTab("login")} />
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
