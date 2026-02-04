'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun } from 'lucide-react';
import { useFinanceStore } from '@/store/useStore';

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { theme, setTheme, lang, setLang } = useFinanceStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-8"><h2 className="text-xl font-black">Settings</h2><button onClick={onClose}><X/></button></div>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Theme</p>
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                  <button onClick={() => setTheme('light')} className={`flex items-center justify-center gap-2 py-2 rounded-lg ${theme === 'light' ? 'bg-white shadow-sm' : 'opacity-40'}`}><Sun size={14}/> Light</button>
                  <button onClick={() => setTheme('dark')} className={`flex items-center justify-center gap-2 py-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-700 text-white shadow-sm' : 'opacity-40'}`}><Moon size={14}/> Dark</button>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Language</p>
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                  <button onClick={() => setLang('ru')} className={`py-2 rounded-lg ${lang === 'ru' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'opacity-40'}`}>RU</button>
                  <button onClick={() => setLang('en')} className={`py-2 rounded-lg ${lang === 'en' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'opacity-40'}`}>EN</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}