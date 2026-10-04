import { useEffect, useState } from 'react'; import { Link, useNavigate } from 'react-router-dom'; import { ArrowRight, BrainCircuit, ShieldCheck, Sparkles } from 'lucide-react';
import api, { errMsg } from '../services/api.js'; import { useAuth } from '../context/AuthContext.jsx'; import ExamCard from '../components/ExamCard.jsx';
import { LoadingSpinner, Empty, ErrorBox, Card } from '../components/UI.jsx'; import { fmtDate } from '../utils/format.js';
export default function StudentDashboard() {
  const { user } = useAuth(); const nav = useNavigate(); const [exams, setExams] = useState(null); const [attempts, setAttempts] = useState([]); const [err, setErr] = useState('');
  useEffect(() => { Promise.all([api.get('/exams'), api.get('/attempts/mine')]).then(([e, a]) => { setExams(e.data); setAttempts(a.data); }).catch(e => setErr(errMsg(e))); }, []);
  if (err) return <ErrorBox text={err} />; if (!exams) return <LoadingSpinner />;
  const now = Date.now(), g = { Available: [], Upcoming: [], Completed: [] };
  exams.forEach(e => {
    const a = e.attempt, st = a && a.status !== 'in_progress' ? 'Completed' : now < new Date(e.startDate) ? 'Upcoming' : (a?.status === 'in_progress' || now <= new Date(e.endDate)) ? (a ? 'In progress' : 'Available') : 'Closed';
    (g[st === 'In progress' ? 'Available' : st === 'Closed' ? 'Completed' : st]).push({ e, st });
  });
  const done = attempts.filter(a => a.status !== 'in_progress');
  const Section = ({ title, items }) => <section><h2 className="font-semibold mb-3">{title}</h2>{items.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(({ e, st }) => <ExamCard key={e._id} exam={e} status={st} onStart={() => nav(`/exam/${e._id}/start`)} />)}</div> : <Empty text={`No ${title.toLowerCase()}`} />}</section>;
  return <div className="space-y-8">
    <section className="relative isolate overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
      <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('https://media.istockphoto.com/id/2164746643/photo/artificial-intelligence-idea-ai-light-bulb-idea-concept.jpg?s=612x612&w=0&k=20&c=_2wT47RCl6Q5xsTXFhpvN3GElQr-8ISm0HhzfPXlJE4=')" }} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-indigo-950/35" />
      <div className="absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="max-w-2xl px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100"><Sparkles size={14} /> Intelligent learning space</div>
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">Welcome back, {user.name}.</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-slate-200 sm:text-base">Turn your ideas into results. Continue an exam, explore what is coming next, and track your progress from one secure workspace.</p>
        <div className="mt-7 flex flex-wrap gap-3 text-xs text-slate-200"><span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2"><BrainCircuit size={15} className="text-cyan-300" /> Smart assessments</span><span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2"><ShieldCheck size={15} className="text-emerald-300" /> Secure monitoring</span></div>
      </div>
      <div className="absolute bottom-6 right-6 hidden items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-white backdrop-blur-md md:flex"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px] shadow-emerald-300" /> Your workspace is ready <ArrowRight size={14} /></div>
    </section>
    <Section title="Available Exams" items={g.Available} /><Section title="Upcoming Exams" items={g.Upcoming} /><Section title="Completed Exams" items={g.Completed} />
    <section><h2 className="font-semibold mb-3">Recent Results</h2><Card>{done.length ? <div className="divide-y">{done.slice(0, 8).map(a => <Link key={a._id} to={`/result/${a._id}`} className="flex justify-between py-2 text-sm hover:bg-slate-50"><span>{a.examId?.title}</span><span className="font-semibold">{a.score}/{a.examId?.totalMarks} <span className="text-slate-400 font-normal">· {fmtDate(a.submittedAt)}</span></span></Link>)}</div> : <Empty text="No results yet" />}</Card></section></div>;
}
