import { fmtDur, timeTaken } from '../utils/format.js'; 
import { Card } from './UI.jsx';
import { CheckCircle2 } from 'lucide-react';
export default function ResultCard({ attempt }) {
  const e = attempt.examId, pct = e.totalMarks ? Math.round((attempt.score / e.totalMarks) * 100) : 0, passed = attempt.score >= e.passingMarks;
  const rows = [['Score', `${attempt.score} / ${e.totalMarks}`], ['Correct', attempt.correct], ['Wrong', attempt.wrong], ['Unanswered', attempt.unanswered], ['Percentage', pct + '%'], ['Time Taken', fmtDur(timeTaken(attempt))]];
  return <Card className="mx-auto max-w-lg"><div className="mb-6 text-center"><div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600"><CheckCircle2 size={28} /></div><h2 className="text-2xl font-bold tracking-tight">Exam result</h2><p className="mt-1 text-sm text-slate-500">{e.title}</p></div>
    <p className={`text-center font-semibold mt-2 ${passed ? 'text-emerald-600' : 'text-red-600'}`}>{passed ? 'PASSED' : 'NOT PASSED'}</p>
    <div className="mt-4 divide-y">{rows.map(([k, v]) => <div key={k} className="flex justify-between py-2"><span className="text-slate-500">{k}</span><span className="font-semibold">{v}</span></div>)}<div className="flex justify-between py-2"><span className="text-slate-500">Monitoring warnings</span><span className="font-semibold text-amber-700">{attempt.antiCheatWarningCount || 0} / 10</span></div></div>
    {attempt.autoSubmitReason === 'EXAM_AUTO_SUBMITTED_ANTI_CHEAT' && <p className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">Your exam was automatically submitted because the maximum number of exam monitoring warnings was reached. This is a review signal, not an accusation.</p>}</Card>;
}
