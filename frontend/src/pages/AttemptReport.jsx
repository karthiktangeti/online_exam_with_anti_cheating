import { useEffect, useState } from 'react'; import { Link, useParams } from 'react-router-dom'; import api, { errMsg } from '../services/api.js';
import { Card, LoadingSpinner, ErrorBox, RiskBadge } from '../components/UI.jsx'; import IncidentTimeline from '../components/IncidentTimeline.jsx'; import { fmtDur, timeTaken, label } from '../utils/format.js';
const TYPES = ['TAB_SWITCH', 'FULLSCREEN_EXIT', 'COPY_ATTEMPT', 'PASTE_ATTEMPT', 'CUT_ATTEMPT', 'RIGHT_CLICK', 'KEYBOARD_SHORTCUT', 'MULTIPLE_SESSION', 'NO_FACE_DETECTED', 'MULTIPLE_FACES_DETECTED', 'HEAD_TURN_LEFT', 'HEAD_TURN_RIGHT', 'LOOKING_DOWN', 'NO_FACE', 'MULTIPLE_FACES', 'LOOKING_AWAY', 'PHONE_DETECTED', 'CAMERA_DISABLED'];
export default function AttemptReport() {
  const { id } = useParams(); const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => {
    let alive = true;
    const load = () => api.get(`/anti-cheat/attempt/${id}`).then(r => alive && setD(r.data)).catch(e => alive && setErr(errMsg(e)));
    load(); const timer = setInterval(load, 5000); return () => { alive = false; clearInterval(timer); };
  }, [id]);
  if (err) return <ErrorBox text={err} />; if (!d) return <LoadingSpinner />;
  const a = d.attempt;
  return <div className="space-y-4"><Link to="/admin/attempts" className="text-sm text-indigo-600">← Attempts</Link><h1 className="text-2xl font-bold">Anti-Cheat Report</h1>
    <Card><div className="grid sm:grid-cols-2 gap-2 text-sm"><p><b>Student:</b> {a.studentId?.name} ({a.studentId?.email})</p><p><b>Exam:</b> {a.examId?.title}</p><p><b>Attempt:</b> #{a._id.slice(-6)}</p>
      <p><b>Score:</b> {a.score}/{a.examId?.totalMarks}</p><p><b>Duration:</b> {a.submittedAt ? fmtDur(timeTaken(a)) : 'in progress'}</p><p className="flex items-center gap-2"><b>Review status:</b> <RiskBadge level={d.risk.level} /> <span className="text-slate-400">score {d.risk.score}</span></p></div>
      <p className="text-xs text-slate-500 mt-3">Warnings: <b>{d.events.filter(e => e.severity > 0).length} / 10</b>. These are anti-cheat signals for administrator review, not a finding of misconduct.</p></Card>
    <Card><h2 className="font-semibold mb-3">Signal summary</h2><div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">{TYPES.map(t => <div key={t} className="flex justify-between bg-slate-50 rounded px-3 py-2"><span>{label(t)}</span><b>{d.counts[t] || 0}</b></div>)}</div></Card>
    <Card><h2 className="font-semibold mb-3">Timeline</h2><IncidentTimeline events={d.events} /></Card></div>;
}
