import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Описание структуры хранилища
interface FinanceStore {
  // Данные
  transactions: any[];
  categories: any[];
  
  // Настройки интерфейса
  theme: 'light' | 'dark';
  lang: 'ru' | 'en';
  
  // Логика валюты
  currency: 'RUB' | 'USD';
  rate: number;

  // Методы для обновления данных
  setTransactions: (t: any[]) => void;
  addTransaction: (t: any) => void;
  setCategories: (c: any[]) => void;
  
  // Методы для настроек
  setTheme: (t: 'light' | 'dark') => void;
  setLang: (l: 'ru' | 'en') => void;
  setCurrency: (c: 'RUB' | 'USD') => void;
  setRate: (r: number) => void;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      // Начальные состояния
      transactions: [],
      categories: [],
      theme: 'light',
      lang: 'ru',
      currency: 'RUB',
      rate: 90, // Значение по умолчанию, обновится из API на главной

      // Реализация методов
      setTransactions: (t) => set({ transactions: t }),
      
      // Добавляет новую транзакцию в начало списка (важно для мгновенного обновления истории)
      addTransaction: (t) => set((state) => ({ 
        transactions: [t, ...state.transactions] 
      })),

      setCategories: (c) => set({ categories: c }),
      
      setTheme: (t) => set({ theme: t }),
      setLang: (l) => set({ lang: l }),
      
      setCurrency: (c) => set({ currency: c }),
      setRate: (r) => set({ rate: r }),
    }),
    { 
      name: 'zen-finance-storage', // Ключ в localStorage
    }
  )
);