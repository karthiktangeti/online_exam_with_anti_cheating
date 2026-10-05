import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api.js';
import { Card, Empty, ErrorBox, LoadingSpinner } from '../components/UI.jsx';
import { fmtDate } from '../utils/format.js';

export default function StudentResults() {
  const [attempts, setAttempts] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/attempts/mine').then(({ data }) => setAttempts(data.filter(a => a.status !== 'in_progress'))).catch(e => setErr(errMsg(e)));
  }, []);

  if (err) return <ErrorBox text={err} />;
  if (!attempts) return <LoadingSpinner />;

  return <div className="page-enter space-y-6">
    <div><p className="text-sm font-semibold text-blue-600">Student workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Results</h1><p className="mt-2 text-sm text-slate-500">Review your completed assessments and scores.</p></div>
    <Card>{attempts.length ? <div className="divide-y divide-slate-100">{attempts.map(attempt => <Link key={attempt._id} to={`/result/${attempt._id}`} className="flex flex-col gap-2 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-800">{attempt.examId?.title}</p><p className="mt-1 text-xs text-slate-400">Submitted {fmtDate(attempt.submittedAt)}</p></div><span className="font-semibold text-blue-600">{attempt.score}/{attempt.examId?.totalMarks}<span className="ml-1 text-xs font-normal text-slate-400">View report</span></span></Link>)}</div> : <Empty text="No results yet" />}</Card>
  </div>;
}
