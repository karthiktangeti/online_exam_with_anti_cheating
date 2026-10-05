import mongoose from 'mongoose'; import { EVENT_TYPES } from '../utils/weights.js';
const { Schema, model } = mongoose; const ref = (r, x = {}) => ({ type: Schema.Types.ObjectId, ref: r, required: true, ...x });
export const User = model('User', new Schema({
  name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  profilePicture: { type: String, default: '' },
  password: { type: String, required: true, select: false }, role: { type: String, enum: ['student', 'admin'], default: 'student' }, createdAt: { type: Date, default: Date.now } }));
export const Exam = model('Exam', new Schema({
  title: { type: String, required: true, trim: true }, description: String, duration: { type: Number, required: true, min: 1 },
  totalMarks: { type: Number, required: true, min: 0 }, passingMarks: { type: Number, default: 0 }, startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }, createdBy: ref('User'), createdAt: { type: Date, default: Date.now } }));
export const Question = model('Question', new Schema({
  examId: ref('Exam', { index: true }), question: { type: String, required: true, trim: true },
  options: { type: [String], validate: [v => v.length >= 2, 'At least 2 options required'] },
  correctAnswer: { type: Number, required: true, min: 0 }, marks: { type: Number, default: 1, min: 0 }, createdAt: { type: Date, default: Date.now } }));
const attemptSchema = new Schema({
  studentId: ref('User'), examId: ref('Exam'), startTime: { type: Date, default: Date.now }, endTime: { type: Date, required: true }, submittedAt: Date,
  score: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, wrong: { type: Number, default: 0 }, unanswered: { type: Number, default: 0 },
  marked: [{ type: Schema.Types.ObjectId }], status: { type: String, enum: ['in_progress', 'submitted', 'auto_submitted'], default: 'in_progress' },
  antiCheatWarningCount: { type: Number, default: 0, min: 0 }, autoSubmitReason: String });
attemptSchema.index({ studentId: 1, examId: 1 }, { unique: true }); // one attempt per student per exam
export const Attempt = model('Attempt', attemptSchema);
const answerSchema = new Schema({ attemptId: ref('Attempt'), questionId: ref('Question'), selectedAnswer: { type: Number, default: null },
  isCorrect: { type: Boolean, default: false }, marksObtained: { type: Number, default: 0 } });
answerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });
export const Answer = model('Answer', answerSchema);
export const AntiCheatEvent = model('AntiCheatEvent', new Schema({
  attemptId: ref('Attempt', { index: true }), studentId: ref('User'), examId: ref('Exam'), eventType: { type: String, enum: EVENT_TYPES, required: true },
  severity: { type: Number, default: 0 }, warningNumber: { type: Number, default: 0, min: 0 },
  timestamp: { type: Date, default: Date.now }, metadata: { type: Schema.Types.Mixed, default: {} } }));
