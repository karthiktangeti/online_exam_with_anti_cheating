import { useEffect, useState } from 'react'; import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../services/api.js'; import { useToast } from '../components/Toast.jsx'; import Modal from '../components/Modal.jsx'; import { btn, btn2, inp, Card, LoadingSpinner, Empty, ErrorBox } from '../components/UI.jsx';
export default function AdminQuestions() {
  const { examId } = useParams(); const toast = useToast(); const blank = { question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 };
  const [exam, setExam] = useState(null); const [qs, setQs] = useState(null); const [form, setForm] = useState(blank); const [del, setDel] = useState(null); const [err, setErr] = useState('');
  const load = () => Promise.all([api.get(`/exams/${examId}`), api.get(`/questions/exam/${examId}`)]).then(([a, b]) => { setExam(a.data); setQs(b.data); }).catch(e => setErr(errMsg(e)));
  useEffect(() => { load(); }, [examId]);
  const save = async e => {
    e.preventDefault(); try {
      const body = { question: form.question, options: form.options.filter(o => o.trim()), correctAnswer: form.correctAnswer, marks: form.marks };
      form._id ? await api.put(`/questions/${form._id}`, body) : await api.post('/questions', { ...body, examId });
      setForm(blank); toast('Question saved', 'success'); load();
    } catch (x) { toast(errMsg(x), 'error'); }
  };
  const remove = async () => { try { await api.delete(`/questions/${del._id}`); setDel(null); load(); } catch (x) { toast(errMsg(x), 'error'); } };
  if (err) return <ErrorBox text={err} />; if (!qs) return <LoadingSpinner />;
  const total = qs.reduce((s, q) => s + q.marks, 0);
  return <div className="page-enter space-y-5"><Link to="/admin/exams" className="text-sm font-semibold text-blue-600 hover:text-blue-800">← Exams</Link><h1 className="text-2xl font-bold tracking-tight text-slate-900">{exam.title} — Questions</h1>
    <p className="text-sm text-slate-500">{qs.length} questions · marks from questions: {total} · exam total marks: {exam.totalMarks}{total !== exam.totalMarks && <span className="text-amber-600"> (mismatch — percentages use exam total)</span>}</p>
    <Card><form onSubmit={save} className="space-y-2"><h2 className="font-semibold">{form._id ? 'Edit question' : 'Add question'}</h2>
      <textarea className={inp} placeholder="Question text" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required />
      {form.options.map((o, k) => <div key={k} className="flex items-center gap-2"><input type="radio" name="correct" checked={form.correctAnswer === k} onChange={() => setForm({ ...form, correctAnswer: k })} title="Correct answer" />
        <input className={inp} placeholder={`Option ${k + 1}`} value={o} onChange={e => setForm({ ...form, options: form.options.map((x, j) => (j === k ? e.target.value : x)) })} required={k < 2} /></div>)}
      <div className="flex items-center gap-3"><label className="text-sm">Marks <input type="number" min="0" className="border rounded px-2 py-1 w-20" value={form.marks} onChange={e => setForm({ ...form, marks: +e.target.value })} /></label>
        <button className={btn}>{form._id ? 'Update' : 'Add question'}</button>{form._id && <button type="button" className={btn2} onClick={() => setForm(blank)}>Cancel</button>}</div>
      <p className="text-xs text-slate-500">Select the radio next to the correct option.</p></form></Card>
    {qs.length ? qs.map((q, n) => <Card key={q._id}><div className="flex justify-between gap-2"><p className="font-medium">{n + 1}. {q.question} <span className="text-xs text-slate-400">({q.marks})</span></p>
      <span className="space-x-3 text-sm whitespace-nowrap"><button className="text-slate-600" onClick={() => { setForm({ ...q, options: [...q.options, '', '', '', ''].slice(0, Math.max(4, q.options.length)) }); window.scrollTo(0, 0); }}>Edit</button><button className="text-red-600" onClick={() => setDel(q)}>Delete</button></span></div>
      <ul className="mt-2 text-sm space-y-1">{q.options.map((o, k) => <li key={k} className={k === q.correctAnswer ? 'text-emerald-600 font-medium' : 'text-slate-600'}>{k === q.correctAnswer ? '✓' : '○'} {o}</li>)}</ul></Card>) : <Empty text="No questions yet" />}
    <Modal open={!!del} title="Delete question?" onClose={() => setDel(null)} onConfirm={remove} confirmText="Delete">This cannot be undone.</Modal></div>;
}
