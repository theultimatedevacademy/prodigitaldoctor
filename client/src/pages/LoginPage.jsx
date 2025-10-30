/**
 * Login Page for Testers
 * Provides access to the application for early adopters and testers
 */

import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, TestTube, Users, Shield } from "lucide-react";
import logo from "../assets/logo.svg";

function LoginPage() {
  const [mode, setMode] = useState("signin"); // 'signin' or 'signup'

  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back<span className="hidden sm:inline"> to Home</span></span>
            </Link>
            <div className="flex items-center gap-2">
              <img src={logo} alt="Ocura360" className="h-8 w-auto" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Side - Information */}
          <div className="space-y-8">
            {/* Beta Tester Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-full">
              <TestTube className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-bold text-orange-900">
                Beta Testing Access
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Welcome, Early Adopter! 🎉
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Thank you for being part of our exclusive beta testing program.
                Your feedback will help shape the future of Ocura360.
              </p>
            </div>

            {/* What You Get */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 p-4 sm:p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                As a Beta Tester, You Get:
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Early Access</p>
                    <p className="text-sm text-gray-600">
                      Be the first to try new features before public launch
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      50% Lifetime Discount
                    </p>
                    <p className="text-sm text-gray-600">
                      Lock in 50% off forever as a thank you for your support
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Direct Founder Access
                    </p>
                    <p className="text-sm text-gray-600">
                      Your feedback directly influences product development
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Priority Support
                    </p>
                    <p className="text-sm text-gray-600">
                      Dedicated support channel for beta testers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">
                    Important Notes:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • This is a testing environment - some features may be
                      incomplete
                    </li>
                    <li>
                      • Your data is safe but may be reset during testing phases
                    </li>
                    <li>• Please report any bugs or issues you encounter</li>
                    <li>• Your feedback is invaluable to us!</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="text-sm text-gray-600">
              <p>
                <strong>Need help?</strong> Contact us at{" "}
                <a
                  href="mailto:beta@ocura360.com"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  beta@ocura360.com
                </a>
              </p>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-4 sm:p-6 md:p-8">
              {/* Toggle Buttons */}
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setMode("signin")}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    mode === "signin"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    mode === "signup"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Clerk Auth Components */}
              <div className="flex justify-center overflow-hidden">
                {mode === "signin" ? (
                  <SignIn
                    routing="path"
                    path="/login"
                    signUpUrl="/login"
                    afterSignInUrl="/dashboard"
                    appearance={{
                      elements: {
                        rootBox: "w-full max-w-full",
                        card: "shadow-none",
                        formButtonPrimary: "text-sm sm:text-base",
                        formFieldInput: "text-sm sm:text-base",
                      },
                    }}
                  />
                ) : (
                  <SignUp
                    routing="path"
                    path="/login"
                    signInUrl="/login"
                    afterSignUpUrl="/dashboard"
                    appearance={{
                      elements: {
                        rootBox: "w-full max-w-full",
                        card: "shadow-none",
                        formButtonPrimary: "text-sm sm:text-base",
                        formFieldInput: "text-sm sm:text-base",
                      },
                    }}
                  />
                )}
              </div>
            </div>

            {/* Beta Tester Count */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  <strong className="text-gray-900">50+</strong> beta testers
                  already testing
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
