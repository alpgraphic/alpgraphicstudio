import dbConnect from "@/lib/db";
import Company from "@/models/Company";

// Sıralama güncelleme (drag-drop sonrası)
export async function POST(req) {
  try {
    const { companies } = await req.json();

    await dbConnect();

    const bulkOps = companies.map(company => ({
      updateOne: {
        filter: { _id: company._id },
        update: { $set: { order: company.order } }
      }
    }));

    await Company.bulkWrite(bulkOps);

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: error.message });
  }
}

// Firma silme
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