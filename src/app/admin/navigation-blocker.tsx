"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Компонент NavigationBlocker блокирует стандартную навигацию в админ-панели
 * и скрывает основное меню сайта на страницах администратора
 */
export function NavigationBlocker() {
  const { isAdmin } = useAuthStore();

  useEffect(() => {
    // Скрываем стандартное навигационное меню
    const body = document.body;
    body.classList.add('admin-page');

    // Создаем и добавляем CSS для скрытия навигации
    const style = document.createElement('style');
    style.textContent = `
      body.admin-page header {
        display: none !important;
      }
      
      @media (max-width: 768px) {
        body.admin-page {
          padding-top: 60px;
        }
      }
    `;
    document.head.appendChild(style);

    // Удаляем стили при размонтировании компонента
    return () => {
      body.classList.remove('admin-page');
      document.head.removeChild(style);
    };
  }, []);

  // Этот компонент не рендерит никакого UI
  return null;
}
