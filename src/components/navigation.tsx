"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { UserRole } from "@prisma/client";
import { useTheme } from "@/providers/theme-provider";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { 
  SunIcon, 
  MoonIcon, 
  UserIcon, 
  DollarSignIcon, 
  RussianRubleIcon,
  LayoutDashboardIcon, 
  HandshakeIcon,
  ShieldAlertIcon,
  CreditCardIcon,
  SmartphoneIcon,
  MessageSquareIcon,
  BanknoteIcon,
  ShieldIcon,
  UserCheckIcon,
  WalletIcon,
  CopyIcon,
  CheckIcon,
  LogOutIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/trpc/react";

export function Navigation() {
  const { user, token, logout } = useAuthStore();
  const isAuthenticated = !!user; // Проверка по наличию пользователя
  
  const { theme, setTheme } = useTheme();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [commissionRate, setCommissionRate] = useState(0);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [isDeposited, setIsDeposited] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const router = useRouter();

  // Простая функция для отображения уведомлений
  const showToast = (title: string, description: string, variant: 'success' | 'error' = 'success') => {
    // Временно используем alert для уведомлений
    alert(`${title}: ${description}`);
  };

  // Мутация для обновления кошелька пользователя
  const updateWalletMutation = api.user.updateWallet.useMutation();
  
  // Обработчик успешного обновления кошелька
  useEffect(() => {
    if (updateWalletMutation.isSuccess) {
      showToast(
        "Успешно",
        "Адрес кошелька сохранен",
        "success"
      );
      // После успешного обновления кошелька, обновляем данные пользователя
      fetchUserData.refetch().catch(() => {
        // Игнорируем ошибки обновления данных
      });
    }
    
    if (updateWalletMutation.isError) {
      showToast(
        "Ошибка",
        updateWalletMutation.error?.message || "Не удалось обновить адрес кошелька",
        "error"
      );
    }
  }, [updateWalletMutation.isSuccess, updateWalletMutation.isError, updateWalletMutation.error?.message]);

  // Запрос для получения настроек системы
  const { data: systemSettings } = api.user.getSystemSettings.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    retry: false,  // Не повторять запрос при ошибке
  });
  
  // Обработка данных настроек системы
  useEffect(() => {
    if (systemSettings) {
      setCommissionRate(systemSettings.commissionRate);
    }
  }, [systemSettings]);

  // Проверка на наличие новых депозитов
  const { data: depositData } = api.user.checkDeposits.useQuery(
    { walletAddress: walletAddress || "" },
    {
      enabled: isAuthenticated && isDepositModalOpen && !!walletAddress,
      refetchInterval: isDepositModalOpen ? 5000 : false, // проверять каждые 5 секунд пока окно открыто
      retry: false,  // Не повторять запрос при ошибке
    }
  );
  
  // Обработка данных о новых депозитах
  useEffect(() => {
    if (depositData && depositData.newDeposit) {
      setIsDeposited(true);
      setDepositAmount(depositData.amount);
      setTimeout(() => {
        router.refresh(); // обновить данные пользователя
      }, 3000);
    }
  }, [depositData, router]);

  // Получить актуальные данные пользователя через API
  const fetchUserData = api.user.getUserData.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    retry: false,  // Не повторять запрос при ошибке
  });
  
  // Обработка полученных данных пользователя
  useEffect(() => {
    const userData = fetchUserData.data;
    if (userData && userData.walletAddress) {
      setWalletAddress(userData.walletAddress);
    }
  }, [fetchUserData.data]);

  // Загрузка начальных данных из auth контекста
  useEffect(() => {
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
    }
  }, [user]);

  // Функция безопасного получения данных пользователя
  const safeUserData = () => {
    // Сначала пробуем получить данные из API запроса
    if (fetchUserData.data) {
      return fetchUserData.data;
    }
    // Если API недоступно, используем данные из AuthContext
    if (user) {
      return user;
    }
    // Если нет данных, возвращаем значения по умолчанию
    return {
      id: 0,
      name: "Гость",
      balanceUSDT: 0,
      balanceRUB: 0,
      role: UserRole.USER
    };
  };

  // Открытие окна пополнения
  const handleOpenDepositModal = () => {
    setIsDepositModalOpen(true);
    setIsDeposited(false);
    setDepositAmount(0);
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
    }
  };

  // Сохранение адреса кошелька
  const handleSaveWallet = () => {
    if (walletAddress.trim()) {
      updateWalletMutation.mutate({ walletAddress: walletAddress.trim() });
    } else {
      showToast(
        "Ошибка",
        "Адрес кошелька не может быть пустым",
        "error"
      );
    }
  };

  // Копирование адреса кошелька
  const handleCopyWallet = () => {
    if (systemSettings?.systemWalletAddress) {
      navigator.clipboard.writeText(systemSettings.systemWalletAddress);
      showToast(
        "Успешно скопировано",
        "Адрес кошелька скопирован в буфер обмена",
      );
    }
  };

  // Список пунктов меню для авторизованных пользователей
  const menuItems = [
    { href: "/dashboard", icon: <LayoutDashboardIcon className="h-4 w-4" />, label: "Дашборд" },
    { href: "/deals", icon: <HandshakeIcon className="h-4 w-4" />, label: "Сделки" },
    { href: "/disputes", icon: <ShieldAlertIcon className="h-4 w-4" />, label: "Споры" },
    { href: "/requisites", icon: <CreditCardIcon className="h-4 w-4" />, label: "Реквизиты" },
    { href: "/devices", icon: <SmartphoneIcon className="h-4 w-4" />, label: "Устройства" },
    { href: "/messages", icon: <MessageSquareIcon className="h-4 w-4" />, label: "Сообщения" },
    { href: "/withdrawals", icon: <BanknoteIcon className="h-4 w-4" />, label: "Выплаты" },
  ];

  return (
    <>
      <Navbar maxWidth="xl" className="relative">
        <NavbarBrand>
          <Link href="/" className="font-bold text-xl text-inherit">
            IDE<span className="text-primary">X</span>
          </Link>
        </NavbarBrand>
        
        {isAuthenticated && (
          <NavbarContent className="hidden md:flex gap-4" justify="center">
            {menuItems.map((item) => (
              <NavbarItem key={item.href}>
                <Link 
                  href={item.href} 
                  className="text-foreground flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  {item.icon}
                  {item.label}
                </Link>
              </NavbarItem>
            ))}
          </NavbarContent>
        )}
        
        <NavbarContent justify="end">
          <NavbarItem className="flex gap-2">
            <Button 
              isIconOnly 
              variant="light" 
              onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Переключить тему"
            >
              {theme === "dark" ? 
                <SunIcon className="h-5 w-5" /> : 
                <MoonIcon className="h-5 w-5" />
              }
            </Button>
            
            {isAuthenticated ? (
              <Dropdown>
                <DropdownTrigger>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-sm font-medium">{safeUserData().name}</span>
                      <div className="flex items-center gap-1">
                        <DollarSignIcon className="h-3 w-3 text-success" />
                        <span className="text-xs text-default-500">
                          {safeUserData().balanceUSDT?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                    <Avatar
                      showFallback
                      src=""
                      name={safeUserData().name?.charAt(0) || "П"}
                      className="cursor-pointer"
                      size="sm"
                    />
                  </div>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Меню пользователя"
                  className="min-w-[240px]"
                >
                  {/* Информация о пользователе */}
                  <DropdownSection>
                    <DropdownItem key="user-info" isReadOnly className="cursor-default opacity-100">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{safeUserData().name}</span>
                          <span className="text-xs text-default-500">ID: {safeUserData().id}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-default-500">USDT:</span>
                            <span className="text-xs font-medium flex items-center gap-1">
                              <DollarSignIcon className="h-3 w-3 text-success" />
                              {safeUserData().balanceUSDT?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-default-500">RUB:</span>
                            <span className="text-xs font-medium flex items-center gap-1">
                              <RussianRubleIcon className="h-3 w-3 text-primary" />
                              {safeUserData().balanceRUB?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownItem>
                  </DropdownSection>
                  
                  {/* Меню навигации только для мобильной версии */}
                  <DropdownSection className="md:hidden">
                    {menuItems.map((item) => (
                      <DropdownItem key={`mobile-${item.href}`}>
                        <Link href={item.href} className="w-full flex items-center gap-2">
                          {item.icon}
                          {item.label}
                        </Link>
                      </DropdownItem>
                    ))}
                  </DropdownSection>
                  
                  {/* Профиль и пополнение */}
                  <DropdownSection>
                    <DropdownItem key="profile">
                      <Link href="/profile" className="w-full flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Профиль
                      </Link>
                    </DropdownItem>
                    
                    <DropdownItem key="deposit" onPress={handleOpenDepositModal}>
                      <div className="w-full flex items-center gap-2">
                        <WalletIcon className="h-4 w-4" />
                        Пополнить баланс
                      </div>
                    </DropdownItem>
                  </DropdownSection>
                  
                  {/* Выход */}
                  <DropdownSection>
                    <DropdownItem key="logout" onPress={() => logout()} color="danger">
                      <div className="w-full flex items-center gap-2 text-danger">
                        <LogOutIcon className="h-4 w-4" />
                        Выйти
                      </div>
                    </DropdownItem>
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Button as={Link} href="/login" color="primary">
                Войти
              </Button>
            )}
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Модальное окно для пополнения баланса */}
      <Modal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Пополнение баланса USDT</h3>
            <p className="text-sm text-default-500">
              Отправьте USDT (TRC20) на указанный адрес
            </p>
          </ModalHeader>
          <ModalBody>
            <AnimatePresence>
              {!isDeposited ? (
                <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4"
                >
                  {/* Форма ввода адреса кошелька пользователя */}
                  {!walletAddress && (
                    <div className="flex flex-col gap-2 p-3 border dark:border-primary-500 rounded-lg bg-default-50">
                      <h4 className="text-sm font-medium">Настройка кошелька</h4>
                      <p className="text-xs text-default-500">
                        Для отслеживания ваших переводов, укажите ваш TRC20 кошелек, с которого будете отправлять USDT
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ваш TRC20 кошелек"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          size="sm"
                          className="flex-1"
                        />
                        <Button 
                          color="primary" 
                          size="sm" 
                          onPress={handleSaveWallet}
                          isLoading={updateWalletMutation.isPending}
                        >
                          Сохранить
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Блок с QR-кодом и адресом */}
                  <div className="flex flex-col items-center gap-4 p-4 border border-zinc-500/20 rounded-lg">
                    <div className="bg-white p-3 rounded-lg">
                      {systemSettings?.systemWalletAddress && (
                        <QRCode value={systemSettings.systemWalletAddress} size={180} />
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <p className="text-sm text-center">Отправьте USDT на этот адрес:</p>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={systemSettings?.systemWalletAddress || ""}
                          className="flex-1 font-mono text-sm"
                          size="sm"
                        />
                        <Button
                          isIconOnly
                          variant="flat"
                          size="sm"
                          onPress={handleCopyWallet}
                        >
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Информационная плашка о комиссии */}
                  <div className="flex flex-col gap-1 p-3 border border-zinc-500/20 rounded-lg bg-default-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Комиссия:</p>
                      <p className="text-sm font-semibold">{commissionRate}%</p>
                    </div>
                    <p className="text-xs text-default-500">
                      Примечание: принимаются только переводы Tether (USDT) в сети TRC20. 
                      Смарт-контракты не принимаются.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-4 p-6"
                >
                  <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckIcon className="h-8 w-8 text-success" />
                  </div>
                  <h4 className="text-lg font-semibold text-center">Баланс пополнен</h4>
                  <p className="text-center">
                    Ваш баланс успешно пополнен на сумму{" "}
                    <span className="font-semibold">{depositAmount.toFixed(2)} USDT</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsDepositModalOpen(false)}>
              {isDeposited ? "Закрыть" : "Отмена"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}