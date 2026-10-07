import { useState } from 'react'; 
import { Link, Navigate, useNavigate } from 'react-router-dom'; 
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx'; 
import { errMsg } from '../services/api.js'; 
import { btn, inp, ErrorBox } from '../components/UI.jsx';
export default function Auth({ mode }) {
  const reg = mode === 'register';
  const { user, login, register } = useAuth(); 
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' }); 
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const u = await (reg ? register(f) : login({ email: f.email, password: f.password })); nav(u.role === 'admin' ? '/admin' : '/student'); }
    catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  const set = k => e => setF({ ...f, [k]: e.target.value });
  return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-8">
    <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden min-h-[600px] overflow-hidden bg-[#123b2a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-2xl" /><div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="relative flex items-center gap-3"><div className="rounded-xl bg-blue-600 p-2"><GraduationCap size={25} /></div><span className="text-xl font-bold tracking-tight">ExamPro</span></div>
        <div className="relative"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">Online examination platform</p><h1 className="max-w-md text-5xl font-bold leading-tight">Prepare smarter. Perform better.</h1><p className="mt-5 max-w-md text-sm leading-6 text-slate-300">Take secure assessments, track your progress, and build confidence with a workspace designed for focused learning.</p><div className="mt-8 grid max-w-sm grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-2xl font-bold">24/7</p><p className="mt-1 text-xs text-slate-400">Accessible learning</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-2xl font-bold">100%</p><p className="mt-1 text-xs text-slate-400">Focused experience</p></div></div></div>
        <div className="relative flex items-center gap-2 text-sm text-slate-300"><ShieldCheck size={18} className="text-blue-300" /> Privacy-first monitoring. No continuous video recording.</div>
      </section>
      <section className="p-6 sm:p-12">
        <div className="mb-10 lg:hidden"><div className="flex items-center gap-2 text-blue-600"><GraduationCap size={28} /><span className="text-xl font-bold text-slate-900">ExamPro</span></div></div>
        <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-widest text-blue-600">{reg ? 'Get started' : 'Welcome back'}</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{reg ? 'Create your account' : 'Sign in to your account'}</h2><p className="mt-2 text-sm text-slate-500">{reg ? 'Join your secure online examination workspace.' : 'Continue to your examination workspace.'}</p></div>
        <form onSubmit={submit} className="space-y-4">{err && <ErrorBox text={err} />}
          {reg && <label className="block text-sm font-medium text-slate-700">Full name<input className={inp + ' mt-1.5 bg-white'} placeholder="Enter your full name" value={f.name} onChange={set('name')} required /></label>}
          <label className="block text-sm font-medium text-slate-700">Email<input className={inp + ' mt-1.5 bg-white'} type="email" placeholder="you@example.com" value={f.email} onChange={set('email')} required /></label>
          <label className="block text-sm font-medium text-slate-700">Password<input className={inp + ' mt-1.5 bg-white'} type="password" placeholder="Minimum 6 characters" value={f.password} onChange={set('password')} required minLength={6} /></label>
          <button className={btn + ' mt-2 w-full py-3 shadow-lg shadow-blue-200'} disabled={busy}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Sign in'}</button></form>
        <p className="mt-6 text-center text-sm text-slate-500">{reg ? <>Have an account? <Link className="font-semibold text-blue-600 hover:text-blue-800" to="/login">Sign in</Link></> : <>New student? <Link className="font-semibold text-blue-600 hover:text-blue-800" to="/register">Create an account</Link></>}</p>
      </section>
    </div>
  </div>;
}
