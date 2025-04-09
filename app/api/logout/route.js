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

export async function POST(request) {
  const res = new NextResponse();
  const session = await getIronSession(request, res, sessionOptions);
  
  // Oturumu temizle
  session.destroy();
  
  return NextResponse.json({ message: 'Çıkış yapıldı' });
}