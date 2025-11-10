"use client";

import Link from "next/link";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white/60 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="text-xl font-bold">
              <span className="text-blue-600">Ocura</span>
              <span className="text-gray-900">360</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 font-medium text-sm">Blog</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="https://ocura360.com"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore Ocura360
            </a>
            <a
              href="https://ocura360.com/#pricing"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pricing
            </a>
            <a
              href="https://ocura360.com/#promo-video"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch Demo
            </a>
            <a
              href="https://ocura360.com/login"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-lg shadow-blue-600/30"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col space-y-3">
              <a
                href="https://ocura360.com"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm py-2"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore Ocura360
              </a>
              <a
                href="https://ocura360.com/#pricing"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm py-2"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="https://ocura360.com/#promo-video"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm py-2"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Watch Demo
              </a>
              <a
                href="https://ocura360.com/login"
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-lg shadow-blue-600/30 text-center"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
