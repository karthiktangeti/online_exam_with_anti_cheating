import jwt from 'jsonwebtoken'; 
import { User } from '../models/index.js';
export async function protect(req, res, next) {
  try {
    const h = req.headers.authorization || ''; 
    const t = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!t) return res.status(401).json({ message: 'Not authenticated' });
    const { id } = jwt.verify(t, process.env.JWT_SECRET);
    const u = await User.findById(id);
    if (!u) return res.status(401).json({ message: 'User no longer exists' });
    req.user = u; next();
  } catch { res.status(401).json({ message: 'Invalid or expired token' }); }
}
const only = r => (req, res, next) => (req.user.role === r ? next() : res.status(403).json({ message: 'Forbidden' }));
export const adminOnly = only('admin');
export const studentOnly = only('student');
