import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, ClipboardList, ShieldAlert, LogOut, GraduationCap, Radio, Bell, BookOpen, Trophy, Menu, X, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api, { errMsg } from '../services/api.js';

const adminNav = [['/admin', 'Dashboard', LayoutDashboard], ['/admin/live', 'Live Monitor', Radio], ['/admin/exams', 'Exams & Questions', FileText], ['/admin/students', 'Students', Users], ['/admin/attempts', 'Attempts & Results', ClipboardList], ['/admin/attempts?risk=1', 'Anti-Cheat Reports', ShieldAlert]];
const studentNav = [['/student', 'Dashboard', LayoutDashboard], ['/student/exams', 'My Exams', BookOpen], ['/student/results', 'Results', Trophy]];

export default function Layout({ children }) {
  const { user, logout } = useAuth(); const nav = useNavigate(); const location = useLocation(); const admin = user.role === 'admin';
  const [notifications, setNotifications] = useState(null); const [notificationError, setNotificationError] = useState(''); const [mobileOpen, setMobileOpen] = useState(false);
  const out = () => { logout(); nav('/login'); };
  const toggleNotifications = async () => {
    if (notifications) return setNotifications(null);
    try {
      const { data } = await api.get('/exams'); const now = Date.now();
      setNotifications(data.filter(e => { const completed = e.attempt?.status === 'submitted' || e.attempt?.status === 'auto_submitted'; return !completed && now <= new Date(e.endDate); }));
      setNotificationError('');
    } catch (e) { setNotificationError(errMsg(e)); setNotifications([]); }
  };
  const links = admin ? adminNav : studentNav;
  const Sidebar = () => <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#123b2a] p-5 text-slate-300 shadow-2xl transition-transform md:static md:translate-x-0 md:shadow-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="mb-10 flex items-center gap-3 text-white"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600"><GraduationCap size={22} /></span><div><p className="font-bold tracking-tight">ExamPro</p><p className="text-[10px] uppercase tracking-[.18em] text-slate-500">{admin ? 'Admin console' : 'Student portal'}</p></div><button className="ml-auto md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
    <nav className="space-y-1.5">{links.map(([to, title, Icon]) => <NavLink key={title} to={to} end={to === (admin ? '/admin' : '/student')} onClick={() => setMobileOpen(false)} className={({ isActive }) => {
      const isRiskLink = to.includes('?risk=1');
      const isAttemptsLink = to === '/admin/attempts';
      const queryActive = isRiskLink
        ? location.pathname === '/admin/attempts' && new URLSearchParams(location.search).get('risk') === '1'
        : isAttemptsLink
          ? location.pathname === '/admin/attempts' && !new URLSearchParams(location.search).has('risk')
          : isActive;
      return `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${queryActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20' : 'hover:bg-white/5 hover:text-white'}`;
    }}><Icon size={18} />{title}</NavLink>)}</nav>
    <div className="mt-auto border-t border-white/10 pt-4"><NavLink to={admin ? '/admin' : '/student/profile'} onClick={() => setMobileOpen(false)} className="mb-2 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm hover:bg-white/5 hover:text-white"><UserRound size={18} />Profile</NavLink><button onClick={out} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm hover:bg-red-500/10 hover:text-red-300"><LogOut size={18} />Logout</button></div>
  </aside>;
  return <div className="app-shell flex md:min-h-screen">
    <Sidebar />{mobileOpen && <button className="fixed inset-0 z-40 bg-slate-950/50 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-3"><button className="text-slate-500 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={21} /></button><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-600">{admin ? 'Admin workspace' : 'Student workspace'}</p><p className="mt-0.5 text-sm font-semibold text-slate-800">Welcome back, {user.name}</p></div></div>
        <div className="relative flex items-center gap-4"><button onClick={toggleNotifications} className="relative text-slate-500 transition hover:text-blue-600" aria-label="Notifications"><Bell size={19} />{notifications?.length > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">{notifications.length}</span>}</button><NavLink to={admin ? '/admin' : '/student/profile'} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-bold text-blue-700 ring-2 ring-transparent transition hover:ring-blue-200" aria-label="Open profile">{user.profilePicture ? <img src={user.profilePicture} alt="" className="h-full w-full object-cover" /> : user.name?.charAt(0)?.toUpperCase()}</NavLink>
          {notifications && <div className="absolute right-0 top-12 z-20 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-800">Upcoming exams</h3><span className="text-xs text-slate-400">{notifications.length} to complete</span></div>{notificationError ? <p className="mt-3 text-sm text-red-600">{notificationError}</p> : notifications.length ? <div className="mt-3 space-y-2">{notifications.map(exam => <NavLink key={exam._id} to="/student/exams" onClick={() => setNotifications(null)} className="block rounded-xl bg-blue-50 p-3 hover:bg-blue-100"><p className="text-sm font-semibold text-blue-700">{exam.title}</p><p className="mt-1 text-xs text-slate-500">{Date.now() >= new Date(exam.startDate) ? 'Exam is currently in progress' : 'Exam starts soon'}</p></NavLink>)}</div> : <p className="mt-3 text-sm text-slate-500">No upcoming or incomplete exams.</p>}</div>}</div>
      </header>
      {admin && <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 text-xs md:hidden">{adminNav.map(([to, title]) => {
        const isRiskLink = to.includes('?risk=1');
        const active = isRiskLink
          ? location.pathname === '/admin/attempts' && new URLSearchParams(location.search).get('risk') === '1'
          : to === '/admin/attempts'
            ? location.pathname === '/admin/attempts' && !new URLSearchParams(location.search).has('risk')
            : location.pathname === to;
        return <NavLink key={title} to={to} end className={`whitespace-nowrap rounded-full px-3 py-1.5 ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{title}</NavLink>;
      })}</nav>}
      <main className={`page-enter mx-auto max-w-7xl p-4 md:p-8 ${admin ? 'admin-main' : ''}`}>{children}</main>
    </div>
  </div>;
}
