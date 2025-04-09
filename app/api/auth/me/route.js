import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';

// Oturum ayarları
const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};

export async function GET(request) {
  const res = new NextResponse();
  const session = await getIronSession(request, res, sessionOptions);
  
  if (session.user) {
    return NextResponse.json({ user: session.user });
  }
  
  return NextResponse.json(
    { message: 'Oturum açılmadı' },
    { status: 401 }
  );
}