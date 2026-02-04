'use client'
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, Loader2, User, ArrowUpRight, ArrowDownLeft, DollarSign, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Локальные компоненты
import BalanceCard from '@/components/BalanceCard';
import AddTransaction from '@/components/AddTransaction';
import Filters from '@/components/Filters';
import SettingsModal from '@/components/SettingsModal';

// Глобальное состояние и база данных
import { useFinanceStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

const Chart = dynamic(() => import('@/components/Chart'), { ssr: false });

const translations = {
  ru: { 
    greet: 'Привет', balance: 'Ваш баланс', income: 'Приход', expense: 'Расход', 
    history: 'История', ops: 'операций', empty: 'История пуста 🏜', loading: 'Загрузка...',
    analytics: 'Аналитика'
  },
  en: { 
    greet: 'Welcome', balance: 'Total Balance', income: 'Income', expense: 'Expense', 
    history: 'History', ops: 'transactions', empty: 'No history yet 🏜', loading: 'Loading...',
    analytics: 'Analytics'
  }
};

export default function Home() {
  const router = useRouter();
  
  // Достаем всё необходимое из глобального стора (включая валюту и курс)
  const { 
    transactions, setTransactions, 
    categories, setCategories, 
    theme, lang, 
    currency, setCurrency, 
    rate, setRate 
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState('all'); 
  const [activePeriod, setActivePeriod] = useState('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const t = translations[lang];

  // 1. ЗАГРУЗКА КУРСА ВАЛЮТ (Обновляем глобальный стор)
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data && data.rates && data.rates.RUB) {
          setRate(data.rates.RUB);
        }
      } catch (err) {
        console.error("Ошибка загрузки курса:", err);
        setRate( rate || 92); // Запасной вариант, если API упал
      }
    };
    fetchRate();
  }, [setRate, rate]);

  // 2. ФУНКЦИЯ ФОРМАТИРОВАНИЯ (Для карточек и истории)
  const formatVal = (val: number) => {
    const converted = currency === 'RUB' ? val : val / rate;
    const sign = currency === 'RUB' ? '₽' : '$';
    return {
      text: converted.toLocaleString(undefined, { 
        minimumFractionDigits: currency === 'USD' ? 2 : 0, 
        maximumFractionDigits: 2 
      }),
      sign
    };
  };

  // 3. ТЕМНАЯ/СВЕТЛАЯ ТЕМА
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // 4. ИНИЦИАЛИЗАЦИЯ ДАННЫХ
  useEffect(() => {
    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      
      setUserEmail(session.user.email || 'User');
      
      const [tx, cat] = await Promise.all([
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*')
      ]);
      
      if (tx.data) setTransactions(tx.data);
      if (cat.data) setCategories(cat.data);
      setLoading(false);
    };
    initApp();
  }, [router, setTransactions, setCategories]);

  // 5. ФИЛЬТРАЦИЯ
  const filteredData = useMemo(() => {
    return transactions.filter(tr => {
      const date = new Date(tr.created_at);
      const now = new Date();
      let pMatch = true;
      if (activePeriod === 'day') pMatch = date.toDateString() === now.toDateString();
      else if (activePeriod === 'week') pMatch = date >= new Date(now.setDate(now.getDate() - 7));
      else if (activePeriod === 'month') pMatch = date.getMonth() === now.getMonth();
      return pMatch && (activeTab === 'all' || tr.type === activeTab);
    });
  }, [transactions, activePeriod, activeTab]);

  const inc = filteredData.filter(i => i.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const exp = filteredData.filter(i => i.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8F9FB] dark:bg-black transition-colors duration-500">
      <Loader2 className="animate-spin text-blue-600"/>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8F9FB] dark:bg-black text-slate-900 dark:text-white p-4 pb-32 transition-colors duration-500">
      <header className="flex justify-between items-center py-6 max-w-2xl mx-auto px-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg shadow-blue-500/5 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-blue-600">
            <User size={20}/>
          </div>
          <div className="leading-none">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{t.greet},</p>
            <h1 className="text-sm font-black truncate max-w-[150px]">{userEmail.split('@')[0]}</h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* КНОПКА ПЕРЕКЛЮЧЕНИЯ ВАЛЮТЫ (Обновляет глобальный стор) */}
          <button 
            onClick={() => setCurrency(currency === 'RUB' ? 'USD' : 'RUB')}
            className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-90 transition-all flex items-center gap-2"
          >
            {currency === 'RUB' ? <Coins size={20} className="text-amber-500" /> : <DollarSign size={20} className="text-green-500" />}
            <span className="text-[10px] font-bold">{currency}</span>
          </button>
          
          <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-90 transition-all">
            <Settings size={20}/>
          </button>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-red-500 active:scale-90 transition-all">
            <LogOut size={20}/>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Баланс теперь принимает параметры из стора */}
        <BalanceCard 
          amount={inc - exp} 
          title={t.balance} 
          currencySign={currency === 'RUB' ? '₽' : '$'} 
          rate={currency === 'RUB' ? 1 : rate}
        />

        <div className="grid grid-cols-2 gap-4">
          <motion.div whileHover={{ y: -5 }} className="p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-green-500/5 relative overflow-hidden group">
            <div className="absolute -right-2 -top-2 opacity-10 text-green-500 group-hover:scale-110 transition-transform">
              <ArrowUpRight size={60}/>
            </div>
            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">{t.income}</p>
            <p className="text-2xl font-black">
              {currency === 'RUB' ? '+' : ''}{formatVal(inc).text} {formatVal(inc).sign}
            </p>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} className="p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-red-500/5 relative overflow-hidden group">
            <div className="absolute -right-2 -top-2 opacity-10 text-red-500 group-hover:scale-110 transition-transform">
              <ArrowDownLeft size={60}/>
            </div>
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">{t.expense}</p>
            <p className="text-2xl font-black">
              {currency === 'RUB' ? '-' : ''}{formatVal(exp).text} {formatVal(exp).sign}
            </p>
          </motion.div>
        </div>

        {/* График также использует данные из стора */}
        <Chart 
          data={filteredData} 
          currencySign={currency === 'RUB' ? '₽' : '$'} 
          rate={currency === 'RUB' ? 1 : rate} 
        />
        
        <Filters 
          activeTab={activeTab} setActiveTab={setActiveTab} 
          activePeriod={activePeriod} setActivePeriod={setActivePeriod} 
        />

        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">{t.history}</h2>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{filteredData.length} {t.ops}</span>
          </div>
          
          <AnimatePresence mode='popLayout'>
            {filteredData.map((tr) => (
              <motion.div 
                layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={tr.id}
                className="group flex items-center justify-between p-5 bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-50 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-[22px] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                    {categories.find(c => c.name === tr.category)?.icon || '📦'}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{tr.category}</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                      {new Date(tr.created_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <p className={`font-black text-lg ${tr.type === 'income' ? 'text-green-500' : 'text-zinc-900 dark:text-white'}`}>
                  {tr.type === 'income' ? '+' : '-'}{formatVal(tr.amount).text} {formatVal(tr.amount).sign}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredData.length === 0 && (
            <div className="py-20 text-center opacity-20 text-xs font-black uppercase tracking-[0.4em]">
              {t.empty}
            </div>
          )}
        </section>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AddTransaction />
    </main>
  );
}