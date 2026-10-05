import { useEffect, useState } from 'react'; import { Link, useSearchParams } from 'react-router-dom'; import api, { errMsg } from '../services/api.js';
import { Card, Table, LoadingSpinner, Empty, ErrorBox, RiskBadge, riskOf } from '../components/UI.jsx'; import { fmtDate } from '../utils/format.js';
export default function AdminAttempts() {
  const [q] = useSearchParams(); const risk = q.get('risk'); const [a, setA] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get('/attempts').then(r => setA(r.data)).catch(e => setErr(errMsg(e))); }, []);
  if (err) return <ErrorBox text={err} />; if (!a) return <LoadingSpinner />;
  const rows = risk ? [...a].sort((x, y) => y.riskScore - x.riskScore) : a;
  return <div className="page-enter space-y-5"><div><p className="text-sm font-semibold text-blue-600">Review center</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{risk ? 'Anti-Cheat Reports' : 'Attempts & Results'}</h1><p className="mt-1 text-sm text-slate-500">Signals are review aids only and do not prove misconduct.</p></div>
    <Card>{rows.length ? <Table head={['Student', 'Exam', 'Started', 'Status', 'Score', 'Warnings', 'Risk', '']}>{rows.map(x => <tr key={x._id}><td className="py-2 font-medium">{x.studentId?.name}</td><td>{x.examId?.title}</td><td>{fmtDate(x.startTime)}</td><td>{x.status.replace('_', ' ')}</td>
      <td>{x.status === 'in_progress' ? '-' : `${x.score}/${x.examId?.totalMarks}`}</td><td className="font-semibold text-amber-700">{x.warningCount} / 10</td><td><RiskBadge level={riskOf(x.riskScore)} /> <span className="text-xs text-slate-400">({x.riskScore})</span></td><td><Link className="text-indigo-600" to={`/admin/attempts/${x._id}`}>Report</Link></td></tr>)}</Table> : <Empty text="No attempts yet" />}</Card></div>;
}
