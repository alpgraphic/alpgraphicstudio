// Bu script ilk admin kullanıcısını oluşturmak için kullanılır

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB bağlantı URI'si
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI ortam değişkeni tanımlanmamış!');
  process.exit(1);
}

// Kullanıcı şeması
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Kullanıcı modeli
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Admin kullanıcı oluşturma fonksiyonu
async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB\'ye bağlandı');

    // Kullanıcı adı ve şifre buradan değiştirilebilir
    const adminUsername = 'admin';
    const adminPassword = 'admin123'; // Güvenli bir şifre kullanın!

    // Admin kullanıcısı zaten var mı kontrol et
    const existingAdmin = await User.findOne({ username: adminUsername });
    
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut.');
      await mongoose.disconnect();
      return;
    }

    // Şifreyi hashleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Yeni admin kullanıcısı oluştur
    const adminUser = new User({
      username: adminUsername,
      password: hashedPassword,
      isAdmin: true,
    });

    await adminUser.save();
    console.log('Admin kullanıcısı başarıyla oluşturuldu!');
    console.log(`Kullanıcı adı: ${adminUsername}`);
    console.log(`Şifre: ${adminPassword}`);
    console.log('Bu şifreyi güvenli bir yerde saklayın ve değiştirmeyi unutmayın!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
createAdminUser();