import { useState, useCallback } from "react";

/**
 * Хук для управления состоянием открытия/закрытия модальных окон и выпадающих меню
 * @returns Объект с состоянием и методами управления
 */
export function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle
  };
}
