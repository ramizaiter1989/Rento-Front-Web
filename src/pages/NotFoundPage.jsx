import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-7xl font-extrabold text-teal-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        Page Not Found
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
        >
          Go Home
        </Link>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
