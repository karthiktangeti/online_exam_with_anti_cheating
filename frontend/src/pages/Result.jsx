import { useEffect, useState } from 'react'; import { Link, Navigate, useParams } from 'react-router-dom'; import api, { errMsg } from '../services/api.js';
import ResultCard from '../components/ResultCard.jsx'; import { LoadingSpinner, ErrorBox, btn2 } from '../components/UI.jsx';
export default function Result() {
  const { id } = useParams(); const [a, setA] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get(`/attempts/${id}`).then(r => setA(r.data)).catch(e => setErr(errMsg(e))); }, [id]);
  if (err) return <div className="p-6"><ErrorBox text={err} /></div>; if (!a) return <LoadingSpinner />;
  if (a.status === 'in_progress') return <Navigate to={`/exam/attempt/${id}`} replace />;
  return <div className="p-4 space-y-4"><ResultCard attempt={a} /><div className="text-center"><Link to="/student" className={btn2}>Back to dashboard</Link></div></div>;
}
