import { useEffect, useState } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import { ShieldCheck, Camera } from 'lucide-react';
import api, { errMsg } from '../services/api.js'; 
import { btn, Card, LoadingSpinner, ErrorBox } from '../components/UI.jsx'; 
import { useToast } from '../components/Toast.jsx';
export default function ExamStart() {
  const { examId } = useParams(); 
  const nav = useNavigate(); 
  const toast = useToast();
  const [exam, setExam] = useState(null); 
  const [consent, setConsent] = useState(false); 
  const [cam, setCam] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { api.get(`/exams/${examId}`).then(r => setExam(r.data)).catch(e => setErr(errMsg(e))); }, [examId]);
  const testCam = async () => {
    try { const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); s.getTracks().forEach(t => t.stop()); setCam(true); toast('Camera permission granted', 'success'); }
    catch { toast('Camera access is required for this exam', 'error'); }
  };
  const begin = async () => {
    setBusy(true);
    try {
      try { await document.documentElement.requestFullscreen(); } catch { /* user can re-enter from the exam page */ }
      const { data } = await api.post('/attempts/start', { examId }); nav(`/exam/attempt/${data.attemptId}`);
    } catch (e) { setErr(errMsg(e)); 
                 if (e.response?.data?.attemptId) nav(`/result/${e.response.data.attemptId}`); 
                 document.fullscreenElement && document.exitFullscreen(); 
                 setBusy(false); }
  };
  if (err && !exam) return <div className="p-6"><ErrorBox text={err} /></div>; 
  if (!exam) return <LoadingSpinner />;
  return <div className="page-enter mx-auto max-w-3xl space-y-5 p-4"><div><p className="text-sm font-semibold text-blue-600">Exam instructions</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{exam.title}</h1><p className="mt-2 text-sm text-slate-500">Review the details below before you begin.</p></div><Card><h2 className="text-xl font-bold">{exam.title}</h2><p className="mt-1 text-sm text-slate-500">{exam.description}</p>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-xl bg-blue-50 p-3"><p className="text-xs text-slate-500">Questions</p><p className="mt-1 font-bold text-blue-700">{exam.questionCount}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Duration</p><p className="mt-1 font-bold">{exam.duration} min</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Total marks</p><p className="mt-1 font-bold">{exam.totalMarks}</p></div><div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs text-slate-500">Pass mark</p><p className="mt-1 font-bold text-emerald-700">{exam.passingMarks}</p></div></div>
    <ul className="list-disc ml-5 mt-3 text-sm text-slate-600 space-y-1"><li>Answers are saved automatically; the timer is enforced by the server.</li><li>The exam runs in fullscreen. Leaving fullscreen or switching tabs is recorded.</li><li>Copy, paste, cut, right-click and developer shortcuts are recorded.</li><li>You may resume after a refresh, until time runs out. Only one attempt is allowed.</li></ul></Card>
    <Card><h2 className="flex items-center gap-2 font-semibold"><ShieldCheck size={18} className="text-blue-600" />Privacy & monitoring consent</h2>
      <p className="text-sm text-slate-600 mt-2">Your webcam is analysed <b>locally in your browser</b> for face presence. <b>No video is recorded or uploaded.</b> Only event types, timestamps and small metadata are stored for administrator review. These signals are not proof of misconduct.</p>
      <label className="flex gap-2 mt-3 text-sm"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />I understand and consent to monitoring during this exam.</label>
      <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm" onClick={testCam} disabled={!consent}><Camera size={16} />{cam ? 'Camera ready ✓' : 'Allow camera access'}</button></Card>
    {err && <ErrorBox text={err} />}<button className={btn + ' w-full'} disabled={!consent || !cam || busy} onClick={begin}>{busy ? 'Starting…' : 'Begin Exam'}</button></div>;
}
