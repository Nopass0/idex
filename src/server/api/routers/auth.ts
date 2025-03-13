// src/server/api/routers/auth.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { UserRole } from "@prisma/client";

export const authRouter = createTRPCRouter({
  // Register a new user with GUEST role
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, password } = input;

      // Check if user already exists
      const userExists = await ctx.db.user.findUnique({
        where: { email },
      });

      if (userExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user with GUEST role
      const user = await ctx.db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: UserRole.GUEST,
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

      return {
        status: "success",
        message: "Регистрация успешна! Для активации аккаунта используйте ключ активации.",
        user,
      };
    }),

  // Login a user and create a session token
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;

      // Find the user
      const user = await ctx.db.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Пользователь не найден",
        });
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Неверный пароль",
        });
      }

      // Get device info
      const deviceName = "Браузер"; // В реальном приложении получали бы из user-agent
      const deviceType = "Desktop"; // В реальном приложении получали бы из user-agent
      const ipAddress = "127.0.0.1"; // В реальном приложении получали бы из запроса

      // Generate a token
      const token = crypto.randomBytes(32).toString("hex");

      // Store the token
      await ctx.db.token.create({
        data: {
          token,
          userId: user.id,
        },
      });

      // Record device login
      await ctx.db.device.create({
        data: {
          deviceName,
          deviceType,
          ipAddress,
          lastLogin: new Date(),
          userId: user.id,
        },
      });

      return {
        status: "success",
        message: "Вход выполнен успешно",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          balanceUSDT: user.balanceUSDT,
          balanceRUB: user.balanceRUB,
        },
        token,
      };
    }),

  // Logout - invalidate token
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // Delete the token used for authentication
    if (ctx.token) {
      await ctx.db.token.delete({
        where: { token: ctx.token },
      });
    }

    return {
      status: "success",
      message: "Выход выполнен успешно",
    };
  }),

  // Admin creates activation key
  createActivationKey: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Только администраторы могут создавать ключи активации",
        });
      }

      // Generate a key
      const key = crypto.randomBytes(8).toString("hex");

      // Create key in database (linked to user if userId provided)
      await ctx.db.key.create({
        data: {
          key,
          userId: input.userId ?? ctx.user.id,
          isActive: false,
        },
      });

      return {
        status: "success",
        message: "Ключ активации успешно создан",
        key,
      };
    }),

  // Activate account with key
  activateAccount: protectedProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== UserRole.GUEST) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ваш аккаунт уже активирован",
        });
      }

      // Find the key
      const activationKey = await ctx.db.key.findUnique({
        where: { key: input.key },
      });

      if (!activationKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Неверный ключ активации",
        });
      }

      if (activationKey.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Этот ключ уже использован",
        });
      }

      // Upgrade user role to USER
      await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: { role: UserRole.USER },
      });

      // Mark key as used
      await ctx.db.key.update({
        where: { id: activationKey.id },
        data: { isActive: true },
      });

      return {
        status: "success",
        message: "Аккаунт успешно активирован",
      };
    }),
  
  // Admin: directly change user role
  changeUserRole: protectedProcedure
    .input(z.object({ 
      userId: z.number(),
      role: z.nativeEnum(UserRole)
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Только администраторы могут изменять роли пользователей",
        });
      }

      const { userId, role } = input;

      await ctx.db.user.update({
        where: { id: userId },
        data: { role },
      });

      return {
        status: "success",
        message: `Роль пользователя изменена на ${role}`,
      };
    }),
  
  // Get current user profile with additional data
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balanceUSDT: true,
        balanceRUB: true,
        createdAt: true,
      }
    });

    // Get the last 5 devices
    const devices = await ctx.db.device.findMany({
      where: { userId: ctx.user.id },
      orderBy: { lastLogin: 'desc' },
      take: 5,
    });

    // Get unread messages count
    const unreadMessagesCount = await ctx.db.message.count({
      where: { 
        userId: ctx.user.id,
        isRead: false,
      }
    });

    return {
      user,
      devices,
      unreadMessagesCount,
    };
  }),

  // Admin: get all users
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== UserRole.ADMIN) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Только администраторы могут просматривать всех пользователей",
      });
    }

    const users = await ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        balanceUSDT: true,
        balanceRUB: true,
      },
      orderBy: { id: 'asc' },
    });

    return users;
  }),
});