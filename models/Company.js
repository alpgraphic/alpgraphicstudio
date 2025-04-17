import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lütfen firma adı girin'],
    trim: true,
  },
  logo: {
    type: String,
    required: [true, 'Lütfen logo yolu girin'],
  },
  cover: {
    type: String,
    default: ''
  },
  // Opsiyonel alanlar
  category: {
    type: String,
    default: 'Genel'
  },
  year: {
    type: String,
    default: new Date().getFullYear().toString()
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);