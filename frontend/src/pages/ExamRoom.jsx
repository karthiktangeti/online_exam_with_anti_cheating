import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../services/api.js'; 
import Timer from '../components/Timer.jsx';
import AntiCheatMonitor from '../components/AntiCheatMonitor.jsx';
import WebcamMonitor from '../components/WebcamMonitor.jsx';
import QuestionNavigator from '../components/QuestionNavigator.jsx';
import Modal from '../components/Modal.jsx';
import { btn, btn2, Card, LoadingSpinner, ErrorBox, ProgressBar } from '../components/UI.jsx';
import { useToast } from '../components/Toast.jsx'; 
import { label } from '../utils/format.js';
export default function ExamRoom() {
  const { attemptId } = useParams(); 
  const nav = useNavigate(); 
  const toast = useToast();
  const [d, setD] = useState(null);
  const [err, setErr] = useState(''); 
  const [i, setI] = useState(0); 
  const [answers, setAnswers] = useState({}); 
  const [marked, setMarked] = useState([]);
  const [confirm, setConfirm] = useState(false); 
  const [fs, setFs] = useState(!!document.fullscreenElement); 
  const [done, setDone] = useState(false); 
  const last = useRef({}); 
  const sub = useRef(false);
  useEffect(() => {
    api.get(`/attempts/${attemptId}/session`).then(r => {
      if (r.data.finished) return nav(`/result/${attemptId}`, { replace: true });
      setD({ ...r.data, offset: r.data.serverTime - Date.now(), warningCount: r.data.warningCount || 0, warningEvents: r.data.warningEvents || [] }); 
      setAnswers(r.data.answers); setMarked(r.data.marked);
    }).catch(e => setErr(errMsg(e)));
    const f = () => setFs(!!document.fullscreenElement); document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, [attemptId]);
  const report = useCallback((type, metadata = {}) => {
    const n = Date.now(); 
    if (n - (last.current[type] || 0) < 1500) return; 
    last.current[type] = n;
    api.post('/anti-cheat/event', { attemptId, eventType: type, metadata }).then(({ data }) => {
      setD(current => current ? { ...current, warningCount: data.warningCount, warningEvents: [...(current.warningEvents || []), data.event] } : current);
      toast(`Warning ${data.warningCount}/10: ${label(type)}`, 'warn');
      if (data.autoSubmitted) { toast('Your exam was automatically submitted after reaching the monitoring warning limit.', 'error');
                               setDone(true); nav(`/result/${attemptId}`, { replace: true }); }
    }).catch(() => {});
  }, [attemptId, toast]);
  const markedRef = useRef(marked); markedRef.current = marked;
  useEffect(() => { const t = setInterval(() => api.put(`/attempts/${attemptId}/marked`, { marked: markedRef.current }).catch(() => {}), 30000);
                   return () => clearInterval(t); }, [attemptId]); // periodic state sync
  const submit = async () => {
    if (sub.current) return; sub.current = true; setDone(true); setConfirm(false);
    try { await api.post('/attempts/submit', { attemptId }); document.fullscreenElement && document.exitFullscreen().catch(() => {});
         nav(`/result/${attemptId}`, { replace: true }); }
    catch (e) { sub.current = false; setDone(false); toast(errMsg(e), 'error'); }
  };
  const choose = async (qid, val) => {
    const prev = answers[qid]; setAnswers(a => ({ ...a, [qid]: val }));
    try { await api.post('/answers', { attemptId, questionId: qid, selectedAnswer: val }); 
        } 
    catch (e) { setAnswers(a => ({ ...a, [qid]: prev })); 
               toast('Could not save answer: ' + errMsg(e), 'error'); }
  };
  const toggleMark = qid => { const m = marked.includes(qid) ? marked.filter(x => x !== qid) : [...marked, qid]; setMarked(m); api.put(`/attempts/${attemptId}/marked`, { marked: m }).catch(() => {}); };
  if (err) return <div className="p-6"><ErrorBox text={err} /></div>;
  if (!d) return <LoadingSpinner />;
  const q = d.questions[i], answered = Object.values(answers).filter(v => v != null).length;
  return <div className="min-h-screen select-none bg-slate-50">
    <AntiCheatMonitor attemptId={attemptId} report={report} active={!done} /><WebcamMonitor report={report} active={!done} />
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">Exam in progress</p><h1 className="truncate font-semibold text-slate-900">{d.exam.title}</h1></div><div className="flex items-center gap-3"><div className="hidden text-xs font-semibold text-amber-700 sm:block">WARNINGS {d.warningCount} / 10</div><Timer endTime={d.endTime} offset={d.offset} onExpire={submit} /></div></header>
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div><div className="flex justify-between text-xs text-slate-500 mb-1"><span>Question {i + 1} of {d.questions.length}</span><span>{answered} answered</span></div><ProgressBar value={(answered / d.questions.length) * 100} /></div>
      <Card><div className="flex justify-between gap-3"><h2 className="text-lg font-medium">{q.question}</h2><span className="text-xs text-slate-400 whitespace-nowrap">{q.marks} mark{q.marks !== 1 && 's'}</span></div>
        <div className="mt-4 space-y-2">{q.options.map((o, k) => <label key={k} className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer ${answers[q._id] === k ? 'border-indigo-600 bg-indigo-50' : 'hover:bg-slate-50'}`}>
          <input type="radio" name={q._id} checked={answers[q._id] === k} onChange={() => choose(q._id, k)} />{o}</label>)}</div>
        <div className="flex flex-wrap gap-2 mt-4"><button className={btn2} onClick={() => choose(q._id, null)} disabled={answers[q._id] == null}>Clear Answer</button>
          <button className={btn2} onClick={() => toggleMark(q._id)}>{marked.includes(q._id) ? 'Unmark Review' : 'Mark for Review'}</button></div></Card>
      <div className="flex justify-between"><button className={btn2} disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button>
        {i < d.questions.length - 1 ? <button className={btn} onClick={() => setI(i + 1)}>Next</button> : <button className={btn} onClick={() => setConfirm(true)}>Submit Exam</button>}</div>
      <Card><h3 className="text-sm font-semibold mb-3">Question Navigator</h3><QuestionNavigator questions={d.questions} current={i} answers={answers} marked={marked} onGo={setI} />
        <div className="flex flex-wrap gap-3 text-xs mt-3 text-slate-500"><span><i className="inline-block w-3 h-3 bg-emerald-500 rounded mr-1" />Answered</span><span><i className="inline-block w-3 h-3 bg-slate-200 rounded mr-1" />Unanswered</span><span><i className="inline-block w-3 h-3 bg-amber-400 rounded mr-1" />Review</span><span><i className="inline-block w-3 h-3 bg-indigo-600 rounded mr-1" />Current</span></div>
        <button className={btn + ' mt-4'} onClick={() => setConfirm(true)}>Submit Exam</button></Card></div>
      <Card><h3 className="text-sm font-semibold mb-3">Anti-cheat activity</h3>{d.warningEvents?.length ? <ol className="space-y-2 text-xs text-slate-600">{d.warningEvents.map(e => <li key={e._id}><span className="font-mono text-slate-400">{new Date(e.timestamp).toLocaleTimeString()}</span> <b>{label(e.eventType)}</b> <span className="text-amber-700">Warning +1</span></li>)}</ol> : <p className="text-sm text-slate-500">No monitoring warnings recorded.</p>}</Card>
    <Modal open={confirm} title="Submit exam?" onClose={() => setConfirm(false)} onConfirm={submit} confirmText="Submit">You answered {answered} of {d.questions.length} questions. You cannot change answers after submitting.</Modal>
    {!fs && !done && <div className="fixed inset-0 z-[60] bg-slate-900/95 flex items-center justify-center p-6 text-center text-white"><div><h2 className="text-xl font-bold">Fullscreen required</h2><p className="text-sm text-slate-300 my-3">Return to fullscreen to continue. The timer keeps running.</p><button className={btn} onClick={() => document.documentElement.requestFullscreen().catch(() => toast('Fullscreen blocked by browser', 'error'))}>Enter Fullscreen</button></div></div>}</div>;
}
