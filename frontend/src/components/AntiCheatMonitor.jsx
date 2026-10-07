import { useEffect, useRef } from 'react'; 
import { io } from 'socket.io-client'; 
import { API_URL } from '../services/api.js'; 
import { useToast } from './Toast.jsx';
// Attaches browser listeners + socket session/heartbeat. Signals are monitoring aids, not proof of cheating.
export default function AntiCheatMonitor({ attemptId, report, active }) {
  const toast = useToast(); const act = useRef(active); act.current = active;
  useEffect(() => {
    const r = (t, m) => act.current && report(t, m); const offs = [];
    const on = (t, fn) => { document.addEventListener(t, fn); offs.push(() => document.removeEventListener(t, fn)); };
    on('visibilitychange', () => document.hidden && r('TAB_SWITCH'));
    on('fullscreenchange', () => !document.fullscreenElement && r('FULLSCREEN_EXIT'));
    on('copy', e => { e.preventDefault(); r('COPY_ATTEMPT'); }); on('paste', e => { e.preventDefault(); r('PASTE_ATTEMPT'); }); on('cut', e => { e.preventDefault(); r('CUT_ATTEMPT'); });
    on('contextmenu', e => { e.preventDefault(); r('RIGHT_CLICK'); });
    on('keydown', e => {
      const k = e.key.toLowerCase(), c = e.ctrlKey || e.metaKey;
      const block = e.key === 'F12' || (c && k === 'u') || (c && e.shiftKey && k === 'i');
      if (block || (c && ['c', 'v', 'x'].includes(k))) { if (block) e.preventDefault(); r('KEYBOARD_SHORTCUT', { combo: `${c ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}` }); }
    });
    const socket = io(API_URL, { auth: { token: localStorage.getItem('token') } });
    socket.on('connect', () => socket.emit('session:join', { attemptId }));
    socket.on('session:conflict', () => toast('Another active session for this exam was detected and recorded.', 'warn'));
    const hb = setInterval(() => socket.emit('heartbeat'), 10000);
    return () => { offs.forEach(f => f()); clearInterval(hb); socket.disconnect(); };
  }, [attemptId]);
  return null;
}
