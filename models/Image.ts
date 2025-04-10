import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
  },
  { timestamps: true }
);

const Image = mongoose.models.Image || mongoose.model('Image', ImageSchema);
export default Image;