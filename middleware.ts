import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';

// Oturum ayarları
const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession(request, res, sessionOptions);
  
  // Admin sayfalarına erişim kontrolü
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.includes('/admin/login')) {
    
    // Giriş yapmamış kullanıcıyı login sayfasına yönlendir
    if (!session.user) {
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }
    
    // Admin olmayan kullanıcıyı anasayfaya yönlendir
    if (!session.user.isAdmin) {
      const url = new URL('/', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  return res;
}

// Middleware'i sadece admin altındaki URL'ler için çalıştır
export const config = {
  matcher: '/admin/:path*',
};