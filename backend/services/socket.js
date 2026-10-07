import jwt from 'jsonwebtoken'; 
import { User, Attempt } from '../models/index.js'; 
import { logEvent } from './events.js';
import { ADMIN_ROOM, emitToAdmins } from './io.js';
const sessions = new Map(); // "userId:examId" -> Map(socketId -> session)
const ALIVE = 25_000;
let sweep;

const sessionPayload = (session, status) => ({ ...session, status, online: status === 'online', timestamp: new Date().toISOString() });
function sweepSessions(io) {
  const now = Date.now();
  for (const [key, members] of sessions) {
    for (const [socketId, session] of members) {
      if (now - session.lastHeartbeat > ALIVE) {
        members.delete(socketId);
        emitToAdmins('live:session', sessionPayload(session, 'offline'));
        io.sockets.sockets.get(socketId)?.disconnect(true);
      }
    }
    if (!members.size) sessions.delete(key);
  }
}
export function isOnline(attemptId) {
  for (const members of sessions.values()) for (const session of members.values()) {
    if (String(session.attemptId) === String(attemptId)) return true;
  }
  return false;
}
export function initSocket(io) {
  io.use(async (s, next) => {
    try { const { id } = jwt.verify(s.handshake.auth.token, process.env.JWT_SECRET); s.user = await User.findById(id); next(s.user ? undefined : new Error('auth')); }
    catch { next(new Error('auth')); }
  });
  io.on('connection', socket => {
    if (socket.user.role === 'admin') {
      socket.join(ADMIN_ROOM);
      for (const members of sessions.values()) for (const session of members.values()) {
        socket.emit('live:session', sessionPayload(session, 'online'));
      }
      return;
    }
    socket.on('session:join', async ({ attemptId }) => {
      try {
        const a = await Attempt.findOne({ _id: attemptId, studentId: socket.user._id, status: 'in_progress' }); if (!a) return;
        const key = `${socket.user._id}:${a.examId}`; const m = sessions.get(key) || new Map(); const now = Date.now();
        for (const [sid, session] of m) if (now - session.lastHeartbeat > ALIVE) m.delete(sid);
        if (m.size > 0) {
          await logEvent({ attemptId: a._id, studentId: a.studentId, examId: a.examId, eventType: 'MULTIPLE_SESSION', metadata: { activeSessions: m.size + 1 } });
          for (const sid of m.keys()) io.to(sid).emit('session:conflict'); socket.emit('session:conflict');
        }
        const session = { attemptId: String(a._id), studentId: String(a.studentId), examId: String(a.examId), lastHeartbeat: now };
        m.set(socket.id, session); sessions.set(key, m); socket.data.key = key;
        emitToAdmins('live:session', sessionPayload(session, 'online'));
      } catch (e) { console.error(e); }
    });
    socket.on('heartbeat', () => { const m = sessions.get(socket.data.key); const session = m?.get(socket.id); if (session) session.lastHeartbeat = Date.now(); });
    socket.on('disconnect', () => {
      const m = sessions.get(socket.data.key); const session = m?.get(socket.id);
      m?.delete(socket.id); if (m && !m.size) sessions.delete(socket.data.key);
      if (session) emitToAdmins('live:session', sessionPayload(session, 'offline'));
    });
  });
  sweep = setInterval(() => sweepSessions(io), 15_000);
  sweep.unref?.();
}
