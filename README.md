# 🎥 ProctorAI - Focus & Object Detection Video Proctoring System

A comprehensive AI-powered video proctoring system built with **Node.js**, **React**, and **TensorFlow.js** that provides real-time focus and object detection for secure online interviews.

![ProctorAI Dashboard](https://via.placeholder.com/800x400/2563eb/ffffff?text=ProctorAI+Dashboard+Preview)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.2.0-blue)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/docker-supported-blue)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-supported-green)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/deployed%20on-vercel-black)](https://focus-object-detection-proctoring.vercel.app/dashboard)
[![Live Demo](https://img.shields.io/badge/live%20demo-available-green)](https://focus-object-detection-proctoring.vercel.app/dashboard)

## 🚀 Live Demo

**Try the application now!** The ProctorAI system is currently deployed and accessible at:

- **🌐 Live Application**: [https://focus-object-detection-proctoring.vercel.app/dashboard](https://focus-object-detection-proctoring.vercel.app/dashboard)
- **📁 Source Code**: [https://github.com/Hmtgit7/focus-object-detection-proctoring](https://github.com/Hmtgit7/focus-object-detection-proctoring)

### What You Can Do in the Live Demo:

- **👤 User Registration & Login**: Create accounts for different user roles
- **📅 Interview Management**: Schedule and manage interviews
- **🎥 Real-time Proctoring**: Experience AI-powered detection features
- **📊 Report Generation**: View detailed integrity reports
- **📱 Responsive Design**: Test on different device sizes

> **Note**: The live demo uses a demo database, so data may be reset periodically.

## 📋 Table of Contents

- [🚀 Live Demo](#-live-demo)
- [🌟 Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🔧 Development](#-development)
- [🐳 Docker Deployment](#-docker-deployment)
- [📱 API Documentation](#-api-documentation)
- [🖼️ Screenshots & Images](#️-screenshots--images)
- [🔒 Security](#-security)
- [📊 Monitoring & Logging](#-monitoring--logging)
- [🚨 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 Features

### 🔍 **Advanced AI Detection**

- **Real-time Face Detection** using MediaPipe
- **Focus Monitoring** with eye gaze tracking
- **Object Detection** for phones, books, and unauthorized devices
- **Multiple Person Detection** in video frame
- **Drowsiness Detection** with eye closure analysis
- **Audio Monitoring** for background voices

### 📊 **Comprehensive Reporting**

- **Detailed PDF Reports** with integrity scoring
- **CSV Data Export** for analysis
- **Real-time Detection Logs** with timestamps
- **Violation Timeline** and statistics
- **Integrity Score Calculation** (0-100 scale)

### 🎬 **Video Management**

- **HD Video Recording** with multiple format support
- **Real-time Video Streaming** with WebRTC
- **Automatic Upload** and storage
- **Video Playback** and review capabilities

### 👥 **User Management**

- **Multi-role System** (Admin, Interviewer, Candidate)
- **Secure Authentication** with JWT tokens
- **User Dashboard** with interview scheduling
- **Interview History** and analytics

### 🔒 **Security & Privacy**

- **End-to-end Encryption** for video streams
- **Secure File Storage** with access controls
- **GDPR Compliant** data handling
- **Audit Trail** for all actions

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** >= 5.0
- **Docker** & **Docker Compose** (for containerized deployment)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/Hmtgit7/focus-object-detection-proctoring.git
cd focus-object-detection-proctoring
```

### 2. Environment Setup

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit configuration files
nano backend/.env
nano frontend/.env
```

### 3. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 4. Start MongoDB

```bash
# Using Docker (recommended)
docker run -d --name proctoring-mongo -p 27017:27017 mongo:latest

# Or using local MongoDB installation
mongod --dbpath /path/to/your/db
```

### 5. Run the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm start
```

### 6. Access the Application

- **Live Demo**: [https://focus-object-detection-proctoring.vercel.app/dashboard](https://focus-object-detection-proctoring.vercel.app/dashboard)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

## 📦 Installation

### Manual Installation

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
nano .env
```

**Required Environment Variables:**

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/proctoring_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# File Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=100MB

# ML Models
MODEL_PATH=./models
TENSORFLOW_MODEL_URL=https://tfhub.dev/google/tfjs-model/mobilenet_v2/1

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
nano .env
```

**Required Environment Variables:**

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# ML Models
REACT_APP_MODEL_BASE_URL=/models
REACT_APP_TENSORFLOW_MODEL_URL=https://tfhub.dev/google/tfjs-model/mobilenet_v2/1

# MediaPipe Configuration
REACT_APP_MEDIAPIPE_MODEL_URL=https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh

# Feature Flags
REACT_APP_ENABLE_AUDIO_DETECTION=true
REACT_APP_ENABLE_OBJECT_DETECTION=true
REACT_APP_ENABLE_FACE_DETECTION=true
```

### Docker Installation

```bash
# Clone repository
git clone https://github.com/Hmtgit7/focus-object-detection-proctoring.git
cd focus-object-detection-proctoring

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure environment variables
nano backend/.env
nano frontend/.env

# Build and start services
docker-compose up -d

# Check service status
docker-compose ps
```

## ⚙️ Configuration

### Database Configuration

The application uses MongoDB for data storage. Configure the connection in `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/proctoring_db
```

### ML Model Configuration

#### TensorFlow.js Models

Place TensorFlow.js models in `frontend/public/models/`:

```
frontend/public/models/
├── coco-ssd/
│   ├── model.json
│   └── weights.bin
├── mobilenet/
│   ├── model.json
│   └── weights.bin
└── face-detection/
    ├── model.json
    └── weights.bin
```

#### MediaPipe Models

MediaPipe models are loaded from CDN by default. To use local models:

1. Download models from [MediaPipe GitHub](https://github.com/google/mediapipe)
2. Place in `frontend/public/models/mediapipe/`
3. Update `REACT_APP_MEDIAPIPE_MODEL_URL` in frontend `.env`

### File Storage Configuration

Configure file storage paths in `backend/.env`:

```env
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=100MB
ALLOWED_VIDEO_TYPES=mp4,webm,avi,mov
ALLOWED_AUDIO_TYPES=mp3,wav,ogg,m4a
```

## 🏗️ System Architecture

```
focus-object-detection-proctoring/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js ✓
│   │   │   ├── interviewController.js ✓
│   │   │   └── reportController.js
│   │   ├── models/
│   │   │   ├── User.js ✓
│   │   │   ├── Interview.js ✓
│   │   │   └── DetectionLog.js ✓
│   │   ├── routes/
│   │   │   ├── auth.js ✓
│   │   │   ├── interviews.js ✓
│   │   │   └── reports.js
│   │   ├── middleware/
│   │   │   ├── auth.js ✓
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js ✓
│   │   ├── services/
│   │   │   ├── socketService.js ✓
│   │   │   ├── mlService.js
│   │   │   └── reportService.js ✓
│   │   ├── utils/
│   │   │   ├── database.js
│   │   │   ├── fileStorage.js
│   │   │   └── constants.js
│   │   ├── config/
│   │   │   └── database.js ✓
│   │   └── app.js ✓
│   ├── uploads/
│   ├── models/
│   ├── scripts/
│   │   └── mongo-init.js
│   ├── package.json ✓
│   ├── Dockerfile ✓
│   ├── healthcheck.js
│   └── server.js ✓
├── frontend/
│   ├── public/
│   │   ├── models/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Interview/
│   │   │   │   ├── VideoStream.jsx ✓
│   │   │   │   ├── DetectionPanel.jsx
│   │   │   │   ├── InterviewControls.jsx
│   │   │   │   └── AlertsPanel.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── InterviewList.jsx
│   │   │   │   └── ReportViewer.jsx
│   │   │   ├── Common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   └── Layout.jsx
│   │   │   └── Auth/
│   │   │       ├── Login.jsx
│   │   │       └── Register.jsx
│   │   ├── hooks/
│   │   │   ├── useMediaPipe.js ✓
│   │   │   ├── useSocket.js
│   │   │   ├── useVideoRecording.js ✓
│   │   │   ├── useObjectDetection.js ✓
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── socketService.js
│   │   │   └── mlService.js
│   │   ├── utils/
│   │   │   ├── detectionHelpers.js
│   │   │   ├── videoUtils.js
│   │   │   └── constants.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── InterviewContext.jsx
│   │   ├── pages/
│   │   │   ├── Interview.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Home.jsx
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json ✓
│   ├── Dockerfile ✓
│   ├── nginx.conf
│   └── tailwind.config.js
├── nginx/
│   ├── nginx.conf
│   └── ssl/
├── docker-compose.yml ✓
├── .env.example
├── README.md
└── deploy.sh
```

## 🔧 Development

### Development Scripts

#### Backend Scripts

```bash
cd backend

# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run database seed
npm run seed

# Run tests
npm test
```

#### Frontend Scripts

```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Analyze bundle size
npm run analyze
```

### Code Structure

#### Backend Structure

- **Controllers**: Handle HTTP requests and responses
- **Models**: Define MongoDB schemas and data validation
- **Routes**: Define API endpoints and middleware
- **Services**: Business logic and external service integration
- **Middleware**: Authentication, validation, and error handling
- **Utils**: Helper functions and constants

#### Frontend Structure

- **Components**: Reusable UI components organized by feature
- **Pages**: Top-level page components for routing
- **Hooks**: Custom React hooks for state management and side effects
- **Services**: API communication and external service integration
- **Contexts**: React context providers for global state
- **Utils**: Helper functions and constants

### API Development

#### Adding New Endpoints

1. **Create Route**: Add route in `backend/src/routes/`
2. **Create Controller**: Add controller method in `backend/src/controllers/`
3. **Add Validation**: Create validation middleware in `backend/src/middleware/validation.js`
4. **Update Frontend**: Add API call in `frontend/src/services/api.js`

#### Example: Adding User Profile Endpoint

```javascript
// backend/src/routes/user.js
router.get('/profile', auth, getUserProfile);

// backend/src/controllers/userController.js
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

## 🐳 Docker Deployment

### Docker Compose Configuration

The application includes a complete Docker Compose setup:

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: proctoring-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  backend:
    build: ./backend
    container_name: proctoring-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/proctoring_db
    depends_on:
      - mongodb
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    container_name: proctoring-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Deployment Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild services
docker-compose up -d --build

# Scale services
docker-compose up -d --scale backend=3
```

### Production Deployment

#### Vercel Deployment (Current)

The application is currently deployed on Vercel:

- **Live Demo**: [https://focus-object-detection-proctoring.vercel.app/dashboard](https://focus-object-detection-proctoring.vercel.app/dashboard)
- **Repository**: [https://github.com/Hmtgit7/focus-object-detection-proctoring](https://github.com/Hmtgit7/focus-object-detection-proctoring)

**Deploy to Vercel:**

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment Variables**: Set up all required environment variables in Vercel dashboard
3. **Deploy**: Automatic deployment on every push to main branch

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Deploy to production
vercel --prod
```

#### Docker Deployment

For Docker-based deployment, use the provided deployment script:

```bash
# Make script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh production deploy

# Other deployment commands
./deploy.sh production start    # Start services
./deploy.sh production stop     # Stop services
./deploy.sh production logs     # View logs
./deploy.sh production backup   # Create backup
```

## 📱 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "interviewer"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "interviewer"
  }
}
```

#### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### GET /api/auth/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Interview Endpoints

#### GET /api/interviews
Get all interviews for the current user.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (scheduled, ongoing, completed)
- `date`: Filter by date (YYYY-MM-DD)

#### POST /api/interviews
Create a new interview.

**Request Body:**
```json
{
  "title": "Software Engineer Interview",
  "description": "Technical interview for senior position",
  "scheduledDate": "2024-01-15T10:00:00Z",
  "duration": 60,
  "candidateEmail": "candidate@example.com",
  "settings": {
    "enableFaceDetection": true,
    "enableObjectDetection": true,
    "enableAudioDetection": true,
    "maxViolations": 5
  }
}
```

#### GET /api/interviews/:id
Get interview details.

#### PUT /api/interviews/:id
Update interview.

#### DELETE /api/interviews/:id
Delete interview.

### Detection Endpoints

#### GET /api/detections/:interviewId
Get detection logs for an interview.

**Query Parameters:**
- `type`: Filter by detection type (face, object, audio, focus)
- `startDate`: Start date filter
- `endDate`: End date filter

#### POST /api/detections
Create detection log entry.

**Request Body:**
```json
{
  "interviewId": "interview-id",
  "type": "face_detection",
  "confidence": 0.95,
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "faceCount": 1,
    "facePositions": [{"x": 100, "y": 100, "width": 200, "height": 200}]
  }
}
```

### Report Endpoints

#### GET /api/reports
Get all reports.

#### GET /api/reports/:id
Get report details.

#### POST /api/reports/generate
Generate report for an interview.

**Request Body:**
```json
{
  "interviewId": "interview-id",
  "format": "pdf",
  "includeVideo": true,
  "includeAudio": false
}
```

#### GET /api/reports/:id/download
Download report file.

### WebSocket Events

#### Client Events

```javascript
// Join interview room
socket.emit('join-interview', { interviewId: 'interview-id' });

// Send detection data
socket.emit('detection-data', {
  type: 'face_detection',
  data: detectionData
});

// Send video stream
socket.emit('video-stream', videoData);
```

#### Server Events

```javascript
// Listen for detection alerts
socket.on('detection-alert', (data) => {
  console.log('Detection alert:', data);
});

// Listen for interview updates
socket.on('interview-update', (data) => {
  console.log('Interview updated:', data);
});

// Listen for system notifications
socket.on('system-notification', (data) => {
  console.log('System notification:', data);
});
```

## 🖼️ Screenshots & Images

### Image Placement Instructions

To add screenshots and images to this README, place them in the following locations and update the markdown accordingly:

#### 1. Main Dashboard Screenshot
**Location**: Replace the placeholder in line 5
**File**: `docs/images/dashboard-main.png`
**Dimensions**: 800x400px
**Description**: Main dashboard showing interview list, statistics, and recent activity

```markdown
![ProctorAI Dashboard](docs/images/dashboard-main.png)
```

#### 2. Interview Interface Screenshot
**Location**: Add after the Features section
**File**: `docs/images/interview-interface.png`
**Dimensions**: 800x500px
**Description**: Live interview interface with video stream and detection panels

```markdown
![Interview Interface](docs/images/interview-interface.png)
```

#### 3. Detection Panel Screenshot
**Location**: Add in the Features section under AI Detection
**File**: `docs/images/detection-panel.png`
**Dimensions**: 600x400px
**Description**: Real-time detection panel showing face, object, and audio detection

```markdown
![Detection Panel](docs/images/detection-panel.png)
```

#### 4. Report Generation Screenshot
**Location**: Add in the Features section under Reporting
**File**: `docs/images/report-generation.png`
**Dimensions**: 800x600px
**Description**: PDF report generation interface with integrity scoring

```markdown
![Report Generation](docs/images/report-generation.png)
```

#### 5. User Management Screenshot
**Location**: Add in the Features section under User Management
**File**: `docs/images/user-management.png`
**Dimensions**: 800x500px
**Description**: User dashboard with role management and interview scheduling

```markdown
![User Management](docs/images/user-management.png)
```

#### 6. Mobile Responsive Screenshot
**Location**: Add after the main screenshots
**File**: `docs/images/mobile-responsive.png`
**Dimensions**: 400x600px
**Description**: Mobile-responsive interface showing interview controls

```markdown
![Mobile Interface](docs/images/mobile-responsive.png)
```

#### 7. Architecture Diagram
**Location**: Add in the System Architecture section
**File**: `docs/images/architecture-diagram.png`
**Dimensions**: 1000x600px
**Description**: System architecture diagram showing components and data flow

```markdown
![System Architecture](docs/images/architecture-diagram.png)
```

#### 8. API Documentation Screenshot
**Location**: Add in the API Documentation section
**File**: `docs/images/api-documentation.png`
**Dimensions**: 800x500px
**Description**: Interactive API documentation interface

```markdown
![API Documentation](docs/images/api-documentation.png)
```

### Image Requirements

- **Format**: PNG or JPG
- **Quality**: High resolution, clear and professional
- **Style**: Consistent design language
- **Content**: Show actual application screens, not mockups
- **Accessibility**: Include alt text for all images

### Creating Screenshots

1. **Start the application** in development mode
2. **Navigate to each section** and take screenshots
3. **Use consistent browser settings** (same zoom level, window size)
4. **Include realistic data** in screenshots
5. **Crop and resize** images to specified dimensions
6. **Save in docs/images/** directory

### Image Optimization

```bash
# Install image optimization tools
npm install -g imagemin-cli imagemin-pngquant imagemin-mozjpeg

# Optimize images
imagemin docs/images/*.png --out-dir=docs/images/optimized --plugin=pngquant
imagemin docs/images/*.jpg --out-dir=docs/images/optimized --plugin=mozjpeg
```

## 🔒 Security

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Admin, Interviewer, Candidate roles
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Secure session handling

### Data Protection

- **Encryption**: AES-256 encryption for sensitive data
- **HTTPS**: SSL/TLS encryption for all communications
- **File Security**: Secure file upload and storage
- **Database Security**: MongoDB with authentication

### Privacy Compliance

- **GDPR Compliance**: Data protection and user rights
- **Data Retention**: Configurable data retention policies
- **User Consent**: Explicit consent for data collection
- **Data Anonymization**: Option to anonymize user data

### Security Headers

```javascript
// Security middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"]
    }
  }
}));
```

## 📊 Monitoring & Logging

### Application Monitoring

- **Health Checks**: Automated health monitoring
- **Performance Metrics**: Response time and throughput
- **Error Tracking**: Comprehensive error logging
- **Resource Usage**: CPU, memory, and disk usage

### Logging Configuration

```javascript
// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### Monitoring Endpoints

- **Health Check**: `GET /api/health`
- **Metrics**: `GET /api/metrics`
- **System Info**: `GET /api/system/info`

## 🚨 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB
**Solution**:
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check connection string
echo $MONGODB_URI
```

#### 2. ML Model Loading Issues

**Problem**: TensorFlow.js models not loading
**Solution**:
```bash
# Clear browser cache
# Check model files exist
ls -la frontend/public/models/

# Verify model URLs in environment
grep MODEL_URL frontend/.env
```

#### 3. WebSocket Connection Issues

**Problem**: Real-time features not working
**Solution**:
```bash
# Check Socket.IO configuration
grep SOCKET_URL frontend/.env

# Verify CORS settings
grep CORS backend/.env

# Check firewall settings
sudo ufw status
```

#### 4. File Upload Issues

**Problem**: File uploads failing
**Solution**:
```bash
# Check upload directory permissions
ls -la backend/uploads/

# Verify file size limits
grep MAX_FILE_SIZE backend/.env

# Check disk space
df -h
```

#### 5. Performance Issues

**Problem**: Slow application performance
**Solution**:
```bash
# Check system resources
htop

# Monitor database performance
mongostat

# Check application logs
tail -f backend/logs/combined.log
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Backend debug mode
DEBUG=* npm run dev

# Frontend debug mode
REACT_APP_DEBUG=true npm start
```

### Log Analysis

```bash
# View recent errors
tail -f backend/logs/error.log

# Search for specific errors
grep "ERROR" backend/logs/combined.log

# Monitor real-time logs
docker-compose logs -f backend
```

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Clone your fork**
3. **Create a feature branch**
4. **Make your changes**
5. **Add tests**
6. **Submit a pull request**

### Code Standards

- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Cypress**: E2E testing

### Commit Guidelines

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### Pull Request Process

1. **Update documentation**
2. **Add tests for new features**
3. **Ensure all tests pass**
4. **Update version numbers**
5. **Request review from maintainers**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ No liability
- ❌ No warranty

---

## 📞 Support

- **Live Demo**: [https://focus-object-detection-proctoring.vercel.app/dashboard](https://focus-object-detection-proctoring.vercel.app/dashboard)
- **Repository**: [https://github.com/Hmtgit7/focus-object-detection-proctoring](https://github.com/Hmtgit7/focus-object-detection-proctoring)
- **Issues**: [GitHub Issues](https://github.com/Hmtgit7/focus-object-detection-proctoring/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Hmtgit7/focus-object-detection-proctoring/discussions)

## 🙏 Acknowledgments

- **TensorFlow.js** for ML model support
- **MediaPipe** for face detection
- **React** for frontend framework
- **Node.js** for backend runtime
- **MongoDB** for database
- **Docker** for containerization

---

**Made with ❤️ by the ProctorAI Team**
