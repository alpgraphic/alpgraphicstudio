import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/connectDB';
import Image from '@/models/Image';

// GET → Görselleri Listeleme
export async function GET() {
  try {
    await connectDB();
    const images = await Image.find({}).sort({ createdAt: -1 });
    return NextResponse.json(images);
  } catch (error) {
    console.error('GET hatası:', error);
    return NextResponse.json(
      { error: 'Görsel verileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST → Yeni Görsel Ekleme
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    const newImage = new Image({
      name: data.name || null,
      url: data.url
    });

    await newImage.save();
    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error('POST hatası:', error);
    return NextResponse.json(
      { error: 'Görsel eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE → Görsel Silme
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Silmek için görsel ID'si gereklidir" },
        { status: 400 }
      );
    }

    const deletedImage = await Image.findByIdAndDelete(id);
    
    if (!deletedImage) {
      return NextResponse.json(
        { error: 'Görsel bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Görsel başarıyla silindi' });
  } catch (error) {
    console.error('DELETE hatası:', error);
    return NextResponse.json(
      { error: 'Görsel silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}