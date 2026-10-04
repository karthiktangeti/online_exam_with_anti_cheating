import { NavLink, useNavigate } from 'react-router-dom'; import { LayoutDashboard, FileText, Users, ClipboardList, ShieldAlert, LogOut, GraduationCap, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
const adminNav = [['/admin', 'Dashboard', LayoutDashboard], ['/admin/live', 'Live Monitor', Radio], ['/admin/exams', 'Exams & Questions', FileText], ['/admin/students', 'Students', Users], ['/admin/attempts', 'Attempts & Results', ClipboardList], ['/admin/attempts?risk=1', 'Anti-Cheat Reports', ShieldAlert]];
export default function Layout({ children }) {
  const { user, logout } = useAuth(); const nav = useNavigate(); const admin = user.role === 'admin';
  const out = () => { logout(); nav('/login'); };
  return <div className="min-h-screen md:flex">
    {admin && <aside className="hidden md:flex md:w-60 flex-col bg-slate-900 text-slate-200 p-4 gap-1 shrink-0">
      <div className="flex items-center gap-2 text-white font-bold text-lg mb-6"><GraduationCap /> ExamGuard</div>
      {adminNav.map(([to, t, I]) => <NavLink key={t} to={to} end className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive && !to.includes('?') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><I size={16} />{t}</NavLink>)}
      <button onClick={out} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-800 mt-auto"><LogOut size={16} />Logout</button></aside>}
    <div className="flex-1 min-w-0">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-indigo-600 flex items-center gap-2"><GraduationCap size={20} />{admin ? 'Admin Console' : 'ExamGuard'}</span>
        <span className="text-sm flex items-center gap-3">{user.name}<button onClick={out} className="text-slate-500 hover:text-red-600"><LogOut size={16} /></button></span></header>
      {admin && <nav className="md:hidden flex gap-2 overflow-x-auto p-2 bg-white border-b text-xs">{adminNav.map(([to, t]) => <NavLink key={t} to={to} end className="px-3 py-1 rounded-full bg-slate-100 whitespace-nowrap">{t}</NavLink>)}</nav>}
      <main className="p-4 md:p-6 max-w-6xl mx-auto">{children}</main></div></div>;
}
