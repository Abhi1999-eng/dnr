import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdminUser } from '@/models/AdminUser';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  await connectDB();
  const user = await AdminUser.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }
  const token = signToken({ id: user._id, email: user.email });
  const res = NextResponse.json({ message: 'ok', token });
  res.cookies.set('dnr_token', token, { httpOnly: true, sameSite: 'lax', path: '/' });
  return res;
}
