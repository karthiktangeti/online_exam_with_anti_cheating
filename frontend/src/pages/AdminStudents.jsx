import { useEffect, useState } from 'react'; import api, { errMsg } from '../services/api.js'; import { Card, Table, LoadingSpinner, Empty, ErrorBox } from '../components/UI.jsx'; import { fmtDate } from '../utils/format.js';
export default function AdminStudents() {
  const [s, setS] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get('/admin/students').then(r => setS(r.data)).catch(e => setErr(errMsg(e))); }, []);
  if (err) return <ErrorBox text={err} />; if (!s) return <LoadingSpinner />;
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Students</h1><Card>{s.length ? <Table head={['Name', 'Email', 'Joined', 'Attempts']}>{s.map(x => <tr key={x._id}><td className="py-2 font-medium">{x.name}</td><td>{x.email}</td><td>{fmtDate(x.createdAt)}</td><td>{x.attempts}</td></tr>)}</Table> : <Empty text="No students registered" />}</Card></div>;
}
