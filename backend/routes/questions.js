import { Router } from 'express'; import { Question, Attempt, Exam } from '../models/index.js';
import { protect, adminOnly } from '../middleware/auth.js'; import h from '../utils/asyncHandler.js';
const router = Router(); router.use(protect);
const F = ['examId', 'question', 'options', 'correctAnswer', 'marks'];
const pick = b => Object.fromEntries(F.filter(k => b[k] !== undefined).map(k => [k, b[k]]));
const check = b => (b.options && (!Array.isArray(b.options) || b.options.some(o => typeof o !== 'string' || !o.trim()))) ? 'Options must be non-empty strings'
  : (b.options && b.correctAnswer !== undefined && !(Number.isInteger(+b.correctAnswer) && +b.correctAnswer < b.options.length)) ? 'correctAnswer must be a valid option index' : null;
const generatedQuestion = value => {
  if (!value || typeof value.question !== 'string' || !value.question.trim() ||
      !Array.isArray(value.options) || value.options.length !== 4 ||
      value.options.some(o => typeof o !== 'string' || !o.trim()) ||
      !Number.isInteger(value.correctAnswer) || value.correctAnswer < 0 || value.correctAnswer > 3 ||
      !Number.isFinite(value.marks) || value.marks < 0) return null;
  return { question: value.question.trim(), options: value.options.map(o => o.trim()), correctAnswer: value.correctAnswer, marks: value.marks };
};
const generateFromGroq = async ({ examTitle, topic, difficulty, count }) => {
  const prompt = [
    `Create ${count} different ${difficulty} multiple-choice question${count === 1 ? '' : 's'} for the exam "${examTitle}".`,
    `Topic: ${topic.trim()}.`,
    'Return only valid JSON with this exact shape: {"questions":[{"question":"...","options":["...","...","...","..."],"correctAnswer":0,"marks":1}]}',
    'Each question must have exactly four options. correctAnswer must be the zero-based index of the one correct option. Do not include markdown or explanations.'
  ].join(' ');
  let response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You generate accurate educational multiple-choice questions.' },
          { role: 'user', content: prompt }
        ]
      }),
      signal: AbortSignal.timeout(60000)
    });
  } catch (error) {
    console.error('Groq request failed:', error.message);
    const e = new Error('Unable to reach Groq. Try again.'); e.status = 502; throw e;
  }
  if (!response.ok) {
    console.error('Groq API error:', response.status, await response.text());
    const e = new Error('Groq could not generate questions.'); e.status = 502; throw e;
  }
  const payload = await response.json();
  let parsed;
  try { parsed = JSON.parse(payload.choices?.[0]?.message?.content || ''); } catch {
    const e = new Error('Groq returned invalid questions.'); e.status = 502; throw e;
  }
  const questions = Array.isArray(parsed) ? parsed : parsed.questions;
  const result = questions?.map(generatedQuestion).filter(Boolean);
  if (!result?.length || result.length !== count) {
    const e = new Error('Groq returned incomplete questions. Try a smaller number.'); e.status = 502; throw e;
  }
  return result;
};
router.post('/', adminOnly, h(async (req, res) => {
  const m = check(req.body); if (m) return res.status(400).json({ message: m });
  res.status(201).json(await Question.create(pick(req.body)));
}));
router.post('/bulk', adminOnly, h(async (req, res) => {
  const { examId, questions } = req.body;
  if (!examId || !Array.isArray(questions) || !questions.length || questions.length > 20) {
    return res.status(400).json({ message: 'Provide between 1 and 20 questions' });
  }
  const exam = await Exam.findById(examId).select('_id');
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  const invalid = questions.find(q => check(q) || !generatedQuestion(q));
  if (invalid) return res.status(400).json({ message: 'One or more questions are invalid' });
  const saved = await Question.insertMany(questions.map(q => ({ ...generatedQuestion(q), examId })));
  res.status(201).json(saved);
}));
router.post('/generate', adminOnly, h(async (req, res) => {
  const { examId, topic, difficulty = 'medium' } = req.body;
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ message: 'Groq is not configured. Set GROQ_API_KEY on the backend.' });
  if (!topic || typeof topic !== 'string' || !topic.trim()) return res.status(400).json({ message: 'Topic is required' });
  const exam = await Exam.findById(examId).select('title');
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  res.json((await generateFromGroq({ examTitle: exam.title, topic, difficulty, count: 1 }))[0]);
}));
router.post('/generate-bulk', adminOnly, h(async (req, res) => {
  const { examId, topic, difficulty = 'medium', count } = req.body;
  const number = Number(count);
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ message: 'Groq is not configured. Set GROQ_API_KEY on the backend.' });
  if (!topic || typeof topic !== 'string' || !topic.trim()) return res.status(400).json({ message: 'Topic is required' });
  if (!Number.isInteger(number) || number < 1 || number > 20) return res.status(400).json({ message: 'Question count must be between 1 and 20' });
  const exam = await Exam.findById(examId).select('title');
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  res.json(await generateFromGroq({ examTitle: exam.title, topic, difficulty, count: number }));
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
