import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import mongoose from 'mongoose';

export async function GET(request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    let query = {};
    if (companyId) {
      query.companyId = companyId;
    }
    
    const documents = await Document.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const { name, companyId, filename, size } = body;
    
    // CompanyId geçerliliğini kontrol et
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return NextResponse.json({
        success: false,
        message: 'Geçersiz firma ID formatı'
      }, { status: 400 });
    }
    
    const document = await Document.create({
      name,
      companyId,
      filename,
      size,
      uploadDate: new Date()
    });
    
    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error('Doküman oluşturma hatası:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedDocument) {
      return NextResponse.json(
        { success: false, message: 'Doküman bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedDocument });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID parametresi gereklidir' },
        { status: 400 }
      );
    }
    
    const deletedDocument = await Document.findByIdAndDelete(id);
    
    if (!deletedDocument) {
      return NextResponse.json(
        { success: false, message: 'Doküman bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Doküman başarıyla silindi',
      data: deletedDocument
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}