"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Tabs, Tab } from "@heroui/tabs";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { Select, SelectItem } from "@heroui/select";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboardIcon, 
  TrendingUpIcon, 
  HandshakeIcon, 
  ShieldAlertIcon, 
  MessageSquareIcon, 
  BarChartIcon, 
  ArrowUpCircleIcon,
  CreditCardIcon,
  DollarSignIcon,
  RussianRubleIcon,
  CalendarIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  StarIcon,
  ClockIcon,
  LineChartIcon,
  PieChartIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  TrendingDownIcon
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, differenceInDays } from 'date-fns';

// Моковые данные для статистики
const mockStats = {
  activeDealCount: 12,
  disputeCount: 3,
  messageCount: 7,
  completedDeals: 156,
  transactionVolume: 864532.84,
  rating: 4.85,
  daysInSystem: 118,
  balance: {
    usdt: 2843.92,
    rub: 257654.15
  },
  dealsSuccess: 156,
  dealsFailed: 8,
  ratingTrend: "+0.2",
  successRate: 95.1
};

// Моковые данные для последних сделок
const mockRecentDeals = [
  {
    id: 64231811,
    status: "Завершенная сделка 🤖",
    date: new Date(2025, 2, 13, 22, 32),
    amountUSDT: 55.32,
    amountRUB: 5000.00,
    exchangeRate: 90.39
  },
  {
    id: 64231708,
    status: "Сделка истекла",
    date: new Date(2025, 2, 13, 22, 41),
    amountUSDT: 33.19,
    amountRUB: 3000.00,
    exchangeRate: 90.39
  },
  {
    id: 64231651,
    status: "Завершенная сделка 🤖",
    date: new Date(2025, 2, 13, 22, 30),
    amountUSDT: 83.01,
    amountRUB: 7503.00,
    exchangeRate: 90.39
  },
  {
    id: 64229432,
    status: "Завершенная сделка 🤖",
    date: new Date(2025, 2, 13, 22, 24),
    amountUSDT: 33.21,
    amountRUB: 3000.00,
    exchangeRate: 90.328
  },
  {
    id: 64225233,
    status: "Сделка истекла",
    date: new Date(2025, 2, 13, 22, 23),
    amountUSDT: 44.32,
    amountRUB: 4004.00,
    exchangeRate: 90.352
  }
];

// Моковые данные для графика объема сделок по дням
const generateDailyVolumeData = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'dd.MM'),
      volumeRUB: Math.floor(Math.random() * 40000) + 20000,
      volumeUSDT: Math.floor(Math.random() * 400) + 200,
      transactions: Math.floor(Math.random() * 8) + 1
    });
  }
  return data;
};

// Моковые данные для графика успешных и неуспешных сделок по дням
const generateSuccessRateData = () => {
  const data = [];
  for (let i = 14; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const success = Math.floor(Math.random() * 6) + 2;
    const failed = Math.floor(Math.random() * 2);
    data.push({
      date: format(date, 'dd.MM'),
      успешные: success,
      неуспешные: failed,
      rate: (success / (success + failed)) * 100
    });
  }
  return data;
};

// Моковые данные для графика распределения типов сделок
const generateDealTypeData = () => [
  { name: 'Сбербанк', value: 45 },
  { name: 'Тинькофф', value: 30 },
  { name: 'ВТБ', value: 15 },
  { name: 'Альфа-Банк', value: 10 }
];

// Моковые данные для графика активности по часам
const generateHourlyActivityData = () => {
  const data = [];
  for (let hour = 0; hour < 24; hour++) {
    data.push({
      hour: `${hour}:00`,
      активность: Math.floor(Math.random() * 10) + (hour >= 9 && hour <= 21 ? 10 : 2)
    });
  }
  return data;
};

// Функция для форматирования даты сделки
const formatDate = (date) => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  
  if (date.getDate() === today.getDate() && 
      date.getMonth() === today.getMonth() && 
      date.getFullYear() === today.getFullYear()) {
    return `Сегодня, ${format(date, "HH:mm")}`;
  } else if (date.getDate() === yesterday.getDate() && 
            date.getMonth() === yesterday.getMonth() && 
            date.getFullYear() === yesterday.getFullYear()) {
    return `Вчера, ${format(date, "HH:mm")}`;
  } else {
    return format(date, "dd.MM.yy, HH:mm");
  }
};

