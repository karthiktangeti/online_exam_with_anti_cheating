import mongoose from 'mongoose';
export default async function connectDB() {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.startsWith('PASTE')) throw new Error('Set MONGO_URI in backend/.env');
  if (!process.env.JWT_SECRET) throw new Error('Set JWT_SECRET in backend/.env');
  await mongoose.connect(process.env.MONGO_URI); console.log('MongoDB connected');
}
