const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB initialization script for Node.js using Mongoose
// This script initializes the MongoDB database with collections, indexes, and sample data

// Load environment variables
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  console.error('Please set your MongoDB Atlas connection string in your .env file');
  process.exit(1);
}

// Define schemas
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['candidate', 'interviewer', 'admin']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const interviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 5,
    max: 180
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  integrityScore: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

const detectionLogSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    enum: [
      'focus_lost',
      'face_absent',
      'multiple_faces',
      'phone_detected',
      'book_detected',
      'device_detected',
      'drowsiness_detected',
      'audio_violation'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  }
}, {
  timestamps: true
});

// Create models
const User = mongoose.model('User', userSchema);
const Interview = mongoose.model('Interview', interviewSchema);
const DetectionLog = mongoose.model('DetectionLog', detectionLogSchema);

async function initializeDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Create indexes for better performance
    console.log('Creating indexes...');
    
    // Users indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });

    // Interviews indexes
    await Interview.collection.createIndex({ candidate: 1, scheduledAt: -1 });
    await Interview.collection.createIndex({ interviewer: 1, status: 1 });
    await Interview.collection.createIndex({ scheduledAt: 1, status: 1 });

    // Detection logs indexes
    await DetectionLog.collection.createIndex({ interview: 1, timestamp: -1 });
    await DetectionLog.collection.createIndex({ type: 1, severity: 1 });
    await DetectionLog.collection.createIndex({ timestamp: -1 });

    console.log('Indexes created successfully');

    // Insert sample data
    console.log('Inserting sample data...');
    
    // Hash passwords
    const adminHashedPassword = await bcrypt.hash('Admin@123', 12);
    const testHashedPassword = await bcrypt.hash('Test@123', 12);

    // Check if sample users already exist and update/create them
    const adminUser = await User.findOne({ email: 'admin@proctoring.com' });
    const interviewerUser = await User.findOne({ email: 'interviewer@test.com' });
    const candidateUser = await User.findOne({ email: 'candidate@test.com' });

    // Create or update admin user
    if (!adminUser) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@proctoring.com',
        password: adminHashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created');
    } else {
      adminUser.password = adminHashedPassword;
      await adminUser.save();
      console.log('Admin user password updated');
    }

    // Create or update interviewer user
    if (!interviewerUser) {
      await User.create({
        name: 'Test Interviewer',
        email: 'interviewer@test.com',
        password: testHashedPassword,
        role: 'interviewer',
        isActive: true
      });
      console.log('Interviewer user created');
    } else {
      interviewerUser.password = testHashedPassword;
      await interviewerUser.save();
      console.log('Interviewer user password updated');
    }

    // Create or update candidate user
    if (!candidateUser) {
      await User.create({
        name: 'Test Candidate',
        email: 'candidate@test.com',
        password: testHashedPassword,
        role: 'candidate',
        isActive: true
      });
      console.log('Candidate user created');
    } else {
      candidateUser.password = testHashedPassword;
      await candidateUser.save();
      console.log('Candidate user password updated');
    }

    console.log('Sample users processed successfully');
    console.log('Default login credentials:');
    console.log('Admin: admin@proctoring.com / Admin@123');
    console.log('Interviewer: interviewer@test.com / Test@123');
    console.log('Candidate: candidate@test.com / Test@123');

    console.log('Database initialized successfully with collections, indexes, and sample data');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run the initialization
if (require.main === module) {
  initializeDatabase().catch(console.error);
}

module.exports = { initializeDatabase };