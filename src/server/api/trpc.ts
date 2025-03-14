// src/server/api/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/server/db";
import { type User, UserRole } from "@prisma/client";

/**
 * 1. CONTEXT
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const authHeader = opts.headers.get("authorization");
  
  let user: Omit<User, "password"> | null = null;
  let token: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
    
    // Validate token and get user
    const tokenData = await db.token.findUnique({
      where: { token },
      include: {
        user: {
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
        },
      },
    });

    if (tokenData) {
      user = tokenData.user;
    }
  }

  return {
    db,
    user,
    token,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Authentication middleware - verifies user is logged in
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  return next({
    ctx: {
      user: ctx.user,
      token: ctx.token,
    },
  });
});

/**
 * Admin middleware - verifies user is an admin
 */
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  
  if (ctx.user.role !== UserRole.ADMIN) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not authorized",
    });
  }
  
  return next({
    ctx: {
      user: ctx.user,
      token: ctx.token,
    },
  });
});

/**
 * Public (unauthenticated) procedure
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(isAuthed);

/**
 * Admin procedure - only accessible by admin users
 */
export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(isAdmin);