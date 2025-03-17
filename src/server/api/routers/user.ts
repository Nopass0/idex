// Генерация случайного ключа активации в формате XXXX-XXXX-XXXX
function generateKeyPart(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let part = '';
  for (let i = 0; i < 4; i++) {
    part += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return part;
}

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

  checkDeposits: protectedProcedure
    .input(
      z.object({
        walletAddress: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Здесь должна быть логика проверки новых депозитов через API блокчейна
      // В текущей версии просто заглушка
      return {
        newDeposit: false,
        amount: 0
      };
    }),

  // ADMIN API: Получение всех пользователей (только для админов)
  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          balanceUSDT: true,
          balanceRUB: true,
          walletAddress: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      return users;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось получить список пользователей",
      });
    }
  }),

  // ADMIN API: Создание пользователя (только для админов)
  createUser: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Имя пользователя не может быть пустым"),
        email: z.string().email("Некорректный формат email"),
        password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
        role: z.enum([UserRole.USER, UserRole.ADMIN, UserRole.GUEST]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Проверяем, существует ли пользователь с таким email
        const existingUser = await ctx.db.user.findUnique({
          where: { email: input.email },
        });
        
        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Пользователь с таким email уже существует",
          });
        }
        
        // Хеширование пароля (в реальном приложении)
        const hashedPassword = input.password; // В реальности здесь должно быть хеширование
        
        // Создаем нового пользователя
        const newUser = await ctx.db.user.create({
          data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            role: input.role,
            balanceUSDT: 0,
            balanceRUB: 0,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });
        
        return newUser;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось создать пользователя",
        });
      }
    }),

  // ADMIN API: Обновление роли пользователя (только для админов)
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum([UserRole.USER, UserRole.ADMIN, UserRole.GUEST]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedUser = await ctx.db.user.update({
          where: { id: input.userId },
          data: {
            role: input.role,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });
        
        return updatedUser;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось обновить роль пользователя",
        });
      }
    }),

  // ADMIN API: Создание ключа активации (только для админов)
  createActivationKey: adminProcedure
    .input(
      z.object({
        userId: z.number().optional(), // Опционально можно привязать ключ к пользователю
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const keyValue = `${generateKeyPart()}-${generateKeyPart()}-${generateKeyPart()}`;
        
        // Создаем ключ активации
        const activationKey = await ctx.db.key.create({
          data: {
            key: keyValue,
            isActive: false,
            userId: input.userId || 1,
          },
          select: {
            id: true,
            key: true,
            isActive: true,
            userId: true,
            createdAt: true,
          },
        });
        
        return activationKey;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось создать ключ активации",
        });
      }
    }),

  // ADMIN API: Получение всех ключей активации (только для админов)
  getAllKeys: adminProcedure.query(async ({ ctx }) => {
    try {
      const keys = await ctx.db.key.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      return keys;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось получить список ключей активации",
      });
    }
  }),

  // ADMIN API: Активация ключа для пользователя (только для админов)
  activateKeyForUser: adminProcedure
    .input(
      z.object({
        keyId: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Проверяем существование ключа
        const key = await ctx.db.key.findUnique({
          where: { id: input.keyId },
        });
        
        if (!key) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ключ активации не найден",
          });
        }
        
        if (key.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ключ уже активирован",
          });
        }
        
        // Проверяем существование пользователя
        const user = await ctx.db.user.findUnique({
          where: { id: input.userId },
        });
        
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Пользователь не найден",
          });
        }
        
        // Активируем ключ для пользователя
        const activatedKey = await ctx.db.key.update({
          where: { id: input.keyId },
          data: {
            isActive: true,
            
            userId: input.userId,
          },
          select: {
            id: true,
            key: true,
            isActive: true,
           
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
        });
        
        // Обновляем статус пользователя если он был GUEST
        if (user.role === UserRole.GUEST) {
          await ctx.db.user.update({
            where: { id: input.userId },
            data: {
              role: UserRole.USER,
            },
          });
        }
        
        return activatedKey;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось активировать ключ для пользователя",
        });
      }
    }),

  // ADMIN API: Создание и активация ключа для пользователя одним запросом (только для админов)
  createAndActivateKey: adminProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Проверяем существование пользователя
        const user = await ctx.db.user.findUnique({
          where: { id: input.userId },
        });
        
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Пользователь не найден",
          });
        }
        
        const keyValue = `${generateKeyPart()}-${generateKeyPart()}-${generateKeyPart()}`;
        
        // Создаем и сразу активируем ключ
        const activationKey = await ctx.db.key.create({
          data: {
            key: keyValue,
            isActive: true,
            userId: input.userId,
          },
          select: {
            id: true,
            key: true,
            isActive: true,
            userId: true,
          },
        });
        
        // Обновляем статус пользователя если он был GUEST
        if (user.role === UserRole.GUEST) {
          await ctx.db.user.update({
            where: { id: input.userId },
            data: {
              role: UserRole.USER,
            },
          });
        }
        
        return activationKey;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось создать и активировать ключ",
        });
      }
    }),

  // ADMIN API: Статистика по пользователям (только для админов)
  getUsersStats: adminProcedure.query(async ({ ctx }) => {
    try {
      // Получаем общее количество пользователей
      const totalUsers = await ctx.db.user.count();
      
      // Количество пользователей по ролям
      const adminUsers = await ctx.db.user.count({
        where: { role: UserRole.ADMIN },
      });
      
      const regularUsers = await ctx.db.user.count({
        where: { role: UserRole.USER },
      });
      
      const guestUsers = await ctx.db.user.count({
        where: { role: UserRole.GUEST },
      });
      
      // Новые пользователи за последний день
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const newUsersToday = await ctx.db.user.count({
        where: {
          createdAt: {
            gte: yesterday,
          },
        },
      });
      
      // Последние 5 зарегистрированных пользователей
      const recentUsers = await ctx.db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
      
      return {
        totalUsers,
        adminUsers,
        regularUsers,
        guestUsers,
        newUsersToday,
        recentUsers,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось получить статистику пользователей",
      });
    }
  }),

  // ADMIN API: Статистика по ключам (только для админов)
  getKeysStats: adminProcedure.query(async ({ ctx }) => {
    try {
      // Получаем общее количество ключей
      const totalKeys = await ctx.db.key.count();
      
      // Активированные и неактивированные ключи
      const activeKeys = await ctx.db.key.count({
        where: { isActive: true },
      });
      
      const inactiveKeys = await ctx.db.key.count({
        where: { isActive: false },
      });
      
      // Ключи, активированные за последний день
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const keysActivatedToday = await ctx.db.key.count({
        where: {
          updatedAt: {
            gte: yesterday,
          },
        },
      });
      
      // Последние 5 активированных ключей
      const recentActivations = await ctx.db.key.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          key: true,
          updatedAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
      });
      
      return {
        totalKeys,
        activeKeys,
        inactiveKeys,
        keysActivatedToday,
        recentActivations,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось получить статистику ключей",
      });
    }
  }),
  // ADMIN API: Создание пакета ключей активации
  createBatchActivationKeys: adminProcedure
    .input(
      z.object({
        count: z.number().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const keys: string[] = [];
        const keyObjects = [];
        
        for (let i = 0; i < input.count; i++) {
          const keyValue = `${generateKeyPart()}-${generateKeyPart()}-${generateKeyPart()}`;
          keys.push(keyValue);
          
          const keyObject = await ctx.db.key.create({
            data: {
              key: keyValue,
              isActive: false,
              userId: 1,
            },
          });
          
          keyObjects.push(keyObject);
        }
        
        return { 
          keys,
          keyObjects
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось создать ключи активации",
        });
      }
    }),


});