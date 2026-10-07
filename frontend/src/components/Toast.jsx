import { createContext, useCallback, useContext, useState } from 'react';
const Ctx = createContext(() => {}); 
export const useToast = () => useContext(Ctx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((msg, type = 'info') => { 
    const id = Math.random(); setItems(i => [...i, { id, msg, type }]); setTimeout(() => setItems(i => i.filter(x => x.id !== id)), 4000); }, []);
  const color = { info: 'bg-slate-800', success: 'bg-emerald-600', error: 'bg-red-600', warn: 'bg-amber-600' };
  return <Ctx.Provider value={toast}>{children}
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">{items.map(t => <div key={t.id} className={`${color[t.type]} text-white text-sm px-4 py-2 rounded-lg shadow-lg`}>{t.msg}</div>)}</div></Ctx.Provider>;
}
