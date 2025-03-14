import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { UserRole } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  // Получение профиля пользователя
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balanceUSDT: true,
        balanceRUB: true,
        walletAddress: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Пользователь не найден",
      });
    }
    
    return user;
  }),

  // Получение данных пользователя (базовые данные для компонентов)
  getUserData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balanceUSDT: true,
        balanceRUB: true,
        walletAddress: true,
      },
    });
    
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Пользователь не найден",
      });
    }
    
    return user;
  }),

  // Обновление адреса кошелька пользователя
  updateWallet: protectedProcedure
    .input(
      z.object({
        walletAddress: z.string().min(1, "Адрес кошелька не может быть пустым"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      
      try {
        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: {
            walletAddress: input.walletAddress,
          },
          select: {
            id: true,
            walletAddress: true,
          },
        });
        
        return updatedUser;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось обновить адрес кошелька",
        });
      }
    }),

  // Получение истории пополнений
  getDepositHistory: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    try {
      const deposits = await ctx.db.deposit.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          amountAfterFee: true,
          status: true,
          transactionHash: true,
          createdAt: true,
        },
      });
      
      return deposits;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось получить историю пополнений",
      });
    }
  }),

  // Получение системных настроек (комиссия и адрес кошелька)
  getSystemSettings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const settings = await ctx.db.systemSettings.findFirst({
        orderBy: { id: "desc" },
        select: {
          commissionRate: true,
          systemWalletAddress: true,
        },
      });
      
      if (!settings) {
        // Создаем настройки по умолчанию, если они не существуют
        const defaultSettings = await ctx.db.systemSettings.create({
          data: {
            commissionRate: 9.0,
            systemWalletAddress: "THUcbJm1xCdmF3BKj7Bakn9qZzvsJduL4h", // Пример адреса, нужно заменить реальным
          },
          select: {
            commissionRate: true,
            systemWalletAddress: true,
          },
        });
        
        return defaultSettings;
      }
      
      return settings;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось получить системные настройки",
      });
    }
  }),

  // Обновление системных настроек (только для админов)
  updateSystemSettings: adminProcedure
    .input(
      z.object({
        commissionRate: z.number().min(0).max(100),
        systemWalletAddress: z.string().min(1, "Адрес кошелька не может быть пустым"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Проверяем, существуют ли уже настройки
        const existingSettings = await ctx.db.systemSettings.findFirst({
          orderBy: { id: "desc" },
        });
        
        if (existingSettings) {
          // Обновляем существующие настройки
          const settings = await ctx.db.systemSettings.update({
            where: { id: existingSettings.id },
            data: {
              commissionRate: input.commissionRate,
              systemWalletAddress: input.systemWalletAddress,
            },
            select: {
              commissionRate: true,
              systemWalletAddress: true,
            },
          });
          
          return settings;
        } else {
          // Создаем новые настройки
          const settings = await ctx.db.systemSettings.create({
            data: {
              commissionRate: input.commissionRate,
              systemWalletAddress: input.systemWalletAddress,
            },
            select: {
              commissionRate: true,
              systemWalletAddress: true,
            },
          });
          
          return settings;
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось обновить системные настройки",
        });
      }
    }),

  // Проверка депозитов пользователя
  checkDeposits: protectedProcedure
    .input(
      z.object({
        walletAddress: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      
      // В реальном приложении здесь должна быть интеграция с API TRC20 для проверки транзакций
      // В этом примере мы просто симулируем проверку с 10% шансом обнаружения нового депозита
      
      try {
        // Если пользователь не указал адрес кошелька
        if (!input.walletAddress) {
          return { 
            newDeposit: false,
            amount: 0,
            message: "Адрес кошелька не указан"
          };
        }
        
        // Проверяем существование пользователя
        const userExists = await ctx.db.user.findUnique({
          where: { id: userId },
          select: { id: true }
        });
        
        if (!userExists) {
          return { 
            newDeposit: false,
            amount: 0,
            message: "Пользователь не найден"
          };
        }
        
        const settings = await ctx.db.systemSettings.findFirst({
          orderBy: { id: "desc" },
          select: {
            commissionRate: true,
          },
        });
        
        const commissionRate = settings?.commissionRate ?? 9.0;
        
        // Симуляция проверки депозитов (в реальном приложении здесь будет интеграция с блокчейн API)
        const randomCheck = Math.random();
        
        if (randomCheck < 0.1) { // 10% шанс обнаружения нового депозита
          const randomAmount = parseFloat((Math.random() * 100 + 10).toFixed(2)); // Случайная сумма от 10 до 110 USDT
          const amountAfterFee = parseFloat((randomAmount * (1 - commissionRate / 100)).toFixed(2));
          const randomHash = `TRX${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
          
          // Проверяем, не существует ли уже такой транзакции
          const existingDeposit = await ctx.db.deposit.findFirst({
            where: { 
              transactionHash: randomHash,
              userId
            }
          });
          
          // Если такая транзакция уже существует, возвращаем сообщение об отсутствии новых депозитов
          if (existingDeposit) {
            return { 
              newDeposit: false,
              amount: 0,
              message: "Новых депозитов не обнаружено"
            };
          }
          
          // Создаем новую запись о депозите
          await ctx.db.deposit.create({
            data: {
              userId,
              amount: randomAmount,
              amountAfterFee,
              transactionHash: randomHash,
              status: "COMPLETED",
            },
          });
          
          // Обновляем баланс пользователя
          await ctx.db.user.update({
            where: { id: userId },
            data: {
              balanceUSDT: { increment: amountAfterFee },
              // Обновляем также рублевый баланс по курсу (предположим курс 90 рублей за 1 USDT)
              balanceRUB: { increment: amountAfterFee * 90 },
            },
          });
          
          return { 
            newDeposit: true,
            amount: amountAfterFee,
            message: "Депозит обнаружен и зачислен"
          };
        }
        
        return { 
          newDeposit: false,
          amount: 0,
          message: "Новых депозитов не обнаружено"
        };
      } catch (error) {
        console.error("Ошибка при проверке депозитов:", error);
        // Возвращаем объект с информацией об ошибке, вместо выброса исключения
        return { 
          newDeposit: false,
          amount: 0,
          message: "Произошла ошибка при проверке депозитов"
        };
      }
    }),
});