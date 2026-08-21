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
  } catch (error) {
    console.warn(`MongoDB Atlas connection failed (${error.message}). Attempting MongoMemoryServer connection...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`MongoMemoryServer Connected: ${conn.connection.host}`);
      await seedAdminUser();
    } catch (memError) {
      console.error('In-Memory MongoDB server setup error:', memError.message);
    }
  }
};


module.exports = { connectDB };
