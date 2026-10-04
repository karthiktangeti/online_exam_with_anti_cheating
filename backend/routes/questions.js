import { Router } from 'express'; import { Question, Attempt } from '../models/index.js';
import { protect, adminOnly } from '../middleware/auth.js'; import h from '../utils/asyncHandler.js';
const router = Router(); router.use(protect);
const F = ['examId', 'question', 'options', 'correctAnswer', 'marks'];
const pick = b => Object.fromEntries(F.filter(k => b[k] !== undefined).map(k => [k, b[k]]));
const check = b => (b.options && (!Array.isArray(b.options) || b.options.some(o => typeof o !== 'string' || !o.trim()))) ? 'Options must be non-empty strings'
  : (b.options && b.correctAnswer !== undefined && !(Number.isInteger(+b.correctAnswer) && +b.correctAnswer < b.options.length)) ? 'correctAnswer must be a valid option index' : null;
router.post('/', adminOnly, h(async (req, res) => {
  const m = check(req.body); if (m) return res.status(400).json({ message: m });
  res.status(201).json(await Question.create(pick(req.body)));
}));
router.get('/exam/:examId', h(async (req, res) => {
  const qs = await Question.find({ examId: req.params.examId }).sort({ createdAt: 1 }).lean();
  if (req.user.role === 'admin') return res.json(qs);
  // students: only during their own live attempt, and never with correctAnswer
  const a = await Attempt.findOne({ studentId: req.user._id, examId: req.params.examId, status: 'in_progress' });
  if (!a) return res.status(403).json({ message: 'No active attempt' });
  res.json(qs.map(({ correctAnswer, ...q }) => q)); // eslint-disable-line
}));
router.put('/:id', adminOnly, h(async (req, res) => {
  const m = check(req.body); if (m) return res.status(400).json({ message: m });
  const { examId, ...body } = pick(req.body); // examId immutable
  const q = await Question.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  q ? res.json(q) : res.status(404).json({ message: 'Question not found' });
}));
router.delete('/:id', adminOnly, h(async (req, res) => {
  const q = await Question.findByIdAndDelete(req.params.id); q ? res.json({ message: 'Deleted' }) : res.status(404).json({ message: 'Question not found' });
}));
export default router;
