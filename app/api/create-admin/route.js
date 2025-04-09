// app/api/create-admin/route.js dosyasını oluşturun
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();
    
    // Kullanıcı zaten var mı kontrol et
    const existingUser = await User.findOne({ username: 'admin' });
    if (existingUser) {
      return NextResponse.json({ 
        message: 'Admin kullanıcısı zaten mevcut',
        admin: {
          username: existingUser.username,
          isAdmin: existingUser.isAdmin,
          id: existingUser._id
        }
      });
    }
    
    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('1313013.aliveli.13211313013.aliveli.1321', salt);
    
    // Kullanıcıyı oluştur
    const newUser = new User({
      username: 'admin',
      password: hashedPassword,
      isAdmin: true
    });
    
    await newUser.save();
    return NextResponse.json({ 
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      admin: {
        username: newUser.username,
        isAdmin: newUser.isAdmin,
        id: newUser._id
      }
    });
  } catch (error) {
    console.error('Hata:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}