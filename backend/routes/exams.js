import { Router } from 'express'; import { Exam, Question, Attempt } from '../models/index.js';
import { protect, adminOnly } from '../middleware/auth.js'; import h from '../utils/asyncHandler.js';
const router = Router(); router.use(protect);
const F = ['title', 'description', 'duration', 'totalMarks', 'passingMarks', 'startDate', 'endDate'];
const pick = b => Object.fromEntries(F.filter(k => b[k] !== undefined).map(k => [k, b[k]]));
const badDates = b => b.startDate && b.endDate && new Date(b.endDate) <= new Date(b.startDate);
router.get('/', h(async (req, res) => {
  const exams = await Exam.find().sort({ startDate: -1 }).lean();
  const counts = await Question.aggregate([{ $group: { _id: '$examId', n: { $sum: 1 } } }]); const cm = new Map(counts.map(c => [String(c._id), c.n]));
  let am = new Map();
  if (req.user.role === 'student') am = new Map((await Attempt.find({ studentId: req.user._id }).select('examId status score')).map(a => [String(a.examId), a]));
  res.json(exams.map(e => ({ ...e, questionCount: cm.get(String(e._id)) || 0, attempt: am.get(String(e._id)) || null })));
}));
router.get('/:id', h(async (req, res) => {
  const e = await Exam.findById(req.params.id).lean(); if (!e) return res.status(404).json({ message: 'Exam not found' });
  res.json({ ...e, questionCount: await Question.countDocuments({ examId: e._id }) });
}));
router.post('/', adminOnly, h(async (req, res) => {
  if (badDates(req.body)) return res.status(400).json({ message: 'End date must be after start date' });
  res.status(201).json(await Exam.create({ ...pick(req.body), createdBy: req.user._id }));
}));
router.put('/:id', adminOnly, h(async (req, res) => {
  if (badDates(req.body)) return res.status(400).json({ message: 'End date must be after start date' });
  const e = await Exam.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  e ? res.json(e) : res.status(404).json({ message: 'Exam not found' });
}));
router.delete('/:id', adminOnly, h(async (req, res) => {
  const e = await Exam.findByIdAndDelete(req.params.id); if (!e) return res.status(404).json({ message: 'Exam not found' });
  await Question.deleteMany({ examId: e._id }); res.json({ message: 'Deleted' });
}));
export default router;
