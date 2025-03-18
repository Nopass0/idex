import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Navigation } from "@/components/navigation";
import { useToast } from "@heroui/toast";
import {ToastProvider} from "@heroui/toast";
import { HeroUIProvider } from "@heroui/system";

export const metadata: Metadata = {
  title: "IDEX",
  description: "IDEX",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// Определяем темы для HeroUI
const lightTheme = {
  colors: {
    primary: {
      50: "#e6f0ec",
      100: "#cce2d9",
      200: "#99c4b3",
      300: "#66a78d",
      400: "#338967",
      500: "#006039", // Основной primary цвет
      600: "#004e2e",
      700: "#003a22",
      800: "#002717",
      900: "#00130b",
    },
  },
};

const darkTheme = {
  colors: {
    primary: {
      50: "#e6f5ed",
      100: "#cceadb",
      200: "#99d5b7",
      300: "#66c093",
      400: "#33ab6f",
      500: "#008047", // Слегка светлее для темной темы
      600: "#006639",
      700: "#004d2b",
      800: "#00331c",
      900: "#00190e",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <ThemeProvider defaultTheme="system" storageKey="idex-theme">
            <HeroUIProvider>
              {/* <ToastProvider> */}
              <AuthProvider>
                <div className="flex flex-col min-h-screen">
                  <Navigation />
                  <main className="flex-1">
                    {children}
                  </main>
                </div>
              </AuthProvider>
              {/* </ToastProvider> */}
            </HeroUIProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
