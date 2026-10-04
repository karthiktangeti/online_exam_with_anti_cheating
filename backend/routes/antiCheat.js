import { Router } from 'express'; import { Attempt, AntiCheatEvent } from '../models/index.js';
import { protect, adminOnly, studentOnly } from '../middleware/auth.js'; import h from '../utils/asyncHandler.js';
import { logEvent, MAX_WARNINGS } from '../services/events.js'; import { CLIENT_EVENTS, riskLevel } from '../utils/weights.js'; import { finalizeAttempt } from '../services/grading.js';
const router = Router(); router.use(protect);
router.post('/event', studentOnly, h(async (req, res) => {
  const { attemptId, eventType, metadata } = req.body;
  if (!CLIENT_EVENTS.includes(eventType)) return res.status(400).json({ message: 'Invalid event type' });
  const a = await Attempt.findOne({ _id: attemptId, studentId: req.user._id, status: 'in_progress' }); if (!a) return res.status(404).json({ message: 'No active attempt' });
  const safeMeta = metadata && typeof metadata === 'object' && JSON.stringify(metadata).length < 1000 ? metadata : {};
  const result = await logEvent({ attemptId, studentId: a.studentId, examId: a.examId, eventType, metadata: safeMeta });
  if (result.autoSubmitted) await finalizeAttempt(a, 'auto_submitted');
  res.status(201).json({ success: true, warningCount: result.warningCount, maxWarnings: MAX_WARNINGS, autoSubmitted: result.autoSubmitted, event: result.event });
}));
router.get('/recent', adminOnly, h(async (req, res) =>
  res.json(await AntiCheatEvent.find({ severity: { $gt: 0 } }).sort({ timestamp: -1 }).limit(10).populate('studentId', 'name').populate('examId', 'title'))));
router.get('/attempt/:attemptId', adminOnly, h(async (req, res) => {
  const attempt = await Attempt.findById(req.params.attemptId).populate('studentId', 'name email').populate('examId', 'title totalMarks');
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  const events = await AntiCheatEvent.find({ attemptId: attempt._id }).sort({ timestamp: 1 });
  const counts = {}; let score = 0; for (const e of events) { counts[e.eventType] = (counts[e.eventType] || 0) + 1; score += e.severity; }
  res.json({ attempt, events, counts, risk: { score, level: riskLevel(score) } });
}));
export default router;
