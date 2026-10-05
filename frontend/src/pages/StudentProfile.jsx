import { useState } from 'react';
import { Camera, Edit3, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../services/api.js';
import { btn, ErrorBox, inp } from '../components/UI.jsx';

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, email: user.email, profilePicture: user.profilePicture || '' });
  const [err, setErr] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const set = key => e => { setSaved(false); setForm({ ...form, [key]: e.target.value }); };
  const photo = e => {
    if (!editing) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 75000) return setErr('Please choose a profile picture smaller than 75 KB.');
    const reader = new FileReader();
    reader.onload = () => { setErr(''); setSaved(false); setForm({ ...form, profilePicture: reader.result }); };
    reader.readAsDataURL(file);
  };
  const save = async e => {
    e.preventDefault(); setBusy(true); setErr(''); setSaved(false);
    try { await updateUser(form); setSaved(true); setEditing(false); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return <div className="page-enter mx-auto max-w-2xl space-y-6">
    <div><p className="text-sm font-semibold text-blue-600">Student workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Profile</h1><p className="mt-2 text-sm text-slate-500">Update your account details and profile picture.</p></div>
    <form onSubmit={save} className="rounded-2xl border-0 bg-white p-6 shadow-sm sm:p-8">
      {err && <ErrorBox text={err} />}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="relative"><div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#f1e8ff] text-4xl font-bold text-[#3d216b]">{form.profilePicture ? <img src={form.profilePicture} alt="Profile" className="h-full w-full object-cover" /> : user.name.charAt(0).toUpperCase()}</div>{editing && <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-[#5c3687] p-2 text-white shadow-md hover:bg-[#3d216b]"><Camera size={16} /><input type="file" accept="image/png,image/jpeg,image/webp" onChange={photo} className="hidden" /></label>}</div>
        <p className="text-xs text-slate-500">JPG, PNG or WEBP · max 75 KB</p>
      </div>
      <div className="space-y-5"><label className="block text-sm font-medium text-slate-700">Full name<input className={inp + ' mt-1.5 disabled:bg-slate-50 disabled:text-slate-500'} value={form.name} onChange={set('name')} disabled={!editing} required /></label><label className="block text-sm font-medium text-slate-700">Email address<input className={inp + ' mt-1.5 disabled:bg-slate-50 disabled:text-slate-500'} type="email" value={form.email} onChange={set('email')} disabled={!editing} required /></label></div>
      <div className="mt-7 flex items-center justify-end gap-3">{saved && <span className="text-sm font-medium text-emerald-600">Profile saved</span>}{editing ? <><button type="button" className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100" onClick={() => { setEditing(false); setForm({ name: user.name, email: user.email, profilePicture: user.profilePicture || '' }); }}>Cancel</button><button className={btn} disabled={busy}><Save size={16} />{busy ? 'Saving...' : 'Save changes'}</button></> : <button type="button" className={btn} onClick={() => setEditing(true)}><Edit3 size={16} />Edit profile</button>}</div>
    </form>
  </div>;
}
