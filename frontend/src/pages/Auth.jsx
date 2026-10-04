import { useState } from 'react'; import { Link, Navigate, useNavigate } from 'react-router-dom'; import { GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx'; import { errMsg } from '../services/api.js'; import { btn, inp, ErrorBox } from '../components/UI.jsx';
export default function Auth({ mode }) {
  const reg = mode === 'register'; const { user, login, register } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const u = await (reg ? register(f) : login({ email: f.email, password: f.password })); nav(u.role === 'admin' ? '/admin' : '/student'); }
    catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  const set = k => e => setF({ ...f, [k]: e.target.value });
  return <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-slate-950 bg-cover bg-center" style={{ backgroundImage: "url('https://media.istockphoto.com/id/2207141986/photo/ai-governance-and-responsive-generative-artificial-intelligence-use-compliance-strategy-and.jpg?s=1024x1024&w=is&k=20&c=UISb5BbdEBxkIM--eF56scOkkctrFr0alBIs6MKMXug=')" }}>
    <div className="absolute inset-0 bg-slate-950/65" />
    <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm lg:grid-cols-2">
      <section className="hidden min-h-[580px] flex-col justify-between p-10 text-white lg:flex">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-400/20 p-2 ring-1 ring-cyan-200/40"><GraduationCap size={28} /></div><span className="text-xl font-bold tracking-tight">ExamGuard</span></div>
        <div><p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">Intelligent examination</p><h1 className="max-w-md text-5xl font-bold leading-tight">Secure exams with confidence.</h1><p className="mt-5 max-w-md text-sm leading-6 text-slate-200">A modern exam platform with transparent monitoring, reliable assessments, and review-friendly anti-cheat signals.</p></div>
        <div className="flex items-center gap-2 text-sm text-slate-200"><ShieldCheck size={18} className="text-cyan-300" /> Privacy-first monitoring. No continuous video recording.</div>
      </section>
      <section className="bg-white/95 p-6 sm:p-10">
        <div className="mb-8 lg:hidden"><div className="flex items-center gap-2 text-indigo-700"><GraduationCap size={28} /><span className="text-xl font-bold">ExamGuard</span></div></div>
        <div className="mb-7"><p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">{reg ? 'Get started' : 'Welcome back'}</p><h2 className="mt-2 text-3xl font-bold text-slate-900">{reg ? 'Create your account' : 'Sign in to your account'}</h2><p className="mt-2 text-sm text-slate-500">{reg ? 'Join your secure online examination workspace.' : 'Continue to your examination workspace.'}</p></div>
        <form onSubmit={submit} className="space-y-4">{err && <ErrorBox text={err} />}
          {reg && <label className="block text-sm font-medium text-slate-700">Full name<input className={inp + ' mt-1.5 bg-white'} placeholder="Enter your full name" value={f.name} onChange={set('name')} required /></label>}
          <label className="block text-sm font-medium text-slate-700">Email<input className={inp + ' mt-1.5 bg-white'} type="email" placeholder="you@example.com" value={f.email} onChange={set('email')} required /></label>
          <label className="block text-sm font-medium text-slate-700">Password<input className={inp + ' mt-1.5 bg-white'} type="password" placeholder="Minimum 6 characters" value={f.password} onChange={set('password')} required minLength={6} /></label>
          <button className={btn + ' mt-2 w-full bg-indigo-600 py-3 shadow-lg shadow-indigo-200 hover:bg-indigo-700'} disabled={busy}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Sign in'}</button></form>
        <p className="mt-6 text-center text-sm text-slate-500">{reg ? <>Have an account? <Link className="font-semibold text-indigo-600 hover:text-indigo-800" to="/login">Sign in</Link></> : <>New student? <Link className="font-semibold text-indigo-600 hover:text-indigo-800" to="/register">Create an account</Link></>}</p>
      </section>
    </div>
  </div>;
}
