import React from "react";
import { Link } from "react-router-dom";
import {
  Video,
  Shield,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Video,
      title: "Real-time Monitoring",
      description:
        "Advanced AI-powered video analysis with live detection of focus and behavior patterns.",
    },
    {
      icon: Shield,
      title: "Object Detection",
      description:
        "Automatically identify unauthorized items like phones, books, and electronic devices.",
    },
    {
      icon: TrendingUp,
      title: "Integrity Scoring",
      description:
        "Comprehensive scoring system that provides detailed integrity assessment for each session.",
    },
    {
      icon: Users,
      title: "Multi-role Support",
      description:
        "Complete platform supporting administrators, interviewers, and candidates with role-based access.",
    },
  ];

  const benefits = [
    "Real-time AI-powered monitoring",
    "Comprehensive reporting with PDF exports",
    "Multi-device object detection",
    "Focus and attention tracking",
    "Secure video recording and storage",
    "Detailed analytics and insights",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 h-full w-full" aria-hidden="true">
          <div className="relative h-full">
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary-50"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                <Video className="h-12 w-12 text-primary-600" />
                <h1 className="text-4xl font-bold text-gray-900">ProctorAI</h1>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
              AI-Powered Video
              <span className="block text-primary-600">Proctoring System</span>
            </h2>

            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Secure your online interviews with advanced focus detection,
              object recognition, and comprehensive integrity monitoring powered
              by cutting-edge AI technology.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row sm:justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Advanced AI Detection Capabilities
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Our platform leverages state-of-the-art machine learning models to
              ensure interview integrity and provide comprehensive monitoring.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Why Choose ProctorAI?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Our comprehensive solution provides everything you need for
                secure, reliable, and insightful interview monitoring.
              </p>

              <ul className="mt-8 space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-12 lg:mt-0">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">
                  Ready to Get Started?
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Create Your Account</p>
                      <p className="text-primary-100 text-sm">
                        Sign up as an interviewer or candidate
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Schedule Interviews</p>
                      <p className="text-primary-100 text-sm">
                        Set up your interview sessions with AI monitoring
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Monitor & Analyze</p>
                      <p className="text-primary-100 text-sm">
                        Get real-time insights and detailed reports
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-primary-500">
                  <p className="text-sm text-primary-100">
                    Join thousands of organizations using ProctorAI for secure
                    interview monitoring.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Video className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-bold">ProctorAI</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Advanced AI-powered video proctoring system ensuring interview
                integrity with real-time monitoring and comprehensive analytics.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    to="/features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/security"
                    className="hover:text-white transition-colors"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    to="/integrations"
                    className="hover:text-white transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    to="/docs"
                    className="hover:text-white transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/status"
                    className="hover:text-white transition-colors"
                  >
                    System Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 ProctorAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
