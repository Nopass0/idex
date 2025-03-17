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
import { Skeleton } from "@heroui/skeleton";
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
  LogOutIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CrownIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/trpc/react";
import generateAppleWatchAvatar from "@/lib/utils/avatar-generator";

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
  const [buyRate, setBuyRate] = useState<number | null>(null);
  const [sellRate, setSellRate] = useState<number | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const router = useRouter();

  // Функция для загрузки курсов USDT/RUB с Bybit через API-маршрут Next.js
  const fetchRates = async () => {
    setIsLoadingRates(true);
    try {
      // Используем локальный API-маршрут, который делает запросы к Bybit от имени сервера
      const response = await fetch('/api/get-usdt-rates');
      
      if (!response.ok) {
        throw new Error(`Ошибка запроса к API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Проверяем наличие данных в ответе
      if (data.buyRate && data.sellRate) {
        console.log('Получены курсы с API:', { 
          buyRate: data.buyRate, 
          sellRate: data.sellRate,
          timestamp: data.timestamp
        });
        
        // Устанавливаем курсы в состояние компонента
        setBuyRate(data.buyRate);
        setSellRate(data.sellRate);
      } else {
        throw new Error('Некорректный ответ от API: отсутствуют данные о курсах');
      }
    } catch (error) {
      console.error('Ошибка при получении курсов:', error);
      
      // В случае ошибки используем фиксированные значения
      // Используем предыдущие значения, если они есть, иначе устанавливаем дефолтные
      setBuyRate(prevBuyRate => prevBuyRate || 87.30);
      setSellRate(prevSellRate => prevSellRate || 90.11);
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Интервал обновления данных (в миллисекундах)
  const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 минуты

  // Загрузка курсов при монтировании компонента и периодическое обновление
  useEffect(() => {
    fetchRates();
    
    // Обновляем курсы каждые 2 минуты
    const interval = setInterval(fetchRates, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

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

  // Функция безопасного доступа к данным пользователя
  function safeUserData() {
    const userState = useAuthStore.getState().user;
    // Значения по умолчанию
    const defaultUserData = {
      id: 0,
      name: "Пользователь",
      email: "",
      role: "USER" as UserRole,
      balanceUSDT: 0,
      balanceRUB: 0,
      walletAddress: null as string | null
    };
    
    // Если пользователь не авторизован, возвращаем значения по умолчанию
    if (!userState) return defaultUserData;
    
    // Возвращаем объект с гарантированными полями
    return {
      id: userState.id || 0,
      name: userState.name || "Пользователь",
      email: (userState as any).email || "",
      role: userState.role || "USER",
      balanceUSDT: userState.balanceUSDT || 0,
      balanceRUB: userState.balanceRUB || 0,
      walletAddress: (userState as any).walletAddress || null
    };
  }

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

  // Компонент для отображения курса с индикатором загрузки
  const RateDisplay = ({ icon, rate, label } : { icon: React.ReactNode, rate: number | null, label: string }) => (
    <div className="flex items-center gap-1">
      {icon}
      {isLoadingRates ? (
        <Skeleton className="h-3 w-12 rounded" />
      ) : (
        <span className="text-xs text-default-500">
          {rate?.toFixed(2) || "0.00"} ₽
        </span>
      )}
    </div>
  );

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
                    {/* Блок с курсами валют - отображается слева от профиля */}
                    <div className="hidden md:flex flex-col items-end mr-3 border-r pr-3 border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col gap-0.5">
                        <RateDisplay 
                          icon={<ArrowUpIcon className="h-3 w-3 text-green-500" />} 
                          rate={buyRate} 
                          label="Покупка" 
                        />
                        <RateDisplay 
                          icon={<ArrowDownIcon className="h-3 w-3 text-red-500" />} 
                          rate={sellRate} 
                          label="Продажа" 
                        />
                      </div>
                    </div>
                    
                    {/* Блок с информацией о пользователе */}
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-sm font-medium">#{safeUserData().id}</span>
                      <div className="flex items-center gap-1">
                        <DollarSignIcon className="h-3 w-3 text-success" />
                        <span className="text-xs text-default-500">
                          {safeUserData().balanceUSDT?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                    <Avatar
                      showFallback
                      src={(() => {
                        // Генерация SVG-аватарки на основе имени и ID пользователя
                        const userData = safeUserData();
                        if (userData && userData.name) {
                          const avatarData = generateAppleWatchAvatar(
                            userData.name, 
                            userData.email || `user-${userData.id}`
                          );
                          return `data:image/svg+xml;utf8,${encodeURIComponent(avatarData.svg.color)}`;
                        }
                        return "";
                      })()}
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
                          {/* Добавляем информацию о курсах в выпадающее меню */}
                          <Divider className="my-1" />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-default-500">Покупка:</span>
                            <span className="text-xs font-medium flex items-center gap-1">
                              <ArrowUpIcon className="h-3 w-3 text-green-500" />
                              {isLoadingRates ? (
                                <Skeleton className="h-3 w-12 rounded" />
                              ) : (
                                `${Number(buyRate)?.toFixed(2) || "0.00"} ₽`
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-default-500">Продажа:</span>
                            <span className="text-xs font-medium flex items-center gap-1">
                              <ArrowDownIcon className="h-3 w-3 text-red-500" />
                              {isLoadingRates ? (
                                <Skeleton className="h-3 w-12 rounded" />
                              ) : (
                                `${Number(sellRate)?.toFixed(2) || "0.00"} ₽`
                              )}
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
                    <DropdownItem key="profile" className="h-14 gap-2">
                      <User 
                        name={safeUserData().name} 
                        role={safeUserData().role}
                        userId={safeUserData().id}
                        email={safeUserData().email}
                      />
                    </DropdownItem>
                    
                    <DropdownItem key="deposit" onPress={handleOpenDepositModal}>
                      <div className="w-full flex items-center gap-2">
                        <WalletIcon className="h-4 w-4" />
                        Пополнить баланс
                      </div>
                    </DropdownItem>

                    {user?.role === UserRole.ADMIN ? (
                      <DropdownItem key="admin" onPress={() => router.push('/admin')}>
                        <div className="w-full flex items-center gap-2">
                          <CrownIcon className="h-4 w-4" />
                          Админ-панель
                        </div>
                      </DropdownItem>
                    ) : null}
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

function User({ name, role, userId, email }: { name: string, role: UserRole, userId: number, email: string }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar
        showFallback
        src={(() => {
          // Генерация SVG-аватарки на основе имени и ID пользователя
          const avatarData = generateAppleWatchAvatar(
            name, 
            email || `user-${userId}`
          );
          return `data:image/svg+xml;utf8,${encodeURIComponent(avatarData.svg.color)}`;
        })()}
        name={name.charAt(0)}
        className="cursor-pointer"
        size="sm"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs text-default-500">{role}</span>
      </div>
    </div>
  );
}