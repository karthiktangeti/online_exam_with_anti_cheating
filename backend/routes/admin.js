import { Router } from 'express'; import { User, Exam, Attempt } from '../models/index.js';
import { protect, adminOnly } from '../middleware/auth.js'; import h from '../utils/asyncHandler.js';
import { isOnline } from '../services/socket.js'; import { riskLevel } from '../utils/weights.js';
const router = Router(); router.use(protect, adminOnly);
router.get('/stats', h(async (req, res) => {
  const [totalStudents, totalExams, totalAttempts, avg, recentAttempts] = await Promise.all([
    User.countDocuments({ role: 'student' }), Exam.countDocuments(), Attempt.countDocuments(),
    Attempt.aggregate([{ $match: { status: { $ne: 'in_progress' } } }, { $lookup: { from: 'exams', localField: 'examId', foreignField: '_id', as: 'e' } }, { $unwind: '$e' },
      { $group: { _id: null, pct: { $avg: { $multiply: [{ $divide: ['$score', { $max: ['$e.totalMarks', 1] }] }, 100] } } } }]),
    Attempt.find().sort({ startTime: -1 }).limit(8).populate('studentId', 'name').populate('examId', 'title totalMarks')]);
  res.json({ totalStudents, totalExams, totalAttempts, averageScore: Math.round(avg[0]?.pct || 0), recentAttempts });
}));
router.get('/students', h(async (req, res) => {
  const students = await User.find({ role: 'student' }).sort({ createdAt: -1 }).lean();
  const c = await Attempt.aggregate([{ $group: { _id: '$studentId', n: { $sum: 1 } } }]); const m = new Map(c.map(x => [String(x._id), x.n]));
  res.json(students.map(s => ({ ...s, attempts: m.get(String(s._id)) || 0 })));
}));
router.get('/live', h(async (req, res) => {
  const sessions = await Attempt.aggregate([
    { $match: { status: 'in_progress', endTime: { $gt: new Date() } } },
    { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
    { $lookup: { from: 'exams', localField: 'examId', foreignField: '_id', as: 'exam' } },
    { $lookup: { from: 'anticheatevents', localField: '_id', foreignField: 'attemptId', as: 'events' } },
    { $lookup: { from: 'answers', localField: '_id', foreignField: 'attemptId', as: 'answers' } },
    { $lookup: { from: 'questions', localField: 'examId', foreignField: 'examId', as: 'questions' } },
    { $project: {
      attemptId: '$_id', studentId: { $arrayElemAt: ['$student._id', 0] }, studentName: { $arrayElemAt: ['$student.name', 0] },
      examId: { $arrayElemAt: ['$exam._id', 0] }, examTitle: { $arrayElemAt: ['$exam.title', 0] },
      startTime: 1, endTime: 1, warningCount: '$antiCheatWarningCount',
      riskScore: { $sum: '$events.severity' }, eventTypes: '$events.eventType',
      answered: { $size: { $filter: { input: '$answers', as: 'answer', cond: { $ne: ['$$answer.selectedAnswer', null] } } } },
      total: { $size: '$questions' }
    } }
  ]);
  res.json(sessions.map(session => {
    const eventCounts = {};
    for (const type of session.eventTypes || []) eventCounts[type] = (eventCounts[type] || 0) + 1;
    delete session.eventTypes;
    return { ...session, riskLevel: riskLevel(session.riskScore || 0), secondsRemaining: Math.max(0, Math.ceil((new Date(session.endTime).getTime() - Date.now()) / 1000)), online: isOnline(session.attemptId), counts: eventCounts, answeredCount: session.answered, totalQuestions: session.total };
  }));
}));
export default router;
