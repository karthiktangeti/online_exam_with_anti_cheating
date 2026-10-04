import { Router } from 'express'; import bcrypt from 'bcryptjs'; import jwt from 'jsonwebtoken';
import { User } from '../models/index.js'; import { protect } from '../middleware/auth.js'; import h from '../utils/asyncHandler.js';
const router = Router(); const s = v => typeof v === 'string';
const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
const pub = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });
router.post('/register', h(async (req, res) => {
  const { name, email, password } = req.body;
  if (!s(name) || !s(email) || !s(password) || !name.trim() || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6)
    return res.status(400).json({ message: 'Valid name, email and password (min 6 chars) required' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name: name.trim(), email, password: await bcrypt.hash(password, 12), role: 'student' }); // public signup = student only
  res.status(201).json({ token: sign(user), user: pub(user) });
}));
router.post('/login', h(async (req, res) => {
  const { email, password } = req.body;
  if (!s(email) || !s(password)) return res.status(400).json({ message: 'Email and password required' });
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: sign(user), user: pub(user) });
}));
router.get('/me', protect, (req, res) => res.json({ user: pub(req.user) }));
export default router;
