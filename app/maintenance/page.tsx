'use client';

import { useState, useEffect } from 'react';
import { Wrench, Clock, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Animated Icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-full">
              <Wrench className="w-16 h-16 text-white animate-bounce" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            We&apos;re Upgrading!
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Our platform is currently undergoing scheduled maintenance to bring you new features and improvements.
          </p>

          {/* Estimated Time */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Estimated Downtime</h2>
            </div>
            <p className="text-2xl font-bold text-blue-600">15-30 minutes</p>
            <p className="text-sm text-gray-500 mt-2">
              We appreciate your patience
            </p>
          </div>

          {/* Current Time Display */}
          <div className="text-sm text-gray-400 mb-6">
            Current time: {currentTime.toLocaleTimeString()}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5" />
            Check Again
          </button>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need immediate assistance?{' '}
              <a 
                href="mailto:support@yourapp.com" 
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Thank you for being part of The Xperience! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}

