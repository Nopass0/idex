// src/providers/theme-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Проверка, находимся ли мы на клиенте
const isClient = typeof window !== 'undefined';

// Безопасное получение темы из localStorage
const getStoredTheme = (storageKey: string, defaultTheme: Theme): Theme => {
  if (!isClient) return defaultTheme;
  
  try {
    const storedTheme = localStorage.getItem(storageKey) as Theme;
    return storedTheme || defaultTheme;
  } catch (error) {
    return defaultTheme;
  }
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Инициализация темы только после монтирования компонента
  useEffect(() => {
    setMounted(true);
    const storedTheme = getStoredTheme(storageKey, defaultTheme);
    setTheme(storedTheme);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    if (!mounted || !isClient) return;

    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, mounted]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      if (isClient) {
        try {
          localStorage.setItem(storageKey, newTheme);
        } catch (error) {
          console.error("Ошибка при сохранении темы:", error);
        }
      }
      setTheme(newTheme);
    },
  };

  // Рендерим children только после монтирования компонента на клиенте
  // чтобы избежать несоответствия серверного и клиентского рендеринга
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};