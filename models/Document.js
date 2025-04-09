// models/Document.js (Mongoose için)
import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lütfen döküman adı girin'],
    trim: true,
  },
  filename: {
    type: String,
    required: [true, 'Lütfen dosya adı girin'],
  },

  companyId: {
    type: String,
    default: 'general',
    trim: true
  },
  size: String,
  uploadDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
