import { Metadata } from "next";
import ClientProviders from "./client-providers";
import { NavigationBlocker } from "./navigation-blocker";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Панель администратора | IDEX",
  description: "Управление платформой и пользователями",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavigationBlocker />
      <ClientProviders>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <div className="flex-1 px-4 py-6">
            {children}
          </div>
        </div>
      </ClientProviders>
    </>
  );
}
