import { Attempt, Answer, Question } from '../models/index.js'; import { logEvent } from './events.js';
import { emitToAdmins } from './io.js';
// Atomic claim prevents double grading; the server alone computes the score.
export async function finalizeAttempt(attempt, status = 'submitted') {
  const claimed = await Attempt.findOneAndUpdate({ _id: attempt._id, status: 'in_progress' }, { status }, { new: true });
  if (!claimed) return Attempt.findById(attempt._id);
  const [qs, ans] = await Promise.all([Question.find({ examId: claimed.examId }), Answer.find({ attemptId: claimed._id })]);
  const am = new Map(ans.map(a => [String(a.questionId), a]));
  let score = 0, correct = 0, wrong = 0, unanswered = 0;
  for (const q of qs) {
    const a = am.get(String(q._id));
    if (!a || a.selectedAnswer == null) { unanswered++; continue; }
    const ok = a.selectedAnswer === q.correctAnswer; a.isCorrect = ok; a.marksObtained = ok ? q.marks : 0; await a.save();
    if (ok) { correct++; score += q.marks; } else wrong++;
  }
  Object.assign(claimed, { score, correct, wrong, unanswered, submittedAt: new Date() }); await claimed.save();
  await logEvent({ attemptId: claimed._id, studentId: claimed.studentId, examId: claimed.examId, eventType: 'EXAM_SUBMITTED', metadata: { status } });
  emitToAdmins('live:session', { attemptId: String(claimed._id), studentId: String(claimed.studentId), examId: String(claimed.examId), status: 'finalized', finished: true, timestamp: new Date().toISOString() });
  return claimed;
}
export const isExpired = a => a.status === 'in_progress' && a.endTime.getTime() < Date.now();
