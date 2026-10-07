import { useEffect, useState } from 'react'; 
import api, { errMsg } from '../services/api.js'; 
import { Card, Table, LoadingSpinner, Empty, ErrorBox } from '../components/UI.jsx'; 
import { fmtDate } from '../utils/format.js';
export default function AdminStudents() {
  const [s, setS] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get('/admin/students').then(r => setS(r.data)).catch(e => setErr(errMsg(e))); }, []);
  if (err) return <ErrorBox text={err} />; if (!s) return <LoadingSpinner />;
  return <div className="page-enter space-y-5"><div><p className="text-sm font-semibold text-blue-600">People</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Students</h1><p className="mt-1 text-sm text-slate-500">View registered students and their assessment activity.</p></div><Card>{s.length ? <Table head={['Name', 'Email', 'Joined', 'Attempts']}>{s.map(x => <tr key={x._id}><td className="py-3 font-medium text-slate-800">{x.name}</td><td>{x.email}</td><td>{fmtDate(x.createdAt)}</td><td className="font-semibold text-slate-800">{x.attempts}</td></tr>)}</Table> : <Empty text="No students registered" />}</Card></div>;
}
