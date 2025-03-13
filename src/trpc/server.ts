import { createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";

import { type AppRouter } from "@/server/api/root";

/**
 * Этот файл предназначен только для серверных компонентов.
 * Не импортируйте его в клиентских компонентах!
 */
export const api = createTRPCReact<AppRouter>();

export { type AppRouter };
