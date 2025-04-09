// app/api/setup-admin/route.js dosyasını oluşturun
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();
    
    // Mevcut admin kullanıcılarını temizle
    await User.deleteMany({ username: 'baris' });
    
    // Yeni bir admin kullanıcısı oluştur
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('mamamamamamamamamamamamamamamamamamamamamamamamammamamamamamam', salt);
    
    const newAdmin = new User({
      username: 'baris',
      password: hashedPassword,
      isAdmin: true
    });
    
    await newAdmin.save();
    
    return NextResponse.json({
      success: true,
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      user: {
        id: newAdmin._id,
        username: newAdmin.username,
        isAdmin: newAdmin.isAdmin
      }
    });
  } catch (error) {
    console.error('Hata:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}