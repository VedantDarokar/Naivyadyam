const mongoose = require('mongoose');
const dns = require('dns');

const seedAdminUser = async () => {
  try {
    const User = require('../models/User');
    const adminExists = await User.findOne({ email: 'admin@naivadyam.com' });
    if (!adminExists) {
      await User.create({
        name: 'Naivadyam Admin',
        email: 'admin@naivadyam.com',
        password: 'adminpassword123',
        role: 'admin',
        phone: '8149471804',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=7B1A1A&color=F5C518&bold=true',
        isEmailVerified: true,
        isPhoneVerified: true
      });
      console.log('✅ Default Admin account created: admin@naivadyam.com / adminpassword123');
    }
  } catch (err) {
    console.warn('Admin seed warning:', err.message);
  }
};

const seedDefaultProducts = async () => {
  try {
    const Product = require('../models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      const defaultProducts = [
        {
          title: 'Instant Idli Premix',
          slug: 'instant-idli-premix',
          sku: 'NV-IDLI-500',
          description: 'Authentic South Indian Idli Premix made from stone-ground rice and urad dal. Just add water, ferment for 30 minutes, and steam for fluffy, soft idlis.',
          price: 99,
          compareAtPrice: 130,
          category: 'Instant Premix',
          subcategory: 'South Indian Premix',
          brand: 'Naivadyam',
          images: ['/product-idli.jpg'],
          stock: 150,
          weight: '500g',
          isFeatured: true,
          isDealOfDay: true,
          discountPercentage: 24,
          ratings: { average: 4.8, count: 324 }
        },
        {
          title: 'Instant Medu Wada Premix',
          slug: 'instant-medu-wada-premix',
          sku: 'NV-WADA-400',
          description: 'Crispy, golden Medu Wadas in just 15 minutes! Made from premium urad dal with traditional spices.',
          price: 89,
          compareAtPrice: 115,
          category: 'Instant Premix',
          subcategory: 'South Indian Premix',
          brand: 'Naivadyam',
          images: ['/product-meduwada.jpg'],
          stock: 120,
          weight: '400g',
          isFeatured: true,
          isDealOfDay: false,
          discountPercentage: 22,
          ratings: { average: 4.7, count: 198 }
        },
        {
          title: 'Instant Dhokla Premix',
          slug: 'instant-dhokla-premix',
          sku: 'NV-DHOKLA-400',
          description: 'Fluffy, spongy Gujarati Dhokla in under 20 minutes! Made with chickpea batter and spices.',
          price: 79,
          compareAtPrice: 105,
          category: 'Instant Premix',
          subcategory: 'Gujarati Premix',
          brand: 'Naivadyam',
          images: ['/product-dhokla.jpg'],
          stock: 180,
          weight: '400g',
          isFeatured: true,
          isDealOfDay: true,
          discountPercentage: 24,
          ratings: { average: 4.9, count: 412 }
        },
        {
          title: 'Instant Bhajani Chakli Premix',
          slug: 'instant-bhajani-chakli-premix',
          sku: 'NV-CHAKLI-500',
          description: 'Traditional Maharashtrian Bhajani Chakli Premix! Crispy, crunchy, and savory snack made from roasted grains and authentic spices.',
          price: 120,
          compareAtPrice: 150,
          category: 'Instant Premix',
          subcategory: 'Snack Premix',
          brand: 'Naivadyam',
          images: ['/product-chakli.jpg'],
          stock: 200,
          weight: '500g',
          isFeatured: true,
          isDealOfDay: false,
          discountPercentage: 20,
          ratings: { average: 4.9, count: 530 }
        }
      ];
      await Product.insertMany(defaultProducts);
      console.log('✅ Default Naivadyam products auto-seeded into MongoDB');
    }
  } catch (err) {
    console.warn('Product seed warning:', err.message);
  }
};

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/naivadyam';
  
  // Fix Node.js DNS SRV lookup (querySrv ECONNREFUSED) on Windows / local network routers
  if (MONGO_URI.startsWith('mongodb+srv://')) {
    try {
      dns.setDefaultResultOrder('ipv4first');
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    } catch (e) {
      console.warn('Could not set custom DNS servers:', e.message);
    }
  }

  mongoose.set('strictQuery', false);

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    await seedAdminUser();
    await seedDefaultProducts();
  } catch (error) {
    console.warn(`MongoDB Atlas connection failed (${error.message}). Attempting MongoMemoryServer connection...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`MongoMemoryServer Connected: ${conn.connection.host}`);
      await seedAdminUser();
      await seedDefaultProducts();
    } catch (memError) {
      console.error('In-Memory MongoDB server setup error:', memError.message);
    }
  }
};

module.exports = { connectDB };
