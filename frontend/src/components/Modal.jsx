import { btn, btn2 } from './UI.jsx';
export default function Modal({ open, title, children, onClose, onConfirm, confirmText = 'Confirm', hideFooter }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto p-6">
    <h3 className="text-lg font-semibold mb-3">{title}</h3><div className="text-sm text-slate-600">{children}</div>
    {!hideFooter && <div className="flex justify-end gap-2 mt-5"><button className={btn2} onClick={onClose}>Cancel</button><button className={btn} onClick={onConfirm}>{confirmText}</button></div>}</div></div>;
}
