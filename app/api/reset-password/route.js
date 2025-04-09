// app/api/reset-password/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    // URL'den kullanıcı adı ve yeni şifreyi al
    const url = new URL(request.url);
    const username = url.searchParams.get('username') || 'baris';
    const newPassword = url.searchParams.get('password') || '123456';
    
    // Veritabanına bağlan
    await dbConnect();
    
    // Kullanıcıyı bul
    const user = await User.findOne({ username });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: `${username} kullanıcısı bulunamadı`
      }, { status: 404 });
    }
    
    // Şifreyi hashle ve güncelle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: `${username} kullanıcısının şifresi başarıyla '${newPassword}' olarak değiştirildi`,
      user: {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}