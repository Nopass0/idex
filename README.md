# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## IDEX - Система аутентификации

Это приложение построено на основе [T3 Stack](https://create.t3.gg/) с использованием Next.js, tRPC, Prisma и HeroUI.

## Основные функции

- Регистрация новых пользователей
- Вход в систему
- Активация аккаунта через ключи активации
- Управление пользователями для администраторов
- Поддержка тем оформления (светлая/темная)

## Роли пользователей

- **GUEST** - новый зарегистрированный пользователь с ограниченным доступом
- **USER** - активированный пользователь с полным доступом к функциям
- **ADMIN** - администратор с возможностью управления пользователями и генерации ключей активации

## Установка и запуск

1. Установить зависимости:
```bash
npm install
# или
yarn install
# или
pnpm install
```

2. Настроить базу данных с Prisma:
```bash
npm run db:push
# или
npx prisma db push
```

3. Запустить сервер разработки:
```bash
npm run dev
```

## Структура проекта

- `/src/app` - страницы Next.js приложения
- `/src/components` - React компоненты, включая подкаталог `auth` для компонентов аутентификации
- `/src/providers` - контекстные провайдеры (auth-provider, theme-provider)
- `/src/lib/stores` - хранилища Zustand для управления состоянием
- `/src/server/api` - маршрутизаторы tRPC API
- `/project` - документация проекта

## Используемые технологии

- [Next.js](https://nextjs.org) - фреймворк для React
- [Prisma](https://prisma.io) - ORM для работы с базой данных
- [tRPC](https://trpc.io) - для создания типобезопасного API
- [HeroUI](https://heroui.dev) - библиотека компонентов UI
- [Zustand](https://zustand-demo.pmnd.rs/) - управление состоянием
- [Zod](https://zod.dev/) - валидация данных
