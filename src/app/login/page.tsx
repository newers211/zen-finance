'use client'
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, LogOut, Settings, Loader2, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import BalanceCard from '@/components/BalanceCard';
import AddTransaction from '@/components/AddTransaction';
import Filters from '@/components/Filters';
import SettingsModal from '@/components/SettingsModal';
import { useFinanceStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

const Chart = dynamic(() => import('@/components/Chart'), { ssr: false });

const translations = {
  ru: { 
    dashboard: 'Дашборд', history: 'История', income: 'Приход', expense: 'Расход', 
    empty: 'Тут пока пусто 🏜', loading: 'Загрузка...', greet: 'Привет', ops: 'операций',
    balance: 'Ваш баланс', all: 'Все', day: 'День', week: 'Неделя', month: 'Месяц'
  },
  en: { 
    dashboard: 'Dashboard', history: 'History', income: 'Income', expense: 'Expense', 
    empty: 'Nothing here yet 🏜', loading: 'Loading...', greet: 'Welcome', ops: 'transactions',
    balance: 'Total Balance', all: 'All', day: 'Day', week: 'Week', month: 'Month'
  }
};

export default function Home() {
  const router = useRouter();
  const { transactions, setTransactions, categories, setCategories, theme, lang } = useFinanceStore();
  
  const [activeTab, setActiveTab] = useState('all'); 
  const [activePeriod, setActivePeriod] = useState('all'); // Поставил 'all', чтобы история не была пустой
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const t = translations[lang];

  // ФИКС ТЕМЫ: Принудительно обновляем класс на body
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      setUserEmail(session.user.email || 'User');

      const [txReq, catReq] = await Promise.all([
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*')
      ]);

      if (txReq.data) setTransactions(txReq.data);
      if (catReq.data) setCategories(catReq.data);
      setLoading(false);
    };
    initApp();
  }, [router, setTransactions, setCategories]);

  const filteredData = useMemo(() => {
    return transactions.filter(tr => {
      const date = new Date(tr.created_at);
      const now = new Date();
      let periodMatch = true;
      if (activePeriod === 'day') periodMatch = date.toDateString() === now.toDateString();
      else if (activePeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        periodMatch = date >= weekAgo;
      } else if (activePeriod === 'month') {
        periodMatch = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }

      const typeMatch = activeTab === 'all' || 
                       (activeTab === 'expense' && tr.type === 'expense') || 
                       (activeTab === 'income' && tr.type === 'income');
      return periodMatch && typeMatch;
    });
  }, [transactions, activePeriod, activeTab]);

  const incomeTotal = filteredData.filter(i => i.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const expenseTotal = filteredData.filter(i => i.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] dark:bg-black">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <main className="min-h-screen transition-all duration-300 bg-[#F8F9FB] dark:bg-black p-4 pb-32 text-slate-900 dark:text-white">
      
      <header className="mb-8 pt-6 flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
            <User className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{t.greet},</p>
            <h1 className="text-sm font-black">{userEmail.split('@')[0]}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-zinc-400 shadow-sm active:scale-90 transition-all">
            <Settings size={20} />
          </button>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-red-500 transition-all active:scale-90">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <BalanceCard amount={incomeTotal - expenseTotal} />

      <div className="grid grid-cols-2 gap-4 my-8">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-[30px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 p-2 opacity-5 group-hover:opacity-10 transition-opacity text-green-500"><ArrowUpRight size={50}/></div>
          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">{t.income}</p>
          <p className="text-xl font-black">+{incomeTotal.toLocaleString()} ₽</p>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-[30px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 p-2 opacity-5 group-hover:opacity-10 transition-opacity text-red-500"><ArrowDownLeft size={50}/></div>
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">{t.expense}</p>
          <p className="text-xl font-black">-{expenseTotal.toLocaleString()} ₽</p>
        </div>
      </div>

      <Chart data={filteredData} />
      
      <Filters 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        activePeriod={activePeriod} setActivePeriod={setActivePeriod} 
      />

      <section className="mt-8 space-y-4">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-xl font-black italic tracking-tighter uppercase">{t.history}</h2>
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{filteredData.length} {t.ops}</span>
        </div>
        
        <AnimatePresence mode='popLayout'>
          {filteredData.map((tr) => (
            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} key={tr.id}
              className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-50 dark:border-zinc-800 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-[20px] flex items-center justify-center text-3xl shadow-inner group-hover:rotate-6 transition-transform">
                  {categories.find(c => c.name === tr.category)?.icon || '📦'}
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-800 dark:text-zinc-100">{tr.category}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">
                    {new Date(tr.created_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
              <p className={`font-black text-sm ${tr.type === 'income' ? 'text-green-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                {tr.type === 'income' ? '+' : '-'}{Math.abs(tr.amount).toLocaleString()} ₽
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredData.length === 0 && <div className="py-20 text-center opacity-30 text-xs font-black uppercase">{t.empty}</div>}
      </section>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AddTransaction />
    </main>
  );
}