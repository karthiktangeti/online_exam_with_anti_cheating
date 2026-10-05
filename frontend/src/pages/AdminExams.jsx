import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import { Plus } from 'lucide-react';
import api, { errMsg } from '../services/api.js'; import Modal from '../components/Modal.jsx'; import { useToast } from '../components/Toast.jsx';
import { btn, inp, Card, Table, LoadingSpinner, Empty, ErrorBox } from '../components/UI.jsx'; import { fmtDate, toLocalInput } from '../utils/format.js';
const blank = { title: '', description: '', duration: 30, totalMarks: 10, passingMarks: 4, startDate: '', endDate: '' };
export default function AdminExams() {
  const toast = useToast(); const [exams, setExams] = useState(null); const [err, setErr] = useState(''); const [form, setForm] = useState(null); const [del, setDel] = useState(null);
  const load = () => api.get('/exams').then(r => setExams(r.data)).catch(e => setErr(errMsg(e))); useEffect(() => { load(); }, []);
  const save = async e => {
    e.preventDefault(); const body = { ...form, startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString() };
    try { form._id ? await api.put(`/exams/${form._id}`, body) : await api.post('/exams', body); setForm(null); toast('Exam saved', 'success'); load(); } catch (x) { toast(errMsg(x), 'error'); }
  };
  const remove = async () => { try { await api.delete(`/exams/${del._id}`); toast('Exam deleted', 'success'); setDel(null); load(); } catch (x) { toast(errMsg(x), 'error'); } };
  const f = (k, type = 'text') => <input className={inp} type={type} value={form[k]} onChange={e => setForm({ ...form, [k]: type === 'number' ? +e.target.value : e.target.value })} required={k !== 'description'} min={type === 'number' ? 0 : undefined} />;
  if (err) return <ErrorBox text={err} />; if (!exams) return <LoadingSpinner />;
  return <div className="page-enter space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-blue-600">Content management</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Exams</h1><p className="mt-1 text-sm text-slate-500">Create and manage assessments for your students.</p></div><button className={btn} onClick={() => setForm(blank)}><Plus size={16} />New exam</button></div>
    <Card>{exams.length ? <Table head={['Title', 'Questions', 'Duration', 'Marks', 'Window', '']}>{exams.map(x => <tr key={x._id}><td className="py-2 font-medium">{x.title}</td><td>{x.questionCount}</td><td>{x.duration}m</td><td>{x.totalMarks} (pass {x.passingMarks})</td><td className="text-xs">{fmtDate(x.startDate)}<br />{fmtDate(x.endDate)}</td>
      <td className="space-x-3 whitespace-nowrap"><Link className="font-semibold text-blue-600 hover:text-blue-800" to={`/admin/exams/${x._id}/questions`}>Questions</Link><button className="text-slate-600 hover:text-slate-900" onClick={() => setForm({ ...x, startDate: toLocalInput(x.startDate), endDate: toLocalInput(x.endDate) })}>Edit</button><button className="text-red-600 hover:text-red-800" onClick={() => setDel(x)}>Delete</button></td></tr>)}</Table> : <Empty text="No exams yet. Create your first exam." />}</Card>
    <Modal open={!!form} hideFooter title={form?._id ? 'Edit exam' : 'New exam'} onClose={() => setForm(null)}>{form && <form onSubmit={save} className="space-y-3">
      <label className="block">Title{f('title')}</label><label className="block">Description{f('description')}</label>
      <div className="grid grid-cols-3 gap-2"><label>Duration (min){f('duration', 'number')}</label><label>Total marks{f('totalMarks', 'number')}</label><label>Passing marks{f('passingMarks', 'number')}</label></div>
      <div className="grid grid-cols-2 gap-2"><label>Start{f('startDate', 'datetime-local')}</label><label>End{f('endDate', 'datetime-local')}</label></div>
      <div className="flex justify-end gap-2"><button type="button" className="px-4 py-2 border rounded-lg" onClick={() => setForm(null)}>Cancel</button><button className={btn}>Save</button></div></form>}</Modal>
    <Modal open={!!del} title="Delete exam?" onClose={() => setDel(null)} onConfirm={remove} confirmText="Delete">"{del?.title}" and its questions will be removed.</Modal></div>;
}
