import 'dotenv/config';
import bcrypt from 'bcryptjs'; 
import mongoose from 'mongoose'; 
import { User } from '../models/index.js';
await mongoose.connect(process.env.MONGO_URI);
const { ADMIN_NAME: name, ADMIN_EMAIL: email, ADMIN_PASSWORD: pw } = process.env;
if (await User.findOne({ email: email.toLowerCase() })) console.log('Admin already exists');
else { await User.create({ name, email, password: await bcrypt.hash(pw, 12), role: 'admin' }); console.log('Admin created:', email); }
await mongoose.disconnect();
