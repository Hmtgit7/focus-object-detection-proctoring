# 🎥 ProctorAI - Focus & Object Detection Video Proctoring System

A comprehensive AI-powered video proctoring system built with **Node.js**, **React**, and **TensorFlow.js** that provides real-time focus and object detection for secure online interviews.

![ProctorAI Demo](https://via.placeholder.com/800x400/2563eb/ffffff?text=ProctorAI+Dashboard)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.2.0-blue)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/docker-supported-blue)](https://www.docker.com/)

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

## 🏗️ System Architecture


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
