import { useEffect, useRef, useState } from 'react'; 
import { Clock } from 'lucide-react'; 
import { fmtDur } from '../utils/format.js';

export default function Timer({ endTime, offset, onExpire }) {
  const calc = () => Math.max(0, Math.floor((endTime - (Date.now() + offset)) / 1000));
  const [s, setS] = useState(calc); const fired = useRef(false);
  useEffect(() => { const i = setInterval(() => { const r = calc(); setS(r); if (r === 0 && !fired.current) { fired.current = true; onExpire(); } }, 500); return () => clearInterval(i); }, [endTime, offset]);
  return <span className={`flex items-center gap-1 font-mono text-lg font-semibold ${s < 300 ? 'text-red-600' : ''}`}><Clock size={18} />{fmtDur(s)}</span>;
}
