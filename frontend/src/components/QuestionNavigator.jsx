export default function QuestionNavigator({ questions, current, answers, marked, onGo }) {
  return <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">{questions.map((q, i) => {
    const cls = i === current ? 'bg-indigo-600 text-white' : marked.includes(q._id) ? 'bg-amber-400 text-white' : answers[q._id] != null ? 'bg-emerald-500 text-white' : 'bg-slate-200';
    return <button key={q._id} onClick={() => onGo(i)} className={`h-9 rounded-md text-sm font-medium ${cls}`}>{i + 1}</button>; })}</div>;
}
