import { fmtTime, label } from '../utils/format.js';
export default function IncidentTimeline({ events }) {
  if (!events.length) return <p className="text-sm text-slate-500">No events recorded.</p>;
  return <ol className="relative border-l-2 border-slate-200 ml-2 space-y-3">{events.map(e => <li key={e._id} className="ml-4">
    <span className={`absolute -left-[7px] w-3 h-3 rounded-full ${e.severity >= 3 ? 'bg-red-500' : e.severity > 0 ? 'bg-amber-500' : 'bg-indigo-500'}`} />
    <span className="font-mono text-xs text-slate-500 mr-3">{fmtTime(e.timestamp)}</span>
    <span className="text-sm">{e.eventType === 'EXAM_STARTED' ? 'Exam Started' : e.eventType === 'EXAM_SUBMITTED' ? 'Exam Submitted' : label(e.eventType)}</span>
    {e.severity > 0 && <span className="ml-2 text-xs text-slate-400">(+{e.severity})</span>}
    {e.metadata?.combo && <span className="ml-2 text-xs text-slate-400">{e.metadata.combo}</span>}</li>)}</ol>;
}
