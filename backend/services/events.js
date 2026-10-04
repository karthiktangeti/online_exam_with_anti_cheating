import { AntiCheatEvent, Attempt, User, Exam } from '../models/index.js'; import { WEIGHTS } from '../utils/weights.js';
import { emitToAdmins } from './io.js';
export const MAX_WARNINGS = 10;
export async function logEvent({ attemptId, studentId, examId, eventType, metadata = {} }) {
  const severity = WEIGHTS[eventType] ?? 0;
  const warningNumber = severity > 0 ? await AntiCheatEvent.countDocuments({ attemptId, severity: { $gt: 0 } }) + 1 : 0;
  const event = await AntiCheatEvent.create({ attemptId, studentId, examId, eventType, severity, warningNumber, metadata });
  const warningCount = severity > 0 ? warningNumber : await AntiCheatEvent.countDocuments({ attemptId, severity: { $gt: 0 } });
  await Attempt.findByIdAndUpdate(attemptId, { antiCheatWarningCount: warningCount });
  const result = { event, warningCount, maxWarnings: MAX_WARNINGS, autoSubmitted: warningCount >= MAX_WARNINGS };
  try {
    const [student, exam] = await Promise.all([User.findById(studentId).select('name').lean(), Exam.findById(examId).select('title').lean()]);
    emitToAdmins('live:event', { ...event.toObject(), attemptId: String(attemptId), studentId: String(studentId), examId: String(examId), studentName: student?.name, examTitle: exam?.title, warningCount });
  } catch (error) {
    console.error('Live event notification failed:', error.message);
  }
  return result;
}
