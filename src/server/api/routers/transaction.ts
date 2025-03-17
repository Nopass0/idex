import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { TransactionStatus, TrafficType } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";

export const transactionRouter = createTRPCRouter({
  // Получение списка всех транзакций с пагинацией и фильтрацией
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
            user: { 
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
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              receipts: true
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

  // Получение одной транзакции по id
  getTransactionById: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      try {
        const transaction = await ctx.db.transaction.findUnique({
          where: { id: input.id },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            receipts: true,
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

  // Создание новой транзакции
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
          },
          include: {
            user: {
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

  // Обновление существующей транзакции
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
            user: {
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

  // Удаление транзакции
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

  // Получение списка всех пользователей для выбора получателя
  getUsersForSelect: adminProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findMany({
        where: {
          role: {
            not: "GUEST"
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
  })
});

export default transactionRouter;
