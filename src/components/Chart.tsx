'use client'
import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '@/store/useStore';

// ПАЛИТРА ДЛЯ РАСХОДОВ (Красные и теплые оттенки)
const EXPENSE_COLORS = [
  '#FF4D4D', '#FF0000', '#D90429', '#EF233C', '#8D0801', 
  '#F72585', '#B5179E', '#E63946', '#F08080', '#9B2226'
];

// ПАЛИТРА ДЛЯ ДОХОДОВ (Разнообразные красивые и сочные цвета)
const INCOME_COLORS = [
  '#00F5D4', '#00BBF9', '#9B5DE5', '#F15BB5', '#FEE440', 
  '#31572C', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'
];

const translations = {
  ru: { expense: 'Траты', income: 'Доходы', total: 'Итого' },
  en: { expense: 'Expenses', income: 'Income', total: 'Total' }
};

interface ChartProps {
  data: any[];
  currencySign: string;
  rate: number;
}

export default function Chart({ data = [], currencySign, rate }: ChartProps) {
  const { lang } = useFinanceStore();
  const t = translations[lang === 'ru' ? 'ru' : 'en'];
  const [view, setView] = useState<'expense' | 'income'>('expense');

  const chartData = useMemo(() => {
    const grouped = data
      .filter(t => t.type === view)
      .reduce((acc: any[], t) => {
        const existing = acc.find(item => item.name === t.category);
        if (existing) existing.value += Number(Math.abs(t.amount));
        else acc.push({ name: t.category, value: Number(Math.abs(t.amount)) });
        return acc;
      }, []);
    return grouped.sort((a, b) => b.value - a.value);
  }, [data, view]);

  const totalSum = chartData.reduce((acc, item) => acc + item.value, 0);
  const displaySum = currencySign === '₽' ? totalSum : totalSum / rate;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-white dark:bg-zinc-900/50 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl shadow-blue-500/5 border border-zinc-100 dark:border-zinc-800/50 mb-8 transition-colors duration-500"
    >
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
          {view === 'expense' ? t.expense : t.income}
        </h3>
        
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-[20px] relative">
          {(['expense', 'income'] as const).map((type) => (
            <button 
              key={type}
              onClick={() => setView(type)}
              className={`relative px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-colors duration-300 z-10 ${
                view === type ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
              }`}
            >
              {view === type && (
                <motion.div 
                  layoutId="activeChartTab"
                  className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-xl shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-20">{t[type]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.length ? chartData : [{ name: 'Empty', value: 1 }]}
              innerRadius={75}
              outerRadius={95}
              paddingAngle={chartData.length ? 5 : 0}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
              cx="50%"
              cy="50%"
            >
              {chartData.length ? chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={view === 'expense' ? EXPENSE_COLORS[index % EXPENSE_COLORS.length] : INCOME_COLORS[index % INCOME_COLORS.length]} 
                  className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                />
              )) : (
                <Cell fill="#f4f4f5" />
              )}
            </Pie>
            
            <Tooltip 
              cursor={false}
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const val = currencySign === '₽' ? payload[0].value : payload[0].value / rate;
                  return (
                    <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-700 outline-none">
                      <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">{payload[0].name}</p>
                      <p className="text-sm font-black text-zinc-900 dark:text-white">
                        {val.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currencySign}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={view + displaySum}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-1">{t.total}</span>
              <p className={`text-2xl font-black tracking-tighter ${view === 'expense' ? 'text-zinc-900 dark:text-white' : 'text-green-500'}`}>
                {displaySum.toLocaleString(undefined, { 
                    minimumFractionDigits: currencySign === '$' ? 2 : 0, 
                    maximumFractionDigits: 2 
                })} {currencySign}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}