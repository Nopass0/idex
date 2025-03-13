// src/providers/auth-provider.tsx
"use client";

import { ReactNode, createContext, useContext, useEffect } from "react";
import { useAuthStore, type User, type UserProfile } from "@/lib/stores/auth-store";
import { api } from "@/trpc/react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { UserRole } from "@prisma/client";

// Define the Auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isGuest: boolean;
  isActivated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  activateAccount: (key: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { 
    user, 
    token, 
    profile,
    isLoading,
    error,
    login, 
    register, 
    logout, 
    activateAccount,
    fetchProfile,
    clearError
  } = useAuthStore();
  
  const router = useRouter();
  const pathname = usePathname();
  
  // Set up auth header for tRPC requests
  useEffect(() => {
    if (token) {
      // If token exists in store, ensure cookie is set
      Cookies.set("auth-token", token, { expires: 7 });
    }
  }, [token]);
  
  // Sync client-side token with server-side token
  useEffect(() => {
    const cookieToken = Cookies.get("auth-token");
    const storeToken = token;
    
    if (!cookieToken && storeToken) {
      // If cookie is missing but we have a token in store, re-set it
      Cookies.set("auth-token", storeToken, { expires: 7 });
    } else if (cookieToken && !storeToken) {
      // If store is missing token but cookie exists, clear cookie
      Cookies.remove("auth-token");
    }
  }, [token]);
  
  // Проверка аутентификации при загрузке страницы
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const cookieToken = Cookies.get("auth-token");
        
        // Если есть токен в куки, но нет данных пользователя, загружаем профиль
        if (cookieToken && !user) {
          // Устанавливаем токен в хранилище, если его там нет
          if (!token) {
            useAuthStore.setState({ token: cookieToken });
          }
          await fetchProfile();
        }
      } catch (err) {
        console.error("Ошибка проверки аутентификации:", err);
        
        // Очищаем данные аутентификации при ошибке
        Cookies.remove("auth-token");
        useAuthStore.setState({ token: null, user: null, profile: null });
        
        // Перенаправляем на логин только если это защищенная страница
        if (pathname.startsWith('/profile') || 
            pathname.startsWith('/admin') || 
            pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
      }
    };
    
    checkAuth();
  }, [token, user, pathname, router, fetchProfile]);

  // Derived state
  const isAuthenticated = !!user;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isGuest = user?.role === UserRole.GUEST;
  const isActivated = user?.role === UserRole.USER || user?.role === UserRole.ADMIN;

  // Context value
  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    profile,
    isAdmin,
    isGuest,
    isActivated,
    error,
    login,
    register,
    logout,
    activateAccount,
    fetchProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}