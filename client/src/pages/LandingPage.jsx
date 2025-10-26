/**
 * LandingPage Component
 * Public landing page with sign-in options
 * Modern UI with Clerk-inspired design system
 */

import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import {
  FileText,
  Users,
  Calendar,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Check,
  Sparkles,
  Play,
  Star,
  Quote,
  Clock,
  Gift,
  AlertCircle,
  TrendingUp,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useState } from "react";
import launchConfig from "../config/launchConfig";
import { WaitlistForm } from "../components/WaitlistForm";
import { CountdownTimer } from "../components/CountdownTimer";
import { WaitlistProgress } from "../components/WaitlistProgress";
import { trackCTAClick, trackVideoPlay } from "../utils/analytics";

const LandingPage = () => {
  const { isSignedIn, isLoaded } = useUser();

  // Redirect to dashboard if already signed in
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
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
                Ocura360
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="hidden sm:block text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Pricing
              </button>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <Button className="shadow-sm hover:shadow transition-shadow">
                  Sign In / Sign Up
                </Button>
              </SignInButton>
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
              India's First ABDM-Native
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Clinic Management Suite
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Create prescriptions in 30 seconds. Built for solo practitioners. ABDM-integrated. Starting at just ₹999/month.
            </p>

            {/* Launch Status Badge */}
            {launchConfig.isPreLaunch && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-300 rounded-full mb-6">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">
                  Launching Soon • Join {launchConfig.waitlist.current}+ doctors on waitlist
                </span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              {launchConfig.isLaunched ? (
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <Button
                    size="lg"
                    className="shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
                    onClick={() => trackCTAClick('Start Free Trial', 'Hero')}
                  >
                    {launchConfig.cta.primaryText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </SignUpButton>
              ) : (
                <button
                  onClick={() => {
                    trackCTAClick('Join Waitlist', 'Hero');
                    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all"
                >
                  {launchConfig.cta.primaryText}
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => {
                  trackVideoPlay('Promo Video');
                  document.getElementById('promo-video')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Early Adopter Offer */}
            {launchConfig.isPreLaunch && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-lg mb-8">
                <Gift className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-bold text-orange-900">
                  Early Birds Get {launchConfig.earlyAdopter.label} 🎉
                </span>
              </div>
            )}

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

      {/* Promo Video Section */}
      <section id="promo-video" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            See Ocura360 in Action
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch how Ocura360 transforms healthcare management for modern clinics
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/20 border border-gray-200">
            <div className="aspect-video bg-gray-100">
              {/* YouTube Embed - Replace VIDEO_ID with your actual video ID */}
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Ocura360 Promo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          
          {/* Optional: Add a note below the video */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Quick 2-minute overview of Ocura360's key features
          </p>
        </div>
      </section>

      {/* Waitlist Section - Pre-Launch Only */}
      {launchConfig.isPreLaunch && (
        <section id="waitlist" className="bg-gradient-to-br from-blue-50 to-blue-100 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Join the Revolution in Healthcare Management
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Be among the first to experience Ocura360. Early adopters get {launchConfig.earlyAdopter.label}.
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="mb-12">
              <p className="text-center text-lg font-semibold text-gray-700 mb-6">
                Launching in:
              </p>
              <CountdownTimer />
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Waitlist Form */}
              <WaitlistForm />
              
              {/* Waitlist Progress & Benefits */}
              <div className="space-y-6">
                <WaitlistProgress />
                
                {/* Early Bird Benefits */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Gift className="w-6 h-6 text-blue-600" />
                    Early Bird Benefits
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>50% off first year</strong> - Save ₹6,000 to ₹15,000
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Priority onboarding</strong> - Skip the queue
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Free data migration</strong> - We'll help you move
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Direct founder access</strong> - Shape the product
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Lifetime VIP support</strong> - Always priority
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Problem-Agitate-Solve Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          {/* The Problem */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-900 mb-4">The Problem</h3>
            <ul className="space-y-3 text-red-800">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>3+ hours daily wasted on paperwork</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>Manual prescriptions lead to errors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>No drug interaction checking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>Patient records scattered everywhere</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>Expensive EMRs built for hospitals</span>
              </li>
            </ul>
          </div>

          {/* The Cost */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-8">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-orange-900 mb-4">The Cost</h3>
            <ul className="space-y-3 text-orange-800">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>₹5L+ lost annually</strong> to inefficiencies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>42%</strong> of doctors report prescription errors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>45 min average</strong> patient wait time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Losing patients to better-organized clinics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Missing ABDM compliance deadline</span>
              </li>
            </ul>
          </div>

          {/* The Solution */}
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-900 mb-4">The Solution</h3>
            <ul className="space-y-3 text-green-800">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>30-second prescriptions</strong> with DDI checks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>5-minute setup</strong> vs weeks for others</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>₹999/month</strong> vs ₹5000+ competitors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>ABDM-native</strong> from day one</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Built for solo practitioners</strong> & small clinics</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-lg text-gray-600">
              From signup to your first prescription in under 5 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  Quick Setup
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Create account → Add clinic details → You're ready to go
                </p>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <span className="text-blue-700 font-semibold">⏱️ 5 minutes</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  Add Patients
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Import existing records or add new patients with ABHA linking
                </p>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <span className="text-purple-700 font-semibold">📋 Unlimited patients</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  Create Prescriptions
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Select medications → Auto DDI check → Generate PDF instantly
                </p>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <span className="text-green-700 font-semibold">⚡ 30 seconds</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Win Timeline */}
          <div className="mt-16 bg-white rounded-2xl border-2 border-blue-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              See Results From Day One
            </h3>
            <div className="grid sm:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-blue-600">Day 1</span>
                </div>
                <p className="text-sm text-gray-700">Setup complete</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-blue-600">Day 2</span>
                </div>
                <p className="text-sm text-gray-700">First prescription</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-blue-600">Day 3</span>
                </div>
                <p className="text-sm text-gray-700">ABHA linked</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-green-600">Week 1</span>
                </div>
                <p className="text-sm text-gray-700">Save 2+ hours</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-green-600">Month 1</span>
                </div>
                <p className="text-sm text-gray-700">Fully paperless</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
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

      {/* Pricing Section */}
      <section
        id="pricing"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gray-50"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that's right for your practice
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            name="Starter"
            price="₹999"
            period="per month"
            description="Perfect for individual practitioners"
            features={[
              "Up to 50 patients",
              "Basic prescription management",
              "Appointment scheduling",
              "Email support",
              "ABDM integration",
            ]}
            popular={false}
          />
          <PricingCard
            name="Professional"
            price="₹2,499"
            period="per month"
            description="For growing clinics and practices"
            features={[
              "Unlimited patients",
              "Advanced prescription features",
              "Multi-doctor support",
              "DDI checking",
              "Priority support",
              "Custom branding",
              "Analytics dashboard",
            ]}
            popular={true}
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            period="contact us"
            description="For hospitals and large practices"
            features={[
              "Everything in Professional",
              "Multi-location support",
              "Custom integrations",
              "Dedicated account manager",
              "SLA guarantee",
              "Training & onboarding",
            ]}
            popular={false}
          />
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Detailed Feature Comparison
          </h2>
          <p className="text-lg text-gray-600">
            Compare plans side-by-side to find the perfect fit for your practice
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                  Features
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200">
                  <div className="mb-1">Starter</div>
                  <div className="text-2xl font-bold text-blue-600">₹999</div>
                  <div className="text-xs font-normal text-gray-500">per month</div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 bg-blue-50">
                  <div className="mb-1">Professional</div>
                  <div className="text-2xl font-bold text-blue-600">₹2,499</div>
                  <div className="text-xs font-normal text-gray-500">per month</div>
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                      Most Popular
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  <div className="mb-1">Enterprise</div>
                  <div className="text-2xl font-bold text-blue-600">Custom</div>
                  <div className="text-xs font-normal text-gray-500">contact us</div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <FeatureRow
                category="Core Features"
                starter="✓"
                professional="✓"
                enterprise="✓"
                isCategory
              />
              <FeatureRow
                feature="Number of Clinics"
                starter="1"
                professional="3"
                enterprise="Unlimited"
              />
              <FeatureRow
                feature="Patient Records"
                starter="Unlimited"
                professional="Unlimited"
                enterprise="Unlimited"
              />
              <FeatureRow
                feature="Appointments per Month"
                starter="100"
                professional="Unlimited"
                enterprise="Unlimited"
              />
              <FeatureRow
                feature="Prescriptions"
                starter="Unlimited"
                professional="Unlimited"
                enterprise="Unlimited"
              />
              <FeatureRow
                feature="Drug Interaction Checks"
                starter="✓"
                professional="✓"
                enterprise="✓"
              />
              <FeatureRow
                feature="PDF Generation"
                starter="✓"
                professional="✓"
                enterprise="✓"
              />
              
              <FeatureRow
                category="ABDM Integration"
                starter="—"
                professional="—"
                enterprise="—"
                isCategory
              />
              <FeatureRow
                feature="ABHA Integration"
                starter="✓"
                professional="✓"
                enterprise="✓"
              />
              <FeatureRow
                feature="Digital Health Records"
                starter="✓"
                professional="✓"
                enterprise="✓"
              />
              <FeatureRow
                feature="HFR Mapping"
                starter="—"
                professional="✓"
                enterprise="✓"
              />
              
              <FeatureRow
                category="Team & Collaboration"
                starter="—"
                professional="—"
                enterprise="—"
                isCategory
              />
              <FeatureRow
                feature="Staff Accounts"
                starter="2"
                professional="10"
                enterprise="Unlimited"
              />
              <FeatureRow
                feature="Role-Based Access"
                starter="✓"
                professional="✓"
                enterprise="✓"
              />
              <FeatureRow
                feature="Multi-Location Support"
                starter="—"
                professional="—"
                enterprise="✓"
              />
              
              <FeatureRow
                category="Advanced Features"
                starter="—"
                professional="—"
                enterprise="—"
                isCategory
              />
              <FeatureRow
                feature="Custom Branding"
                starter="—"
                professional="✓"
                enterprise="✓"
              />
              <FeatureRow
                feature="Analytics Dashboard"
                starter="Basic"
                professional="Advanced"
                enterprise="Advanced"
              />
              <FeatureRow
                feature="API Access"
                starter="—"
                professional="—"
                enterprise="✓"
              />
              <FeatureRow
                feature="Custom Integrations"
                starter="—"
                professional="—"
                enterprise="✓"
              />
              <FeatureRow
                feature="White Label"
                starter="—"
                professional="—"
                enterprise="✓"
              />
              
              <FeatureRow
                category="Support & Training"
                starter="—"
                professional="—"
                enterprise="—"
                isCategory
              />
              <FeatureRow
                feature="Email Support"
                starter="✓"
                professional="✓"
                enterprise="✓"
              />
              <FeatureRow
                feature="Priority Support"
                starter="—"
                professional="✓"
                enterprise="✓"
              />
              <FeatureRow
                feature="Phone Support"
                starter="—"
                professional="✓"
                enterprise="✓"
              />
              <FeatureRow
                feature="Dedicated Account Manager"
                starter="—"
                professional="—"
                enterprise="✓"
              />
              <FeatureRow
                feature="Training & Onboarding"
                starter="—"
                professional="—"
                enterprise="✓"
              />
              <FeatureRow
                feature="SLA Guarantee"
                starter="—"
                professional="—"
                enterprise="✓"
              />
            </tbody>
          </table>
        </div>

        {/* Mobile Accordion View */}
        <div className="lg:hidden space-y-4">
          <MobileFeatureCard
            plan="Starter"
            price="₹999/month"
            features={[
              { label: "Number of Clinics", value: "1" },
              { label: "Appointments per Month", value: "100" },
              { label: "Patient Records", value: "Unlimited" },
              { label: "Staff Accounts", value: "2" },
              { label: "Drug Interaction Checks", value: "✓" },
              { label: "ABHA Integration", value: "✓" },
              { label: "Analytics Dashboard", value: "Basic" },
              { label: "Email Support", value: "✓" },
              { label: "HFR Mapping", value: "—" },
              { label: "Custom Branding", value: "—" },
              { label: "Priority Support", value: "—" },
            ]}
          />
          <MobileFeatureCard
            plan="Professional"
            price="₹2,499/month"
            popular={true}
            features={[
              { label: "Number of Clinics", value: "3" },
              { label: "Appointments per Month", value: "Unlimited" },
              { label: "Patient Records", value: "Unlimited" },
              { label: "Staff Accounts", value: "10" },
              { label: "Drug Interaction Checks", value: "✓" },
              { label: "ABHA Integration", value: "✓" },
              { label: "HFR Mapping", value: "✓" },
              { label: "Analytics Dashboard", value: "Advanced" },
              { label: "Custom Branding", value: "✓" },
              { label: "Email Support", value: "✓" },
              { label: "Priority Support", value: "✓" },
              { label: "Phone Support", value: "✓" },
            ]}
          />
          <MobileFeatureCard
            plan="Enterprise"
            price="Custom Pricing"
            features={[
              { label: "Number of Clinics", value: "Unlimited" },
              { label: "Appointments per Month", value: "Unlimited" },
              { label: "Patient Records", value: "Unlimited" },
              { label: "Staff Accounts", value: "Unlimited" },
              { label: "Multi-Location Support", value: "✓" },
              { label: "All Professional Features", value: "✓" },
              { label: "API Access", value: "✓" },
              { label: "Custom Integrations", value: "✓" },
              { label: "White Label", value: "✓" },
              { label: "Dedicated Account Manager", value: "✓" },
              { label: "Training & Onboarding", value: "✓" },
              { label: "SLA Guarantee", value: "✓" },
            ]}
          />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Trusted by Healthcare Professionals
          </h2>
          <p className="text-lg text-gray-600">
            See what doctors are saying about Ocura360
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <TestimonialCard
            quote="Ocura360 has transformed how I manage my practice. The prescription system is intuitive and the DDI checking gives me peace of mind."
            author="Dr. Priya Sharma"
            role="General Physician, Mumbai"
            rating={5}
          />
          <TestimonialCard
            quote="The ABDM integration is seamless. My patients love being able to access their records digitally. Highly recommend for any modern practice."
            author="Dr. Rajesh Kumar"
            role="Cardiologist, Delhi"
            rating={5}
          />
          <TestimonialCard
            quote="Best EMR solution I've used. Clean interface, powerful features, and excellent support. It's made my clinic operations so much more efficient."
            author="Dr. Anjali Patel"
            role="Pediatrician, Bangalore"
            rating={5}
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
                Join hundreds of doctors already using Ocura360 to deliver
                better patient care
              </p>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="shadow-xl hover:shadow-2xl transition-shadow bg-white hover:bg-gray-50"
                >
                  Get Started Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-lg">Ocura360</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                India's first ABDM-native clinic management suite built for solo practitioners and small clinics.
              </p>
              {launchConfig.isPreLaunch && (
                <div className="text-sm text-blue-400 font-medium">
                  🚀 Launching Soon
                </div>
              )}
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById('promo-video')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-white transition-colors"
                  >
                    Demo
                  </button>
                </li>
                {launchConfig.isPreLaunch && (
                  <li>
                    <button
                      onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                      className="hover:text-white transition-colors text-blue-400"
                    >
                      Join Waitlist
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    ABDM Compliance
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm">
                {launchConfig.contact.email && (
                  <li className="flex items-start gap-2">
                    <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <a
                      href={`mailto:${launchConfig.contact.email}`}
                      className="hover:text-white transition-colors"
                    >
                      {launchConfig.contact.email}
                    </a>
                  </li>
                )}
                {launchConfig.contact.phone && (
                  <li className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <a
                      href={`tel:${launchConfig.contact.phone}`}
                      className="hover:text-white transition-colors"
                    >
                      {launchConfig.contact.phone}
                    </a>
                  </li>
                )}
                {launchConfig.contact.whatsapp && (
                  <li className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <a
                      href={launchConfig.contact.whatsappLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      WhatsApp Support
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                &copy; 2025 Ocura360. All rights reserved.
              </p>
              
              {/* Trust Badges */}
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-full">
                  <Shield className="w-3 h-3 text-green-500" />
                  HIPAA Compliant
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-full">
                  <Shield className="w-3 h-3 text-blue-500" />
                  ABDM Integrated
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-full">
                  <Shield className="w-3 h-3 text-purple-500" />
                  Secure & Private
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function FeatureCard({ icon: Icon, iconColor, title, description }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
    green: "bg-green-50 border-green-100 text-green-600",
    red: "bg-red-50 border-red-100 text-red-600",
    yellow: "bg-amber-50 border-amber-100 text-amber-600",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200/60 p-6 hover:border-gray-300/60 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start gap-4">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl border flex-shrink-0 ${colorClasses[iconColor]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ name, price, period, description, features, popular }) {
  return (
    <div
      className={`relative bg-white rounded-2xl border-2 p-8 ${popular ? "border-blue-600 shadow-xl" : "border-gray-200"}`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          {period && <span className="text-gray-600">/ {period}</span>}
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        <Button
          className={`w-full ${popular ? "" : "variant-outline"}`}
          variant={popular ? "primary" : "outline"}
        >
          Get Started
        </Button>
      </SignUpButton>
    </div>
  );
}

function TestimonialCard({ quote, author, role, rating }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      <Quote className="w-10 h-10 text-blue-600 mb-4 opacity-20" />

      <p className="text-gray-700 mb-6 leading-relaxed">"{quote}"</p>

      <div className="border-t border-gray-200 pt-4">
        <p className="font-semibold text-gray-900">{author}</p>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
  );
}

// Feature comparison row component for desktop table
function FeatureRow({ category, feature, starter, professional, enterprise, isCategory }) {
  if (isCategory) {
    return (
      <tr className="bg-gray-50">
        <td colSpan="4" className="px-6 py-3 text-sm font-semibold text-gray-900">
          {category}
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
        {feature}
      </td>
      <td className="px-6 py-4 text-sm text-center text-gray-700 border-r border-gray-200">
        {starter === "✓" ? (
          <Check className="w-5 h-5 text-green-600 mx-auto" />
        ) : starter === "—" ? (
          <span className="text-gray-400">—</span>
        ) : (
          starter
        )}
      </td>
      <td className="px-6 py-4 text-sm text-center text-gray-700 border-r border-gray-200 bg-blue-50/30">
        {professional === "✓" ? (
          <Check className="w-5 h-5 text-green-600 mx-auto" />
        ) : professional === "—" ? (
          <span className="text-gray-400">—</span>
        ) : (
          professional
        )}
      </td>
      <td className="px-6 py-4 text-sm text-center text-gray-700">
        {enterprise === "✓" ? (
          <Check className="w-5 h-5 text-green-600 mx-auto" />
        ) : enterprise === "—" ? (
          <span className="text-gray-400">—</span>
        ) : (
          enterprise
        )}
      </td>
    </tr>
  );
}

// Mobile feature card component
function MobileFeatureCard({ plan, price, features, popular }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`bg-white rounded-xl border-2 overflow-hidden ${
        popular ? "border-blue-600 shadow-lg" : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`p-6 cursor-pointer ${popular ? "bg-blue-50" : "bg-gray-50"}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{plan}</h3>
            <p className="text-lg font-semibold text-blue-600">{price}</p>
            {popular && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                Most Popular
              </span>
            )}
          </div>
          <button className="text-gray-600">
            {isExpanded ? (
              <span className="text-2xl">−</span>
            ) : (
              <span className="text-2xl">+</span>
            )}
          </button>
        </div>
      </div>

      {/* Features List */}
      {isExpanded && (
        <div className="p-6 space-y-3 border-t border-gray-200">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{feature.label}</span>
              <span className="text-sm font-medium text-gray-900">
                {feature.value === "✓" ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : feature.value === "—" ? (
                  <span className="text-gray-400">—</span>
                ) : (
                  feature.value
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LandingPage;
