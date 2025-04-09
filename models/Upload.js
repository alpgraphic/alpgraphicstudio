// models/Upload.js
import mongoose from 'mongoose';

const UploadSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: [true, 'Dosya adı gereklidir'],
  },
  fileUrl: {
    type: String,
    required: [true, 'Dosya URL gereklidir'],
  },
  companyId: {
    type: String,
    required: [true, 'Firma ID gereklidir'],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.Upload || mongoose.model('Upload', UploadSchema);