// Цвета для графиков
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  
  // Состояния для управления интерфейсом
  const [timeRange, setTimeRange] = useState("month");
  const [chartTab, setChartTab] = useState("volume");
  
  // Данные для графиков
  const [volumeData, setVolumeData] = useState([]);
  const [successRateData, setSuccessRateData] = useState([]);
  const [dealTypeData, setDealTypeData] = useState([]);
  const [hourlyActivityData, setHourlyActivityData] = useState([]);
  
  // Генерация данных для графиков при загрузке или изменении временного диапазона
  useEffect(() => {
    setVolumeData(generateDailyVolumeData());
    setSuccessRateData(generateSuccessRateData());
    setDealTypeData(generateDealTypeData());
    setHourlyActivityData(generateHourlyActivityData());
  }, [timeRange]);

  // Проверка аутентификации при загрузке страницы
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Функция для рендеринга статусного чипа сделки
  const renderStatusChip = (status) => {
    let color = "default";
    
    if (status.includes("Завершенная")) {
      color = "success";
    } else if (status.includes("истекла")) {
      color = "warning";
    } else if (status.includes("Ошибка")) {
      color = "danger";
    } else if (status.includes("Активн")) {
      color = "primary";
    }
    
    return <Badge color={color} variant="flat">{status}</Badge>;
  };

  // Отображение загрузки
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-lg">Загрузка...</p>
      </div>
    );
  }

  // Ранний возврат вместо редиректа для избежания циклической зависимости
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <LayoutDashboardIcon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Дашборд</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              label=""
              placeholder="Временной диапазон"
              defaultSelectedKeys={["month"]}
              onChange={(e) => setTimeRange(e.target.value)}
              className="min-w-[200px]"
            >
              <SelectItem key="week" value="week">Неделя</SelectItem>
              <SelectItem key="month" value="month">Месяц</SelectItem>
              <SelectItem key="quarter" value="quarter">Квартал</SelectItem>
              <SelectItem key="year" value="year">Год</SelectItem>
            </Select>
            
            <Button
              isIconOnly
              variant="flat"
              color="primary"
              aria-label="Обновить"
            >
              <RefreshCwIcon size={20} />
            </Button>
          </div>
        </div>
        
        {/* Баланс и общая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="w-full shadow-md">
            <CardHeader className="pb-0 pt-4 px-4 flex flex-col items-start">
              <p className="text-sm text-default-500">Текущий баланс</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">{mockStats.balance.usdt.toFixed(2)}</h3>
                <span className="text-xl text-default-500">USDT</span>
              </div>
              <div className="text-small text-default-500 mt-1">
                ≈ {mockStats.balance.rub.toLocaleString()} ₽
              </div>
            </CardHeader>
            <CardBody className="pt-2">
              <div className="flex items-center gap-2 text-success">
                <ArrowUpCircleIcon size={20} />
                <span>+12.5% за неделю</span>
              </div>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button 
                color="primary" 
                className="w-full"
                endContent={<ArrowRightIcon size={16} />}
              >
                Пополнить баланс
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="w-full shadow-md">
            <CardHeader className="pb-2">
              <h3 className="text-xl font-semibold">Рейтинг аккаунта</h3>
            </CardHeader>
            <CardBody className="py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold">{mockStats.rating}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon 
                      key={star} 
                      size={20} 
                      className={star <= Math.floor(mockStats.rating) ? "text-warning fill-warning" : "text-default-300"} 
                    />
                  ))}
                </div>
                <span className="text-sm text-success">{mockStats.ratingTrend}</span>
              </div>
              <Progress 
                value={mockStats.successRate} 
                color="success"
                size="sm"
                showValueLabel
                className="mb-2"
              />
              <div className="text-sm text-default-500">
                Успешность: {mockStats.successRate}% ({mockStats.dealsSuccess}/{mockStats.dealsSuccess + mockStats.dealsFailed} сделок)
              </div>
            </CardBody>
            <Divider />
            <CardFooter>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1">
                  <ClockIcon size={16} className="text-default-500" />
                  <span className="text-sm text-default-500">В системе:</span>
                </div>
                <span className="font-semibold">{mockStats.daysInSystem} дней</span>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Информационные карточки */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="w-full shadow-md bg-gradient-to-r from-primary-50 to-default-50">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HandshakeIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Активные сделки</h3>
              </div>
              <Badge color="primary" variant="flat" size="lg">{mockStats.activeDealCount}</Badge>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex justify-between items-center">
                <span className="text-default-500">Завершено за период:</span>
                <span className="font-medium">{mockStats.dealsSuccess} сделок</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-default-500">Объем за период:</span>
                <span className="font-medium">{mockStats.transactionVolume.toLocaleString()} ₽</span>
              </div>
            </CardBody>
            <CardFooter>
              <Button 
                color="primary" 
                variant="flat" 
                size="sm" 
                className="w-full"
                as="a"
                href="/deals"
              >
                Перейти к сделкам
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="w-full shadow-md bg-gradient-to-r from-warning-50 to-default-50">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlertIcon className="h-5 w-5 text-warning" />
                <h3 className="text-lg font-semibold">Споры</h3>
              </div>
              <Badge color="warning" variant="flat" size="lg">{mockStats.disputeCount}</Badge>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex justify-between items-center">
                <span className="text-default-500">Процент споров:</span>
                <span className="font-medium">{(mockStats.disputeCount / (mockStats.dealsSuccess + mockStats.dealsFailed) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-default-500">Среднее время решения:</span>
                <span className="font-medium">5.2 часа</span>
              </div>
            </CardBody>
            <CardFooter>
              <Button 
                color="warning" 
                variant="flat" 
                size="sm" 
                className="w-full"
                as="a"
                href="/disputes"
              >
                Перейти к спорам
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="w-full shadow-md bg-gradient-to-r from-success-50 to-default-50">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquareIcon className="h-5 w-5 text-success" />
                <h3 className="text-lg font-semibold">Сообщения</h3>
              </div>
              <Badge color="success" variant="flat" size="lg">{mockStats.messageCount}</Badge>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex justify-between items-center">
                <span className="text-default-500">Непрочитанные:</span>
                <span className="font-medium">{Math.floor(mockStats.messageCount * 0.6)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-default-500">Среднее время ответа:</span>
                <span className="font-medium">3.7 мин</span>
              </div>
            </CardBody>
            <CardFooter>
              <Button 
                color="success" 
                variant="flat" 
                size="sm" 
                className="w-full"
                as="a"
                href="/messages"
              >
                Перейти к сообщениям
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Графики */}
        <Card className="w-full shadow-md">
          <CardHeader>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">Аналитика операций</h3>
              <Tabs 
                selectedKey={chartTab} 
                onSelectionChange={setChartTab}
                color="primary"
                variant="light"
                size="sm"
              >
                <Tab 
                  key="volume" 
                  title={
                    <div className="flex items-center gap-2">
                      <LineChartIcon size={16} />
                      <span>Объем сделок</span>
                    </div>
                  }
                />
                <Tab 
                  key="success" 
                  title={
                    <div className="flex items-center gap-2">
                      <BarChartIcon size={16} />
                      <span>Успешность</span>
                    </div>
                  }
                />
                <Tab 
                  key="types" 
                  title={
                    <div className="flex items-center gap-2">
                      <PieChartIcon size={16} />
                      <span>Типы сделок</span>
                    </div>
                  }
                />
                <Tab 
                  key="activity" 
                  title={
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon size={16} />
                      <span>Активность</span>
                    </div>
                  }
                />
              </Tabs>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="px-1 pt-2 pb-4">
            <div className="h-[400px] w-full">
              {chartTab === "volume" && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="colorRUB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0070F3" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0070F3" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUSDT" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E396" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00E396" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#0070F3" />
                    <YAxis yAxisId="right" orientation="right" stroke="#00E396" />
                    <Tooltip content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{label}</p>
                            {payload[0] && payload[0].value !== undefined && (
                              <p className="text-primary">
                                {`Объем (₽): ${payload[0].value.toLocaleString()}`}
                              </p>
                            )}
                            {payload[1] && payload[1].value !== undefined && (
                              <p className="text-success">
                                {`Объем (USDT): ${payload[1].value.toLocaleString()}`}
                              </p>
                            )}
                            {payload[2] && payload[2].value !== undefined && (
                              <p className="text-default-500">
                                {`Сделок: ${payload[2].value}`}
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="volumeRUB" 
                      name="Объем (₽)"
                      stroke="#0070F3" 
                      fillOpacity={1} 
                      fill="url(#colorRUB)" 
                      yAxisId="left" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volumeUSDT" 
                      name="Объем (USDT)"
                      stroke="#00E396" 
                      fillOpacity={1} 
                      fill="url(#colorUSDT)" 
                      yAxisId="right" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="transactions" 
                      name="Количество сделок"
                      stroke="#FF9800" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                      yAxisId="left" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              
              {chartTab === "success" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={successRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value) => value !== undefined ? value.toLocaleString() : 'N/A'} />
                    <Legend />
                    <Bar 
                      dataKey="успешные" 
                      name="Успешные сделки"
                      fill="#00E396" 
                      yAxisId="left" 
                    />
                    <Bar 
                      dataKey="неуспешные" 
                      name="Неуспешные сделки"
                      fill="#FF4560" 
                      yAxisId="left" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      name="Процент успеха (%)"
                      stroke="#FEB019" 
                      strokeWidth={2} 
                      yAxisId="right" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {chartTab === "types" && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dealTypeData}
                      innerRadius={60}
                      outerRadius={120}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {dealTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
              
              {chartTab === "activity" && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyActivityData}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="активность" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorActivity)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardBody>
        </Card>
        
        {/* Последние операции и статистика */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="w-full shadow-md lg:col-span-2">
            <CardHeader>
              <h3 className="text-xl font-semibold">Последние сделки</h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <Table
                aria-label="Последние сделки"
                removeWrapper
              >
                <TableHeader>
                  <TableColumn>ID</TableColumn>
                  <TableColumn>Статус</TableColumn>
                  <TableColumn>Дата</TableColumn>
                  <TableColumn>Сумма</TableColumn>
                  <TableColumn>Курс</TableColumn>
                </TableHeader>
                <TableBody>
                  {mockRecentDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>{deal.id}</TableCell>
                      <TableCell>{renderStatusChip(deal.status)}</TableCell>
                      <TableCell>{formatDate(deal.date)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <RussianRubleIcon size={12} className="text-primary" />
                            <span>{deal.amountRUB.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSignIcon size={12} className="text-success" />
                            <span>{deal.amountUSDT.toFixed(2)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{deal.exchangeRate.toFixed(2)} ₽</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button 
                color="primary" 
                variant="flat" 
                as="a"
                href="/deals"
                endContent={<ArrowRightIcon size={16} />}
              >
                Все сделки
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="w-full shadow-md">
            <CardHeader>
              <h3 className="text-xl font-semibold">Статистика аккаунта</h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1 p-4 bg-default-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-default-500">Завершенные сделки</p>
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUpIcon size={14} />
                      <span className="text-xs">+12%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon size={18} className="text-success" />
                    <p className="text-2xl font-bold">{mockStats.dealsSuccess}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 p-4 bg-default-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-default-500">Объем сделок</p>
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUpIcon size={14} />
                      <span className="text-xs">+8.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RussianRubleIcon size={18} className="text-primary" />
                    <p className="text-2xl font-bold">{(mockStats.transactionVolume / 1000).toFixed(1)}K</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 p-4 bg-default-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-default-500">Неуспешные сделки</p>
                    <div className="flex items-center gap-1 text-danger">
                      <TrendingDownIcon size={14} />
                      <span className="text-xs">-5%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircleIcon size={18} className="text-danger" />
                    <p className="text-2xl font-bold">{mockStats.dealsFailed}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 p-4 bg-default-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-default-500">Дней в системе</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={18} className="text-default-500" />
                    <p className="text-2xl font-bold">{mockStats.daysInSystem}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}