import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    // İstek gövdesini al
    const body = await request.json();
    const { username, password, isAdmin = false } = body;
    
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }
    
    // Veritabanına bağlan
    await dbConnect();
    
    // Kullanıcı adı zaten var mı kontrol et
    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu kullanıcı adı zaten kullanılıyor' },
        { status: 400 }
      );
    }
    
    // Yeni kullanıcı oluştur
    const newUser = new User({
      username,
      password,  // Model pre-save hook'u bunu hashleyecek
      isAdmin
    });
    
    await newUser.save();
    
    return NextResponse.json(
      { 
        message: 'Kullanıcı başarıyla oluşturuldu',
        user: {
          id: newUser._id,
          username: newUser.username,
          isAdmin: newUser.isAdmin
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Kullanıcı kayıt hatası:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}