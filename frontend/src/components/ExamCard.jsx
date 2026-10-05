import { Clock, HelpCircle, Award, ArrowRight } from 'lucide-react'; import { Card, btn } from './UI.jsx'; import { fmtDate } from '../utils/format.js';
const visuals = ['from-[#dce8f4] to-[#f5f8fb]', 'from-[#e4e3ec] to-[#f7f6fa]', 'from-[#f4e5d9] to-[#fbf8f5]'];
export default function ExamCard({ exam, status, index = 0, onStart }) {
  const colors = { Available: 'bg-emerald-100 text-emerald-700', Upcoming: 'bg-blue-100 text-blue-700', 'In progress': 'bg-amber-100 text-amber-700', Closed: 'bg-slate-200 text-slate-600' };
  return <Card className="overflow-hidden border-0 p-0 shadow-sm"><div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${visuals[index % visuals.length]}`}><div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#6b4b91 1px, transparent 1px)', backgroundSize: '14px 14px' }} /><BookIcon /></div><div className="p-5"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-slate-900">{exam.title}</h3><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors[status]}`}>{status}</span></div>
    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{exam.description || 'Test your knowledge and track your progress.'}</p>
    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><HelpCircle size={13} />{exam.questionCount} questions</span><span className="flex items-center gap-1"><Clock size={13} />{exam.duration} min</span><span className="flex items-center gap-1"><Award size={13} />{exam.totalMarks} marks</span></div>
    <p className="mt-2 text-xs text-slate-400">{fmtDate(exam.startDate)} → {fmtDate(exam.endDate)}</p>
    {(status === 'Available' || status === 'In progress') && <button className={btn + ' mt-4 w-full rounded-lg'} onClick={onStart}>{status === 'In progress' ? 'Resume exam' : 'Start exam'} <ArrowRight size={15} /></button>}</div></Card>;
}
function BookIcon() { return <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/85 text-blue-600 shadow-sm"><Award size={28} /></div>; }
