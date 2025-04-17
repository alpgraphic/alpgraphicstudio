import dbConnect from "@/lib/db";
import { Types } from "mongoose";
import Company from "@/models/Company";

export async function GET() {
  try {
    await dbConnect();
    const companies = await Company.find({}).sort({ order: 1 });
    return Response.json({ success: true, data: companies });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: error.message });
  }
}

// Sıralama güncelleme (drag-drop sonrası)
export async function POST(req) {
  try {
    const { companies } = await req.json();
    console.log("Gelen veriler:", companies);
    
    await dbConnect();
    
    const bulkOps = companies.map(company => {
      const objectId = company._id?.$oid || company._id;
      return {
        updateOne: {
          filter: { _id: new Types.ObjectId(objectId) },
          update: { $set: { order: company.order } }
        }
      };
    });
    console.log("Yazılacak bulkOps:", JSON.stringify(bulkOps, null, 2));

    const result = await Company.bulkWrite(bulkOps);
    console.log("Güncelleme sonucu:", result);
    
    return Response.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: error.message });
  }
}

// Firma silme (mevcut kodunuz)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return Response.json({ success: false, message: "ID gerekli" }, { status: 400 });
    }
    
    await dbConnect();
    await Company.findByIdAndDelete(id);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: error.message });
  }
}