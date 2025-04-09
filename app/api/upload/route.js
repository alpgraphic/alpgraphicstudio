import { NextResponse } from 'next/server'; 
import { writeFile, mkdir } from 'fs/promises'; 
import path from 'path'; 
import { randomUUID } from 'crypto'; 
import dbConnect from '@/lib/db'; 
import Document from '@/models/Document';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const companyId = formData.get('companyId') || 'general';
    const documentName = formData.get('name') || file.name;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Dosya yüklenmedi" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dosya adı oluştur (unique olması için)
    const fileName = `${randomUUID()}_${file.name}`;
    const filePath = path.join(process.cwd(), 'public', 'projects', companyId, fileName);

    // Dosya dizini oluştur (yoksa)
    const dirPath = path.join(process.cwd(), 'public', 'projects', companyId);
    await mkdir(dirPath, { recursive: true });

    // Dosyayı yaz
    await writeFile(filePath, buffer);

    // Dosya yolunu oluştur
    const fileUrl = `/projects/${companyId}/${fileName}`;

    // Dosya boyutunu MB olarak hesapla
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    // Veritabanına bağlan
    await dbConnect();

    // Document oluştur
    const document = await Document.create({
      name: documentName,
      filename: fileUrl,
      companyId: companyId, // String olarak kullan
      size: fileSizeMB,
      uploadDate: new Date()
    });

    return NextResponse.json({
      success: true,
      fileUrl,
      document
    });

  } catch (error) {
    console.error('Yükleme hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Dosya yüklenemedi: " + error.message 
      },
      { status: 500 }
    );
  }
}