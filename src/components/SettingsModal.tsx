'use client'
import { X } from 'lucide-react';
import { useFinanceStore } from '@/store/useStore';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { lang, currency, setLang, setCurrency } = useFinanceStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[30px] p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
          <X size={18} />
        </button>
        <h2 className="text-xl font-black mb-6">Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Language</label>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setLang('ru')} className={`flex-1 py-3 rounded-xl font-bold ${lang === 'ru' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}>RU</button>
              <button onClick={() => setLang('en')} className={`flex-1 py-3 rounded-xl font-bold ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}>EN</button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Currency</label>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setCurrency('RUB')} className={`flex-1 py-3 rounded-xl font-bold ${currency === 'RUB' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}>RUB (₽)</button>
              <button onClick={() => setCurrency('USD')} className={`flex-1 py-3 rounded-xl font-bold ${currency === 'USD' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}>USD ($)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}