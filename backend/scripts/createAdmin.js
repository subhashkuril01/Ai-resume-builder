#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Use environment variables or prompts for sensitive data
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

// Password should be prompted or from environment, NOT logged
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error('❌ Error: ADMIN_PASSWORD not set in environment variables');
  console.log('Set ADMIN_PASSWORD in .env file or environment before running this script');
  process.exit(1);
}

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cvision_final', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log(`⚠️  Admin user with email ${ADMIN_EMAIL} already exists!`);
        console.log(`Email: ${existingAdmin.email}`);
        console.log(`Role: ${existingAdmin.role}`);
        process.exit(0);
      } else {
        // Promote existing user to admin
        existingAdmin.role = 'admin';
        existingAdmin.status = 'active';
        await existingAdmin.save();
        console.log(`✅ Promoted existing user to admin!`);
        console.log(`Email: ${existingAdmin.email}`);
        console.log(`Role: ${existingAdmin.role}`);
        process.exit(0);
      }
    }

    // Create new admin user
    const adminUser = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      status: 'active'
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Email:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Name:  ${adminUser.name}`);
    console.log(`Role:  ${adminUser.role}`);
    console.log(`Status: ${adminUser.status}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔐 Login with the credentials you set in .env');
    console.log('⚠️  Never share your password or commit it to git');
    console.log('🌐 Access admin panel at: /admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
