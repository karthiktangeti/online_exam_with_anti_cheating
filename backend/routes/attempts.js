import { Router } from 'express'; import { Exam, Question, Attempt, Answer, AntiCheatEvent } from '../models/index.js';
import { protect, adminOnly, studentOnly } from '../middleware/auth.js'; import h from '../utils/asyncHandler.js';
import { finalizeAttempt, isExpired } from '../services/grading.js'; import { logEvent } from '../services/events.js';
import { emitToAdmins } from '../services/io.js';
const router = Router(); router.use(protect);
const own = async (req, res) => {
  const a = await Attempt.findOne({ _id: req.params.id || req.body.attemptId, studentId: req.user._id });
  if (!a) { res.status(404).json({ message: 'Attempt not found' }); return null; }
  return isExpired(a) ? finalizeAttempt(a, 'auto_submitted') : a;
};
router.post('/start', studentOnly, h(async (req, res) => {
  const { examId } = req.body; const exam = await Exam.findById(examId); if (!exam) return res.status(404).json({ message: 'Exam not found' });
  let a = await Attempt.findOne({ studentId: req.user._id, examId });
  if (a) {
    if (isExpired(a)) a = await finalizeAttempt(a, 'auto_submitted');
    if (a.status !== 'in_progress') return res.status(400).json({ message: 'You have already completed this exam', attemptId: a._id });
    return res.json({ attemptId: a._id, resumed: true });
  }
  const now = new Date();
  if (now < exam.startDate) return res.status(400).json({ message: 'Exam has not started yet' });
  if (now > exam.endDate) return res.status(400).json({ message: 'Exam window has closed' });
  if (!(await Question.countDocuments({ examId }))) return res.status(400).json({ message: 'Exam has no questions yet' });
  const endTime = new Date(Math.min(now.getTime() + exam.duration * 60_000, exam.endDate.getTime()));
  a = await Attempt.create({ studentId: req.user._id, examId, startTime: now, endTime });
  await logEvent({ attemptId: a._id, studentId: a.studentId, examId, eventType: 'EXAM_STARTED' });
  emitToAdmins('live:session', { attemptId: String(a._id), studentId: String(a.studentId), examId: String(a.examId), status: 'started', online: false, timestamp: now.toISOString() });
  res.status(201).json({ attemptId: a._id });
}));
router.get('/mine', studentOnly, h(async (req, res) =>
  res.json(await Attempt.find({ studentId: req.user._id }).populate('examId', 'title totalMarks passingMarks').sort({ startTime: -1 }))));
router.get('/', adminOnly, h(async (req, res) => {
  const [list, agg] = await Promise.all([
    Attempt.find().populate('studentId', 'name email').populate('examId', 'title totalMarks').sort({ startTime: -1 }).limit(500).lean(),
    AntiCheatEvent.aggregate([{ $group: { _id: '$attemptId', score: { $sum: '$severity' }, warningCount: { $sum: { $cond: [{ $gt: ['$severity', 0] }, 1, 0] } } } }])]);
  const sm = new Map(agg.map(x => [String(x._id), x]));
  res.json(list.map(a => ({ ...a, warningCount: a.antiCheatWarningCount || sm.get(String(a._id))?.warningCount || 0, riskScore: sm.get(String(a._id))?.score || 0 })));
}));
router.get('/:id/session', studentOnly, h(async (req, res) => {
  const a = await own(req, res); if (!a) return;
  if (a.status !== 'in_progress') return res.json({ finished: true, attemptId: a._id });
  const [exam, qs, ans] = await Promise.all([Exam.findById(a.examId), Question.find({ examId: a.examId }).sort({ createdAt: 1 }).select('-correctAnswer').lean(), Answer.find({ attemptId: a._id })]);
  const warningEvents = await AntiCheatEvent.find({ attemptId: a._id, severity: { $gt: 0 } }).sort({ timestamp: 1 }).lean();
  res.json({ attemptId: a._id, exam, questions: qs, answers: Object.fromEntries(ans.map(x => [x.questionId, x.selectedAnswer])), marked: a.marked, endTime: a.endTime.getTime(), serverTime: Date.now(), warningCount: a.antiCheatWarningCount, warningEvents });
}));
router.put('/:id/marked', studentOnly, h(async (req, res) => {
  const a = await own(req, res); if (!a) return; if (a.status !== 'in_progress') return res.status(403).json({ message: 'Attempt closed' });
  a.marked = Array.isArray(req.body.marked) ? req.body.marked : []; await a.save(); res.json({ ok: true });
}));
router.post('/submit', studentOnly, h(async (req, res) => {
  const a = await own(req, res); if (!a) return;
  res.json(await finalizeAttempt(a, 'submitted'));
}));
router.get('/:id', h(async (req, res) => {
  let a = await Attempt.findById(req.params.id).populate('examId').populate('studentId', 'name email');
  if (!a) return res.status(404).json({ message: 'Attempt not found' });
  if (req.user.role !== 'admin' && String(a.studentId._id) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
  if (isExpired(a)) { await finalizeAttempt(a, 'auto_submitted'); a = await Attempt.findById(a._id).populate('examId').populate('studentId', 'name email'); }
  res.json(a);
}));
export default router;
