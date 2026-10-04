import { Router } from 'express'; import { Attempt, Question, Answer } from '../models/index.js';
import { protect, studentOnly } from '../middleware/auth.js'; import h from '../utils/asyncHandler.js';
const router = Router(); router.use(protect, studentOnly);
const save = h(async (req, res) => {
  const { attemptId, questionId, selectedAnswer } = req.body;
  const a = await Attempt.findOne({ _id: attemptId, studentId: req.user._id }); if (!a) return res.status(404).json({ message: 'Attempt not found' });
  if (a.status !== 'in_progress' || Date.now() > a.endTime.getTime() + 5000) return res.status(403).json({ message: 'Attempt is closed' }); // server-side timer check
  const q = await Question.findOne({ _id: questionId, examId: a.examId }); if (!q) return res.status(404).json({ message: 'Question not found' });
  const sel = selectedAnswer === null ? null : Number(selectedAnswer);
  if (sel !== null && !(Number.isInteger(sel) && sel >= 0 && sel < q.options.length)) return res.status(400).json({ message: 'Invalid option' });
  const ans = await Answer.findOneAndUpdate({ attemptId, questionId }, { selectedAnswer: sel }, { upsert: true, new: true, setDefaultsOnInsert: true });
  res.json({ id: ans._id, selectedAnswer: ans.selectedAnswer });
});
router.post('/', save);
router.put('/:id', h(async (req, res, next) => {
  const a = await Answer.findById(req.params.id); if (!a) return res.status(404).json({ message: 'Answer not found' });
  req.body = { ...req.body, attemptId: a.attemptId, questionId: a.questionId }; return save(req, res, next);
}));
export default router;
