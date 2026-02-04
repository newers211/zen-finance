import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Определяем типы, чтобы TypeScript не ругался
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
}

interface FinanceStore {
  transactions: Transaction[];
  categories: Category[];
  currency: 'RUB' | 'USD';
  rate: number;
  lang: 'ru' | 'en';
  theme: 'light' | 'dark';
  
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setCategories: (categories: Category[]) => void;
  setCurrency: (currency: 'RUB' | 'USD') => void;
  setRate: (rate: number) => void;
  setLang: (lang: 'ru' | 'en') => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      transactions: [],
      categories: [],
      currency: 'RUB', // По умолчанию рубли
      rate: 92,        // Дефолтный курс, пока не загрузится реальный
      lang: 'ru',      // Язык по умолчанию
      theme: 'light',  // Тема

      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (transaction) => set((state) => ({ 
        transactions: [transaction, ...state.transactions] 
      })),
      setCategories: (categories) => set({ categories }),
      setCurrency: (currency) => set({ currency }),
      setRate: (rate) => set({ rate }),
      setLang: (lang) => set({ lang }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'zen-finance-storage', // Имя ключа в LocalStorage
    }
  )
);