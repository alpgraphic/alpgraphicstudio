import { NextResponse } from 'next/server';
import connectDB from '@/utils/connectDB';  // senin mongoose connect dosyan burada
import Image from '@/models/Image';         // senin Image modelin burada

// GET → Listeleme
export async function GET() {
  await connectDB();

  const images = await Image.find();
  return NextResponse.json(images);
}

// DELETE → Silme
export async function DELETE(request: Request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID bulunamadı' }, { status: 400 });
  }

  await Image.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Silindi' });
}