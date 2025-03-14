// src/lib/stores/auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "@prisma/client";
import Cookies from "js-cookie";

// Дополнительные типы для работы с профилем пользователя
export interface Device {
  id: number;
  deviceName: string;
  deviceType: string;
  lastLogin: Date;
  ipAddress: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  balanceUSDT?: number;
  balanceRUB?: number;
  walletAddress?: string | null;
  createdAt?: Date;
}

export interface UserProfile {
  user: User;
  devices: Device[];
  unreadMessagesCount: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  activateAccount: (key: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      profile: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const cacheBuster = new Date().getTime();
          
          const response = await fetch(`/api/trpc/auth.login?cache=${cacheBuster}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Pragma': 'no-cache',
              'Cache-Control': 'no-cache',
            },
            body: JSON.stringify({
              json: { email, password }
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
          }
          
          let responseData;
          try {
            responseData = await response.json();
          } catch (error) {
            console.error('Ошибка парсинга JSON:', error);
            throw new Error('Ошибка при обработке ответа сервера');
          }
          
          console.log('Ответ сервера:', JSON.stringify(responseData));
          
          if (responseData.error) {
            const errorMessage = responseData.error.message || 'Ошибка входа. Пожалуйста, проверьте ваши учетные данные.';
            throw new Error(errorMessage);
          }
          
          if (!responseData.result || !responseData.result.data) {
            throw new Error('Получен пустой ответ от сервера');
          }
          
          const result = responseData.result.data.json || responseData.result.data;
          
          console.log('Обработанный результат:', result);
          
          if (!result) {
            throw new Error('Получены некорректные данные от сервера (нет result)');
          }
          
          if (!result.token) {
            console.error('Ответ без токена:', result);
            throw new Error('В ответе отсутствует токен авторизации');
          }
          
          if (!result.user) {
            console.error('Ответ без пользователя:', result);
            throw new Error('В ответе отсутствуют данные пользователя');
          }
          
          set({
            user: result.user,
            token: result.token,
            isLoading: false,
          });
          
          Cookies.set("auth-token", result.token, { expires: 7 }); // 7 days expiry
          
          return result;
        } catch (err) {
          console.error('Ошибка входа:', err);
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Ошибка входа",
            user: null,
            token: null
          });
          throw err; // Проброс ошибки для обработки в компоненте
        }
      },

      register: async (name, email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/trpc/auth.register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              json: { name, email, password }
            }),
            cache: 'no-store'
          });
          
          const responseText = await response.text();
          let responseData;
          
          try {
            responseData = JSON.parse(responseText);
          } catch (e) {
            console.error('Ошибка парсинга ответа:', responseText);
            throw new Error('Ошибка при обработке ответа сервера');
          }
          
          if (!response.ok || responseData.error) {
            const errorMessage = responseData.error?.message || 'Ошибка регистрации. Пожалуйста, попробуйте позже.';
            throw new Error(errorMessage);
          }
          
          const result = responseData.result.data;
          
          set({
            isLoading: false,
          });
          
          return result;
        } catch (err) {
          console.error('Ошибка регистрации:', err);
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Ошибка регистрации",
          });
          throw err;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          
          if (get().token) {
            await fetch('/api/trpc/auth.logout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get().token}`
              },
              body: JSON.stringify({
                json: {}
              }),
              cache: 'no-store'
            });
          }
          
          Cookies.remove("auth-token");
          
          set({
            user: null,
            token: null,
            profile: null,
            isLoading: false,
          });
        } catch (err) {
          console.error('Ошибка выхода:', err);
          Cookies.remove("auth-token");
          set({
            user: null,
            token: null,
            profile: null,
            isLoading: false,
            error: err instanceof Error ? err.message : "Ошибка выхода",
          });
        }
      },

      activateAccount: async (key) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/trpc/auth.activateAccount', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': get().token ? `Bearer ${get().token}` : ''
            },
            body: JSON.stringify({
              json: { key }
            }),
            cache: 'no-store'
          });
          
          const responseText = await response.text();
          let responseData;
          
          try {
            responseData = JSON.parse(responseText);
          } catch (e) {
            console.error('Ошибка парсинга ответа:', responseText);
            throw new Error('Ошибка при обработке ответа сервера');
          }
          
          if (!response.ok || responseData.error) {
            const errorMessage = responseData.error?.message || 'Ошибка активации аккаунта';
            throw new Error(errorMessage);
          }
          
          const result = responseData.result.data;
          
          if (get().user) {
            set({
              user: {
                ...get().user!,
                role: UserRole.USER,
              },
              isLoading: false,
            });
          }

          return result;
        } catch (err) {
          console.error('Ошибка активации аккаунта:', err);
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Ошибка активации аккаунта",
          });
          throw err;
        }
      },

      fetchProfile: async () => {
        try {
          // Проверяем, есть ли токен - если нет, то нет смысла запрашивать профиль
          const token = get().token;
          if (!token) {
            set({ isLoading: false });
            return;
          }
          
          set({ isLoading: true });
          
          // Добавим кеш-бастер для предотвращения кеширования
          const cacheBuster = new Date().getTime();
          
          const response = await fetch(`/api/trpc/auth.getProfile?cache=${cacheBuster}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Pragma': 'no-cache',
              'Cache-Control': 'no-cache',
            },
            body: JSON.stringify({
              json: {}
            }),
          });
          
          // Проверяем HTTP статус
          if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
          }
          
          // Парсим JSON напрямую
          let responseData;
          try {
            responseData = await response.json();
          } catch (error) {
            console.error('Ошибка парсинга JSON:', error);
            throw new Error('Ошибка при обработке ответа сервера');
          }
          
          // Выводим ответ для отладки
          console.log('Ответ сервера (профиль):', JSON.stringify(responseData));
          
          // Проверяем наличие ошибки в ответе
          if (responseData.error) {
            const errorMessage = responseData.error.message || 'Ошибка получения профиля';
            throw new Error(errorMessage);
          }
          
          // Проверяем наличие данных в ответе
          if (!responseData.result || !responseData.result.data) {
            throw new Error('Получен пустой ответ от сервера');
          }
          
          // tRPC обертывает данные в структуру: result.data.json
          const profileData = responseData.result.data.json || responseData.result.data;
          
          // Выводим обработанный результат для отладки
          console.log('Обработанный результат (профиль):', profileData);
          
          if (!profileData) {
            throw new Error('Получены некорректные данные профиля');
          }
          
          if (!profileData.user) {
            console.error('Ответ без данных пользователя:', profileData);
            throw new Error('В ответе отсутствуют данные пользователя');
          }
          
          // Устанавливаем профиль и пользователя
          set({
            profile: profileData as UserProfile,
            user: profileData.user as User,
            isLoading: false,
          });
          
          return profileData;
        } catch (err) {
          console.error('Ошибка получения профиля:', err);
          
          // Проверяем, связана ли ошибка с авторизацией
          const errorMessage = err instanceof Error ? err.message : "Ошибка получения профиля";
          
          if (errorMessage.includes('401') || 
              errorMessage.includes('UNAUTHORIZED') || 
              errorMessage.includes('авторизац')) {
            
            // При ошибке авторизации, сбрасываем состояние полностью
            Cookies.remove("auth-token");
            set({
              user: null,
              token: null,
              profile: null,
              isLoading: false,
              error: "Сессия истекла. Пожалуйста, войдите снова."
            });
          } else {
            // Другие ошибки не сбрасывают аутентификацию
            set({
              isLoading: false,
              error: errorMessage
            });
          }
          
          throw err;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
      }),
    }
  )
);