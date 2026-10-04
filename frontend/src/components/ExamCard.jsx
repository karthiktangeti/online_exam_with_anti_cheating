import { Clock, HelpCircle, Award } from 'lucide-react'; import { Card, btn } from './UI.jsx'; import { fmtDate } from '../utils/format.js';
export default function ExamCard({ exam, status, onStart }) {
  const colors = { Available: 'bg-emerald-100 text-emerald-700', Upcoming: 'bg-blue-100 text-blue-700', 'In progress': 'bg-amber-100 text-amber-700', Closed: 'bg-slate-200 text-slate-600' };
  return <Card><div className="flex justify-between items-start gap-2"><h3 className="font-semibold">{exam.title}</h3><span className={`text-xs px-2 py-0.5 rounded-full ${colors[status]}`}>{status}</span></div>
    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{exam.description}</p>
    <div className="flex flex-wrap gap-3 text-xs text-slate-600 mt-3"><span className="flex items-center gap-1"><HelpCircle size={13} />{exam.questionCount} questions</span><span className="flex items-center gap-1"><Clock size={13} />{exam.duration} min</span><span className="flex items-center gap-1"><Award size={13} />{exam.totalMarks} marks</span></div>
    <p className="text-xs text-slate-500 mt-2">{fmtDate(exam.startDate)} → {fmtDate(exam.endDate)}</p>
    {(status === 'Available' || status === 'In progress') && <button className={btn + ' mt-3 w-full'} onClick={onStart}>{status === 'In progress' ? 'Resume Exam' : 'Start Exam'}</button>}</Card>;
}
