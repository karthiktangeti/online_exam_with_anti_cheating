import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../services/api.js';
import ExamCard from '../components/ExamCard.jsx';
import { Empty, ErrorBox, LoadingSpinner } from '../components/UI.jsx';

const groups = ['Available', 'Upcoming', 'Completed'];

export default function StudentExams() {
  const nav = useNavigate();
  const [exams, setExams] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/exams').then(({ data }) => setExams(data)).catch(e => setErr(errMsg(e)));
  }, []);

  if (err) return <ErrorBox text={err} />;
  if (!exams) return <LoadingSpinner />;

  const now = Date.now();
  const grouped = { Available: [], Upcoming: [], Completed: [] };
  exams.forEach(exam => {
    const attempt = exam.attempt;
    const status = attempt && attempt.status !== 'in_progress'
      ? 'Completed'
      : now < new Date(exam.startDate)
        ? 'Upcoming'
        : (attempt?.status === 'in_progress' || now <= new Date(exam.endDate))
          ? (attempt ? 'In progress' : 'Available')
          : 'Closed';
    grouped[status === 'In progress' ? 'Available' : status === 'Closed' ? 'Completed' : status].push({ exam, status });
  });

  return <div className="page-enter space-y-10">
    <div><p className="text-sm font-semibold text-blue-600">Student workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">My exams</h1><p className="mt-2 text-sm text-slate-500">Choose an assessment to begin or continue your learning journey.</p></div>
    {groups.map(group => <section key={group}><h2 className="mb-4 text-lg font-bold text-slate-900">{group} exams</h2>{grouped[group].length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{grouped[group].map(({ exam, status }, index) => <ExamCard key={exam._id} exam={exam} status={status} index={index} onStart={() => nav(`/exam/${exam._id}/start`)} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10"><Empty text={`No ${group.toLowerCase()} exams`} /></div>}</section>)}
  </div>;
}
