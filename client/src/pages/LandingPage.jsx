/**
 * LandingPage Component
 * Public landing page with sign-in options
 * Modern UI with Clerk-inspired design system
 */

import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router';
import { FileText, Users, Calendar, Shield, Zap, Globe, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

const LandingPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  
  // Redirect to dashboard if already signed in
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                ProDigital Doctor
              </span>
            </div>
            <div className="flex gap-3">
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="shadow-sm hover:shadow transition-shadow">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200/60 rounded-full shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Modern Healthcare Management Platform
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              EMR & Prescription
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Management Simplified
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Streamline your medical practice with intelligent prescription management,
              real-time drug interaction checks, and seamless ABDM integration.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <SignUpButton mode="modal">
                <Button size="lg" className="shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" size="lg" className="border-gray-300 hover:border-gray-400 shadow-sm">
                  Doctor Sign In
                </Button>
              </SignInButton>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>ABDM Integrated</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
      </section>
      
      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Everything you need to manage patient care
          </h2>
          <p className="text-lg text-gray-600">
            Powerful features designed for modern medical practices
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={Users}
            iconColor="blue"
            title="Patient Management"
            description="Comprehensive patient profiles with demographics, visit history, and ABHA integration."
          />
          <FeatureCard
            icon={FileText}
            iconColor="purple"
            title="Smart Prescriptions"
            description="Create prescriptions with automatic drug interaction checks and PDF generation."
          />
          <FeatureCard
            icon={Calendar}
            iconColor="green"
            title="Appointment Scheduling"
            description="Efficient appointment management with calendar views and reminders."
          />
          <FeatureCard
            icon={Shield}
            iconColor="red"
            title="DDI Warnings"
            description="Real-time drug-drug interaction checking to ensure patient safety."
          />
          <FeatureCard
            icon={Zap}
            iconColor="yellow"
            title="Fast & Efficient"
            description="Optimized workflows designed for busy clinical environments."
          />
          <FeatureCard
            icon={Globe}
            iconColor="indigo"
            title="ABDM Ready"
            description="Full integration with Ayushman Bharat Digital Mission."
          />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-3xl border border-blue-500/20 shadow-2xl overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            
            <div className="relative max-w-4xl mx-auto text-center px-6 py-16">
              <h2 className="text-4xl font-bold mb-4 text-white tracking-tight">
                Ready to modernize your practice?
              </h2>
              <p className="text-xl mb-10 text-blue-100 leading-relaxed">
                Join hundreds of doctors already using ProDigital Doctor to deliver better patient care
              </p>
              <SignUpButton mode="modal">
                <Button size="lg" variant="secondary" className="shadow-xl hover:shadow-2xl transition-shadow bg-white hover:bg-gray-50">
                  Get Started Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <p className="text-gray-300 font-medium">
              &copy; 2025 ProDigital Doctor. All rights reserved.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-green-500" />
                HIPAA Compliant
              </span>
              <span className="text-gray-700">•</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-500" />
                Secure
              </span>
              <span className="text-gray-700">•</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-500" />
                Private
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function FeatureCard({ icon: Icon, iconColor, title, description }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    red: 'bg-red-50 border-red-100 text-red-600',
    yellow: 'bg-amber-50 border-amber-100 text-amber-600',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200/60 p-6 hover:border-gray-300/60 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl border flex-shrink-0 ${colorClasses[iconColor]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
