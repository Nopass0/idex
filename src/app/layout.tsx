import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "IDEX",
  description: "IDEX",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <ThemeProvider defaultTheme="system" storageKey="idex-theme">
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <Navigation />
                <main className="flex-grow">
                  {children}
                </main>
              </div>
            </AuthProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
