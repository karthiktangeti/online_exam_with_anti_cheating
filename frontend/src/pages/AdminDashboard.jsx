import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import { Users, FileText, ClipboardList, Percent } from 'lucide-react';
import api, { errMsg } from '../services/api.js'; import { Card, Stat, Table, LoadingSpinner, ErrorBox, Empty } from '../components/UI.jsx'; import { fmtDate, label } from '../utils/format.js';
export default function AdminDashboard() {
  const [s, setS] = useState(null); const [inc, setInc] = useState([]); const [err, setErr] = useState('');
  useEffect(() => { Promise.all([api.get('/admin/stats'), api.get('/anti-cheat/recent')]).then(([a, b]) => { setS(a.data); setInc(b.data); }).catch(e => setErr(errMsg(e))); }, []);
  if (err) return <ErrorBox text={err} />; if (!s) return <LoadingSpinner />;
  return <div className="space-y-6"><h1 className="text-2xl font-bold">Dashboard</h1>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Stat label="Students" value={s.totalStudents} icon={Users} /><Stat label="Exams" value={s.totalExams} icon={FileText} /><Stat label="Attempts" value={s.totalAttempts} icon={ClipboardList} /><Stat label="Avg score" value={s.averageScore + '%'} icon={Percent} /></div>
    <Card><h2 className="font-semibold mb-3">Recent attempts</h2>{s.recentAttempts.length ? <Table head={['Student', 'Exam', 'Score', 'Status', '']}>{s.recentAttempts.map(a => <tr key={a._id}><td className="py-2">{a.studentId?.name}</td><td>{a.examId?.title}</td><td>{a.score}/{a.examId?.totalMarks}</td><td>{a.status.replace('_', ' ')}</td><td><Link className="text-indigo-600" to={`/admin/attempts/${a._id}`}>Report</Link></td></tr>)}</Table> : <Empty text="No attempts yet" />}</Card>
    <Card><h2 className="font-semibold mb-3">Recent anti-cheat signals</h2>{inc.length ? <Table head={['Time', 'Student', 'Exam', 'Signal']}>{inc.map(e => <tr key={e._id}><td className="py-2">{fmtDate(e.timestamp)}</td><td>{e.studentId?.name}</td><td>{e.examId?.title}</td><td>{label(e.eventType)}</td></tr>)}</Table> : <Empty text="No signals recorded" />}</Card></div>;
}
