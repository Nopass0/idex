import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { TransactionStatus, TrafficType } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure, publicProcedure } from "../trpc";

export const transactionRouter = createTRPCRouter({
  // Получение списка транзакций для текущего пользователя с пагинацией и фильтрацией
  getUserTransactions: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        perPage: z.number().int().positive().max(100).default(10),
        sortBy: z.string().optional(),
        sortDirection: z.enum(["asc", "desc"]).default("desc"),
        search: z.string().optional(),
        status: z.nativeEnum(TransactionStatus).optional(),
        inProgress: z.boolean().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, sortBy, sortDirection, search, status, inProgress, startDate, endDate } = input;
      const skip = (page - 1) * perPage;
      
      // Формируем условие для поиска и фильтрации
      const where: any = {
        userId: ctx.user.id, // Только транзакции текущего пользователя
      };
      
      if (search) {
        where.OR = [
          { description: { contains: search, mode: "insensitive" } },
          { bankName: { contains: search, mode: "insensitive" } },
          { cardNumber: { contains: search, mode: "insensitive" } },
          { phoneNumber: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      // Добавляем фильтр для транзакций "в работе"
      if (inProgress !== undefined) {
        where.inProgress = inProgress;
      }

      if (startDate) {
        const startDateTime = new Date(startDate);
        where.createdAt = {
          ...(where.createdAt || {}),
          gte: startDateTime
        };
      }

      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt = {
          ...(where.createdAt || {}),
          lte: endDateTime
        };
      }

      // Формируем объект для сортировки
      const orderBy: any = {};
      if (sortBy) {
        orderBy[sortBy] = sortDirection;
      } else {
        orderBy.createdAt = sortDirection;
      }

      try {
        // Получаем транзакции с пагинацией
        const [transactions, totalCount] = await Promise.all([
          ctx.db.transaction.findMany({
            where,
            orderBy,
            skip,
            take: perPage,
            include: {
              Receipt: true,
              User: true
            }
          }),
          ctx.db.transaction.count({ where })
        ]);

        // Вычисляем общее количество страниц
        const totalPages = Math.ceil(totalCount / perPage);

        return {
          transactions,
          pagination: {
            page,
            perPage,
            totalCount,
            totalPages
          }
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось получить список транзакций",
        });
      }
    }),

  // Установка статуса "в работе" для транзакции
  setTransactionInProgress: protectedProcedure
    .input(z.object({ 
      id: z.number().int()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Проверяем, что транзакция принадлежит текущему пользователю
        const transaction = await ctx.db.transaction.findUnique({
          where: { id: input.id }
        });

        if (!transaction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Транзакция не найдена",
          });
        }

        if (transaction.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "У вас нет доступа к этой транзакции",
          });
        }

        // Проверяем, что транзакция не уже в работе и имеет активный статус
        if (transaction.inProgress) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Транзакция уже находится в работе",
          });
        }

        if (transaction.status !== TransactionStatus.PENDING) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Только транзакции со статусом 'Ожидание подтверждения' могут быть взяты в работу",
          });
        }

        // Обновляем статус "в работе"
        const updatedTransaction = await ctx.db.transaction.update({
          where: { id: input.id },
          data: {
            inProgress: true
          }
        });

        return {
          transaction: updatedTransaction,
          success: true
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось обновить статус транзакции",
        });
      }
    }),

  // Отклонение транзакции с указанием причины
  rejectTransaction: protectedProcedure
    .input(z.object({ 
      id: z.number().int(),
      reason: z.string(),
      receiptFile: z.string().optional(), // Опционально: Base64 или путь к файлу
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Проверяем, что транзакция принадлежит текущему пользователю
        const transaction = await ctx.db.transaction.findUnique({
          where: { id: input.id }
        });

        if (!transaction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Транзакция не найдена",
          });
        }

        if (transaction.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "У вас нет доступа к этой транзакции",
          });
        }

        // Обновляем статус транзакции на CANCELLED и снимаем флаг "в работе"
        const updatedTransaction = await ctx.db.transaction.update({
          where: { id: input.id },
          data: {
            status: TransactionStatus.CANCELLED,
            inProgress: false,
            description: `Отклонено: ${input.reason}`
          }
        });

        // Если есть файл изображения чека, сохраняем его
        if (input.receiptFile) {
          await ctx.db.receipt.create({
            data: {
              filePath: input.receiptFile,
              isVerified: false,
              isFake: false,
              transactionId: input.id,
              updatedAt: new Date()
            }
          });
        }

        return {
          transaction: updatedTransaction,
          success: true
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось отклонить транзакцию",
        });
      }
    }),

  // Принятие транзакции с прикреплением чека
  acceptTransaction: protectedProcedure
    .input(z.object({ 
      id: z.number().int(),
      receiptFile: z.string(), // Base64 или путь к файлу с чеком
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Проверяем, что транзакция принадлежит текущему пользователю
        const transaction = await ctx.db.transaction.findUnique({
          where: { id: input.id }
        });

        if (!transaction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Транзакция не найдена",
          });
        }

        if (transaction.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "У вас нет доступа к этой транзакции",
          });
        }

        // Проверка наличия чека
        if (!input.receiptFile) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Необходимо прикрепить чек оплаты",
          });
        }

        // Здесь проверка чека (заглушка: всегда возвращает true)
        const isValidReceipt = true; // В реальном сценарии здесь была бы проверка чека

        // Сохраняем чек
        const receipt = await ctx.db.receipt.create({
          data: {
            filePath: input.receiptFile,
            isVerified: isValidReceipt,
            isFake: false, // В реальном сценарии это определялось бы проверкой
            transactionId: input.id,
            updatedAt: new Date()
          }
        });

        // Обновляем статус транзакции на ACTIVE и снимаем флаг "в работе"
        const updatedTransaction = await ctx.db.transaction.update({
          where: { id: input.id },
          data: {
            status: TransactionStatus.ACTIVE,
            inProgress: false,
            confirmedAt: new Date()
          }
        });

        return {
          transaction: updatedTransaction,
          receipt,
          success: true
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось принять транзакцию",
        });
      }
    }),

  // Получение одной транзакции по id для пользователя
  getUserTransactionById: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      try {
        const transaction = await ctx.db.transaction.findUnique({
          where: { id: input.id },
          include: {
            Receipt: true,
            disputes: true,
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        if (!transaction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Транзакция не найдена",
          });
        }

        // Проверяем, что транзакция принадлежит текущему пользователю
        if (transaction.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "У вас нет доступа к этой транзакции",
          });
        }

        return transaction;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось получить данные транзакции",
        });
      }
    }),

  // Получение списка всех транзакций с пагинацией и фильтрацией (админский доступ)
  getTransactions: adminProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        perPage: z.number().int().positive().max(100).default(10),
        sortBy: z.string().optional(),
        sortDirection: z.enum(["asc", "desc"]).default("desc"),
        search: z.string().optional(),
        status: z.nativeEnum(TransactionStatus).optional(),
        userId: z.number().int().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isMock: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, sortBy, sortDirection, search, status, userId, startDate, endDate, isMock } = input;
      const skip = (page - 1) * perPage;
      
      // Формируем условие для поиска и фильтрации
      const where: any = {};
      
      if (search) {
        where.OR = [
          { description: { contains: search, mode: "insensitive" } },
          { bankName: { contains: search, mode: "insensitive" } },
          { cardNumber: { contains: search, mode: "insensitive" } },
          { phoneNumber: { contains: search, mode: "insensitive" } },
          { 
            User: { 
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } }
              ] 
            } 
          },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (userId) {
        where.userId = userId;
      }

      if (isMock !== undefined) {
        where.isMock = isMock;
      }

      if (startDate) {
        const startDateTime = new Date(startDate);
        where.createdAt = {
          ...(where.createdAt || {}),
          gte: startDateTime
        };
      }

      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt = {
          ...(where.createdAt || {}),
          lte: endDateTime
        };
      }

      // Формируем объект для сортировки
      const orderBy: any = {};
      if (sortBy) {
        orderBy[sortBy] = sortDirection;
      } else {
        orderBy.createdAt = sortDirection;
      }

      try {
        // Получаем транзакции с пагинацией
        const [transactions, totalCount] = await Promise.all([
          ctx.db.transaction.findMany({
            where,
            orderBy,
            skip,
            take: perPage,
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              Receipt: true
            }
          }),
          ctx.db.transaction.count({ where })
        ]);

        // Вычисляем общее количество страниц
        const totalPages = Math.ceil(totalCount / perPage);

        return {
          transactions,
          pagination: {
            page,
            perPage,
            totalCount,
            totalPages
          }
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось получить список транзакций",
        });
      }
    }),

  // Получение одной транзакции по id (админский доступ)
  getTransactionById: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      try {
        const transaction = await ctx.db.transaction.findUnique({
          where: { id: input.id },
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            Receipt: true,
            disputes: true
          }
        });

        if (!transaction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Транзакция не найдена",
          });
        }

        return transaction;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось получить данные транзакции",
        });
      }
    }),

  // Создание новой транзакции (админский доступ)
  createTransaction: adminProcedure
    .input(
      z.object({
        status: z.nativeEnum(TransactionStatus).default(TransactionStatus.PENDING),
        description: z.string().optional(),
        amountRUB: z.number().default(0),
        amountToChargeRUB: z.number().default(0),
        amountToChargeUSDT: z.number().default(0),
        amountUSDT: z.number().default(0),
        bankName: z.string().optional(),
        cardNumber: z.string().optional(),
        confirmedAt: z.date().optional(),
        exchangeRate: z.number().default(0),
        isMock: z.boolean().default(true),
        trafficType: z.nativeEnum(TrafficType).optional(),
        userId: z.number().int().optional(),
        phoneNumber: z.string().optional(),
        inProgress: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Создаем транзакцию
        const transaction = await ctx.db.transaction.create({
          data: {
            status: input.status,
            description: input.description,
            amountRUB: input.amountRUB,
            amountToChargeRUB: input.amountToChargeRUB,
            amountToChargeUSDT: input.amountToChargeUSDT,
            amountUSDT: input.amountUSDT,
            bankName: input.bankName,
            cardNumber: input.cardNumber,
            confirmedAt: input.confirmedAt,
            exchangeRate: input.exchangeRate,
            isMock: input.isMock,
            trafficType: input.trafficType,
            phoneNumber: input.phoneNumber,
            userId: input.userId,
            inProgress: input.inProgress,
          },
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        // Обновляем баланс пользователя, если статус ACTIVE
        if (input.status === TransactionStatus.ACTIVE && input.userId) {
          const user = await ctx.db.user.findUnique({
            where: { id: input.userId }
          });

          if (user) {
            // Обновляем баланс пользователя в рублях и/или USDT
            await ctx.db.user.update({
              where: { id: input.userId },
              data: {
                balanceRUB: input.amountRUB > 0 ? { increment: input.amountRUB } : undefined,
                balanceUSDT: input.amountUSDT > 0 ? { increment: input.amountUSDT } : undefined
              }
            });
          }
        }

        return transaction;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось создать транзакцию",
        });
      }
    }),

  // Обновление существующей транзакции (админский доступ)
  updateTransaction: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: z.nativeEnum(TransactionStatus).optional(),
        description: z.string().optional(),
        amountRUB: z.number().optional(),
        amountToChargeRUB: z.number().optional(),
        amountToChargeUSDT: z.number().optional(),
        amountUSDT: z.number().optional(),
        bankName: z.string().optional(),
        cardNumber: z.string().optional(),
        confirmedAt: z.date().optional().nullable(),
        exchangeRate: z.number().optional(),
        isMock: z.boolean().optional(),
        trafficType: z.nativeEnum(TrafficType).optional().nullable(),
        userId: z.number().int().optional().nullable(),
        phoneNumber: z.string().optional(),
        inProgress: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      try {
        // Получаем текущую транзакцию
        const currentTransaction = await ctx.db.transaction.findUnique({
          where: { id },
          select: {
            status: true,
            userId: true,
            amountRUB: true,
            amountUSDT: true
          }
        });

        if (!currentTransaction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Транзакция не найдена",
          });
        }

        // Обновляем транзакцию
        const transaction = await ctx.db.transaction.update({
          where: { id },
          data: updateData,
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        // Если меняется статус на ACTIVE, обновляем баланс пользователя
        const wasActive = currentTransaction.status === TransactionStatus.ACTIVE;
        const willBeActive = updateData.status === TransactionStatus.ACTIVE;
        
        // Если транзакция становится активной и привязана к пользователю
        if (!wasActive && willBeActive && (updateData.userId || currentTransaction.userId)) {
          const userId = updateData.userId || currentTransaction.userId;
          if (userId) {
            // Используем новые значения сумм, если они были обновлены, иначе используем текущие
            const amountRUB = updateData.amountRUB !== undefined ? updateData.amountRUB : currentTransaction.amountRUB;
            const amountUSDT = updateData.amountUSDT !== undefined ? updateData.amountUSDT : currentTransaction.amountUSDT;
            
            // Обновляем баланс пользователя
            await ctx.db.user.update({
              where: { id: userId },
              data: {
                balanceRUB: amountRUB > 0 ? { increment: amountRUB } : undefined,
                balanceUSDT: amountUSDT > 0 ? { increment: amountUSDT } : undefined
              }
            });
          }
        }

        return transaction;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось обновить транзакцию",
        });
      }
    }),

  // Удаление транзакции (админский доступ)
  deleteTransaction: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Проверяем наличие транзакции
        const transaction = await ctx.db.transaction.findUnique({
          where: { id: input.id }
        });

        if (!transaction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Транзакция не найдена",
          });
        }

        // Удаляем связанные квитанции
        await ctx.db.receipt.deleteMany({
          where: { transactionId: input.id }
        });

        // Удаляем связанные споры
        await ctx.db.dispute.deleteMany({
          where: { transactionId: input.id }
        });

        // Удаляем транзакцию
        await ctx.db.transaction.delete({
          where: { id: input.id }
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось удалить транзакцию",
        });
      }
    }),

  // Получение списка всех пользователей для выбора получателя (админский доступ)
  getUsersForSelect: adminProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findMany({
        where: {
          role: {
            in: ["USER", "ADMIN"]
          }
        },
        select: {
          id: true,
          name: true,
          email: true
        },
        orderBy: {
          name: "asc"
        }
      });
      
      return users;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось получить список пользователей",
      });
    }
  }),

  // Создание случайных транзакций для тестирования (админский доступ)
  createRandomTransactions: adminProcedure
    .input(z.object({
      count: z.number().int().min(1).max(20).default(5)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Получаем список пользователей
        const users = await ctx.db.user.findMany({
          where: {
            role: {
              in: ["USER", "ADMIN"]
            }
          },
          select: {
            id: true
          }
        });

        if (users.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Необходимо наличие пользователей для создания тестовых транзакций",
          });
        }

        // Статусы транзакций для рандомного выбора
        const statuses = Object.values(TransactionStatus);
        // Типы трафика для рандомного выбора
        const trafficTypes = Object.values(TrafficType);
        
        // Банки для рандомного выбора
        const banks = [
          "Сбербанк", "Тинькофф", "Альфа-Банк", "ВТБ", "Райффайзен", 
          "Газпромбанк", "Открытие", "Росбанк", "Совкомбанк", "МТС Банк"
        ];

        // Создаем N случайных транзакций
        const transactions = [];
        for (let i = 0; i < input.count; i++) {
          // Случайные параметры
          const userId = users[Math.floor(Math.random() * users.length)]?.id;
          if (!userId) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Не удалось получить ID пользователя",
            });
          }
          
          const status = statuses[Math.floor(Math.random() * statuses.length)] as TransactionStatus;
          const trafficType = Math.random() > 0.3 ? trafficTypes[Math.floor(Math.random() * trafficTypes.length)] : null;
          const bankName = banks[Math.floor(Math.random() * banks.length)];
          const amountRUB = Math.round(Math.random() * 10000 * 100) / 100; // Случайная сумма до 10,000 RUB с 2 знаками после запятой
          const exchangeRate = Math.round((Math.random() * 10 + 90) * 100) / 100; // Случайный курс от 90 до 100
          const amountUSDT = Math.round((amountRUB / exchangeRate) * 100) / 100;
          const inProgress = Math.random() > 0.7; // 30% шанс быть "в работе"
          
          // Генерация случайного номера карты (последние 4 цифры)
          const cardNumber = `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`;
          
          // Генерация случайного номера телефона
          const phoneNumber = `+7${Math.floor(9000000000 + Math.random() * 1000000000)}`;
          
          // Создаем транзакцию
          const transaction = await ctx.db.transaction.create({
            data: {
              status,
              description: `Тестовая транзакция #${i+1}`,
              amountRUB,
              amountUSDT,
              exchangeRate,
              bankName,
              cardNumber,
              phoneNumber,
              userId,
              inProgress,
              trafficType,
              isMock: true,
              // 50% шанс добавления даты подтверждения для ACTIVE статуса
              confirmedAt: status === TransactionStatus.ACTIVE && Math.random() > 0.5 ? new Date() : null,
            }
          });
          
          transactions.push(transaction);
          
          // Если статус ACTIVE, добавляем чек
          if (status === TransactionStatus.ACTIVE) {
            await ctx.db.receipt.create({
              data: {
                filePath: "/placeholder-receipt.jpg",
                isVerified: Math.random() > 0.3, // 70% шанс быть проверенным
                isFake: Math.random() > 0.9, // 10% шанс быть фейком
                transactionId: transaction.id,
                updatedAt: new Date() // Добавляем обязательное поле updatedAt
              }
            });
          }
        }
        
        return {
          count: transactions.length,
          success: true
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось создать тестовые транзакции",
        });
      }
    }),
});

export default transactionRouter; 
