export const fmtDur = s => { s = Math.max(0, Math.round(s)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
export const fmtDate = d => (d ? new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '-');
export const fmtTime = d => new Date(d).toLocaleTimeString([], { hour12: false });
export const toLocalInput = d => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };
export const timeTaken = a => (a.submittedAt ? (Math.min(new Date(a.submittedAt), new Date(a.endTime)) - new Date(a.startTime)) / 1000 : 0);
export const label = t => t.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
