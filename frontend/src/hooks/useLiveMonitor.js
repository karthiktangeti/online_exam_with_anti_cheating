import { useCallback, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import api, { API_URL } from '../services/api.js';

const MAX_EVENTS = 100;
const WEIGHTS = { TAB_SWITCH: 1, FULLSCREEN_EXIT: 2, COPY_ATTEMPT: 1, PASTE_ATTEMPT: 1, CUT_ATTEMPT: 1, RIGHT_CLICK: 1, KEYBOARD_SHORTCUT: 1, MULTIPLE_SESSION: 3, NO_FACE: 2, NO_FACE_DETECTED: 2, MULTIPLE_FACES: 4, MULTIPLE_FACES_DETECTED: 4, LOOKING_AWAY: 1, HEAD_TURN_LEFT: 1, HEAD_TURN_RIGHT: 1, LOOKING_DOWN: 1, PHONE_DETECTED: 5, CAMERA_DISABLED: 3 };
const level = score => score < 3 ? 'Normal Activity' : score < 8 ? 'Review Recommended' : 'Multiple Incidents';
const key = value => String(value);

function normalizeStudent(item) {
  return { ...item, _id: key(item._id || item.attemptId), riskScore: item.riskScore || 0, riskLevel: item.riskLevel || level(item.riskScore || 0), counts: item.counts || item.eventCounts || {}, answeredCount: item.answeredCount ?? item.answered ?? 0, totalQuestions: item.totalQuestions ?? item.total ?? 0, online: Boolean(item.online) };
}

export default function useLiveMonitor() {
  const [students, setStudents] = useState([]); const [events, setEvents] = useState([]); const [connected, setConnected] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => {
    const { data } = await api.get('/admin/live');
    const snapshot = Array.isArray(data) ? data : (data.students || data.attempts || []);
    setStudents(snapshot.map(normalizeStudent)); setEvents((data.events || []).slice(0, MAX_EVENTS)); setError('');
  }, []);
  useEffect(() => {
    let alive = true; let socket;
    const start = async () => {
      try { await load(); if (!alive) return;
        socket = io(API_URL, { auth: { token: localStorage.getItem('token') } });
        socket.on('connect', () => { setConnected(true); load().catch(e => setError(e.message)); });
        socket.on('disconnect', () => setConnected(false));
        socket.on('connect_error', e => setError(e.message || 'Live monitor connection failed'));
        socket.on('live:event', event => {
          setEvents(current => [event, ...current].slice(0, MAX_EVENTS));
          setStudents(current => current.map(student => key(student._id) === key(event.attemptId) ? { ...student, riskScore: student.riskScore + (event.severity || 0), riskLevel: level(student.riskScore + (event.severity || 0)), counts: { ...student.counts, [event.eventType]: (student.counts[event.eventType] || 0) + 1 } } : student));
        });
        socket.on('live:session', change => {
          const id = key(change.attemptId);
          const finished = change.finished || change.status === 'finalized';
          setStudents(current => finished ? current.filter(x => key(x._id) !== id) : current.some(x => key(x._id) === id) ? current.map(x => key(x._id) === id ? { ...x, online: change.online ?? change.status === 'online' } : x) : current);
          if (finished || change.status === 'started') load().catch(e => setError(e.message));
        });
      } catch (e) { if (alive) setError(e.response?.data?.message || e.message || 'Could not load live monitor'); }
      finally { if (alive) setLoading(false); }
    };
    start(); return () => { alive = false; socket?.disconnect(); };
  }, [load]);
  const stats = useMemo(() => ({ total: students.length, online: students.filter(x => x.online).length, offline: students.filter(x => !x.online).length, flagged: students.filter(x => x.riskLevel !== 'Normal Activity').length }), [students]);
  return { students, events, connected, loading, error, stats, refresh: load };
}
