import mongoose from 'mongoose';

const PortfolioUserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
});

const PortfolioUser = mongoose.models.PortfolioUser || mongoose.model('PortfolioUser', PortfolioUserSchema);

export default PortfolioUser;