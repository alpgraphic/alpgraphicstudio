import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Company from '@/models/Company';

export async function GET() {
  await dbConnect();
  try {
    const companies = await Company.find({}).sort({ order: 1 });
    return NextResponse.json({ success: true, data: companies });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    console.log('Alınan veri:', body);
    
    const { name, logo, cover, category = 'Genel', year = new Date().getFullYear().toString(), pdfUrl = '', order } = body;
    
    // Eğer order değeri belirtilmemişse, en yüksek order değerini bulup +1 ekle
    let newOrder = order;
    if (newOrder === undefined) {
      // En yüksek order değerini bul
      const lastCompany = await Company.findOne().sort({ order: -1 });
      newOrder = lastCompany ? lastCompany.order + 1 : 0;
    }
    
    // Veri modeline uygun şekilde dökümanı oluştur
    const company = await Company.create({ 
      name, 
      logo, 
      cover, 
      category, 
      year, 
      pdfUrl,
      order: newOrder
    });
    
    return NextResponse.json({ success: true, data: company }, { status: 201 });
  } catch (error) {
    console.error('HATA DETAYI:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedCompany) {
      return NextResponse.json(
        { success: false, message: 'Firma bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedCompany });
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
    
    const deletedCompany = await Company.findByIdAndDelete(id);
    
    if (!deletedCompany) {
      return NextResponse.json(
        { success: false, message: 'Firma bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firma başarıyla silindi',
      data: deletedCompany
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}