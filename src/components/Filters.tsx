'use client'
import { motion } from 'framer-motion';
import { useFinanceStore } from '@/store/useStore';

export default function Filters({ activeTab, setActiveTab, activePeriod, setActivePeriod }: any) {
  const { lang } = useFinanceStore();
  
  // Словарик для отображения
  const labels: any = {
    ru: { all: 'Все', day: 'День', week: 'Неделя', month: 'Месяц', expense: 'Расходы', income: 'Доходы' },
    en: { all: 'All', day: 'Day', week: 'Week', month: 'Month', expense: 'Expenses', income: 'Income' }
  };
  const t = labels[lang];

  const periods = [
    { id: 'all', label: t.all },
    { id: 'day', label: t.day },
    { id: 'week', label: t.week },
    { id: 'month', label: t.month },
  ];

  const tabs = [
    { id: 'all', label: t.all },
    { id: 'expense', label: t.expense },
    { id: 'income', label: t.income },
  ];

  return (
    <div className="space-y-6 mb-8 px-2">
      {/* Периоды */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {periods.map((p) => (
          <button key={p.id} onClick={() => setActivePeriod(p.id)}
            className={`relative px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors ${
              activePeriod === p.id ? 'text-white' : 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
            }`}
          >
            {activePeriod === p.id && <motion.div layoutId="periodBg" className="absolute inset-0 bg-zinc-900 dark:bg-blue-600 rounded-2xl z-0" />}
            <span className="relative z-10">{p.label}</span>
          </button>
        ))}
      </div>

      {/* Типы операций (Исправленные ID) */}
      <div className="relative flex bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-[24px]">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 py-3 text-xs font-bold z-10 transition-colors ${
              activeTab === tab.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
            }`}
          >
            {activeTab === tab.id && <motion.div layoutId="tabBg" className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-[18px] shadow-sm" />}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}