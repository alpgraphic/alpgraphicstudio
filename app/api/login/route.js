import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

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
  try {
    // İstek gövdesini al
    const body = await request.json();
    const { username, password } = body;
    
    console.log('Login denemesi:', { username });
    
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }
    
    // Veritabanına bağlan
    await dbConnect();
    console.log('DB bağlantısı başarılı');
    
    // Kullanıcıyı bul
    const user = await User.findOne({ username });
    console.log('Kullanıcı bulundu mu:', !!user);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }
    
    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Şifre eşleşti mi:', isMatch);
    
    if (!isMatch || !user.isAdmin) {
      return NextResponse.json(
        { message: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }
    
    // Session oluştur
    const res = new NextResponse(
      JSON.stringify({ 
        message: 'Giriş başarılı', 
        user: {
          id: user._id.toString(),
          username: user.username,
          isAdmin: user.isAdmin
        } 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
    
    const session = await getIronSession(request, res, sessionOptions);
    session.user = {
      id: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin,
    };
    
    await session.save();
    
    return res;
    
  } catch (error) {
    console.error('Login hatası:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}