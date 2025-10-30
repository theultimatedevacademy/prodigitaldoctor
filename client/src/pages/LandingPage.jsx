/**
 * LandingPage Component
 * Public landing page with sign-in options
 * Modern UI with Clerk-inspired design system
 */

import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { Navigate, Link } from "react-router";
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
import launchConfig from "../config/launchConfig";
import { Menu, X } from "lucide-react";
import { WaitlistForm } from "../components/WaitlistForm";
import { CountdownTimer } from "../components/CountdownTimer";
import { WaitlistProgress } from "../components/WaitlistProgress";
import { trackCTAClick, trackVideoPlay } from "../utils/analytics";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { updateWaitlistCount } from "../config/launchConfig";
import logo from "../assets/logo.svg";
import logoDark from "../assets/logo-full-darkmode.svg";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const LandingPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(
    launchConfig.waitlist.current
  );

  useEffect(() => {
    // Reset scroll position when page loads
    window.scrollTo(0, 0);

    // Fetch live count on mount
    const loadCount = async () => {
      const data = await updateWaitlistCount();
      setWaitlistCount(data.count);
    };

    loadCount();
  }, []);

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={logo} alt="Ocura360" className="h-8 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("promo-video")}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Demo
              </button>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {launchConfig.isPreLaunch && (
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Beta Login
                </Link>
              )}
              {launchConfig.isLaunched ? (
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <Button className="shadow-sm hover:shadow transition-shadow">
                    {launchConfig.cta.primaryText}
                  </Button>
                </SignUpButton>
              ) : (
                <button
                  onClick={() => scrollToSection("waitlist")}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                >
                  {launchConfig.cta.primaryText}
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium rounded-lg transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium rounded-lg transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium rounded-lg transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("promo-video")}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium rounded-lg transition-colors"
              >
                Demo
              </button>
              <div className="pt-3 border-t border-gray-200 space-y-3">
                {launchConfig.isPreLaunch && (
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-3 text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
                  >
                    Beta Login
                  </Link>
                )}
                {launchConfig.isLaunched ? (
                  <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button size="lg" className="w-full">
                      {launchConfig.cta.primaryText}
                    </Button>
                  </SignUpButton>
                ) : (
                  <button
                    onClick={() => scrollToSection("waitlist")}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    {launchConfig.cta.primaryText}
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200/60 rounded-full shadow-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Modern Healthcare Management Platform
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight"
            >
              India's First ABDM-Native
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Clinic Management Suite
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto"
            >
              Create prescriptions in 30 seconds. Built for solo practitioners.
              ABDM-integrated. Starting at just ₹999/month.
            </motion.p>

            {/* Launch Status Badge */}
            {launchConfig.isPreLaunch && (
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-300 rounded-full mb-6"
              >
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">
                  Launching Soon • Join {launchConfig.waitlist.current}+ doctors
                  on waitlist
                </span>
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              {launchConfig.isLaunched ? (
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <Button
                    size="lg"
                    className="shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
                    onClick={() => trackCTAClick("Start Free Trial", "Hero")}
                  >
                    {launchConfig.cta.primaryText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </SignUpButton>
              ) : (
                <button
                  onClick={() => {
                    trackCTAClick("Join Waitlist", "Hero");
                    document
                      .getElementById("waitlist")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all"
                >
                  {launchConfig.cta.primaryText}
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => {
                  trackVideoPlay("Promo Video");
                  document
                    .getElementById("promo-video")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </motion.div>

            {/* Early Adopter Offer */}
            {launchConfig.isPreLaunch && (
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.7 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-full mb-6"
              >
                <Gift className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-bold text-orange-900">
                  Early Birds Get {launchConfig.earlyAdopter.label} 🎉
                </span>
              </motion.div>
            )}

            {/* Trust Indicators */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Government Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-medium">ABDM Integrated</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Data Protected</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Promo Video Section */}
      <section
        id="promo-video"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            See Ocura360 in Action
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch how Ocura360 transforms healthcare management for modern
            clinics
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/20 border border-gray-200">
            <div className="aspect-video bg-gray-100">
              {/* YouTube Embed - Replace VIDEO_ID with your actual video ID */}
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/QL9bwHw0nkQ?si=PO56eAtU1aNJnZMm"
                title="Ocura360 Promo Video"
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
        <section
          id="waitlist"
          className="bg-gradient-to-br from-blue-50 to-blue-100 py-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Join the Revolution in Healthcare Management
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Be among the first to experience Ocura360. Early adopters get{" "}
                {launchConfig.earlyAdopter.label}.
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
                        <strong>50% off first year</strong> - Save ₹6,000 to
                        ₹15,000
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
                        <strong>Free data migration</strong> - We'll help you
                        move
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Direct founder access</strong> - Shape the
                        product
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

      {/* Before vs After Comparison Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transform Your Practice
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See the difference Ocura360 makes in your daily workflow
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto"
          >
            {/* Without Ocura360 */}
            <motion.div variants={fadeInUp} className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full border-2 border-red-200">
                Current Struggle
              </div>
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-6">
                  {/* Pain Point 1 */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-600 mb-1">
                        3+ Hours
                      </div>
                      <p className="text-gray-700">
                        Wasted daily on manual paperwork and prescriptions
                      </p>
                    </div>
                  </div>

                  {/* Pain Point 2 */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600 mb-1">
                        ₹5L+
                      </div>
                      <p className="text-gray-700">
                        Lost annually due to inefficiencies and errors
                      </p>
                    </div>
                  </div>

                  {/* Pain Point 3 */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-600 mb-1">
                        42%
                      </div>
                      <p className="text-gray-700">
                        Error rate in manual prescriptions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* With Ocura360 */}
            <motion.div variants={fadeInUp} className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full border-2 border-green-200">
                With Ocura360
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border-2 border-blue-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="space-y-6">
                  {/* Solution 1 */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        30 Seconds
                      </div>
                      <p className="text-gray-800 font-medium">
                        Smart digital prescriptions with auto DDI checks
                      </p>
                    </div>
                  </div>

                  {/* Solution 2 */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        Save ₹5L+
                      </div>
                      <p className="text-gray-800 font-medium">
                        Automated workflows and zero errors
                      </p>
                    </div>
                  </div>

                  {/* Solution 3 */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        0% Errors
                      </div>
                      <p className="text-gray-800 font-medium">
                        Built-in safety checks and validations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mt-12"
          >
            <p className="text-lg text-gray-700 mb-4">
              <span className="font-bold text-blue-600">₹999/month</span> vs{" "}
              <span className="line-through text-gray-400">₹5000+</span>{" "}
              competitors
            </p>
            <p className="text-sm text-gray-600">
              Built specifically for Indian solo practitioners and small clinics
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 py-24">
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
                  <span className="text-blue-700 font-semibold">
                    ⏱️ 5 minutes
                  </span>
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
                  <span className="text-purple-700 font-semibold">
                    📋 Unlimited patients
                  </span>
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
                  <span className="text-green-700 font-semibold">
                    ⚡ 30 seconds
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Your First Hour Timeline */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-8 lg:p-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Your First Hour with Ocura360
            </h3>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
              From signup to fully operational in just 15 minutes
            </p>

            <div className="relative max-w-4xl mx-auto">
              {/* Progress Line */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 hidden lg:block"></div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 relative">
                {/* Minute 0-5 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg relative z-10">
                    <span className="font-bold text-blue-600 text-sm">
                      0-5m
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Sign Up</h4>
                  <p className="text-sm text-gray-600">
                    Create account & clinic setup
                  </p>
                </div>

                {/* Minute 5-10 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-white border-4 border-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg relative z-10">
                    <span className="font-bold text-purple-600 text-sm">
                      5-10m
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Add Patient</h4>
                  <p className="text-sm text-gray-600">
                    Your first patient profile
                  </p>
                </div>

                {/* Minute 10-11 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-white border-4 border-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg relative z-10">
                    <span className="font-bold text-green-600 text-sm">
                      10-11m
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Prescription</h4>
                  <p className="text-sm text-gray-600">Create in 30 seconds!</p>
                </div>

                {/* Minute 11-15 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-white border-4 border-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg relative z-10">
                    <span className="font-bold text-blue-600 text-sm">
                      11-15m
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Link ABHA</h4>
                  <p className="text-sm text-gray-600">Optional integration</p>
                </div>

                {/* Minute 15 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg relative z-10">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-green-600 mb-1">Fully Live!</h4>
                  <p className="text-sm text-gray-600">Ready for patients</p>
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-10 pt-8 border-t border-blue-200">
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    15 min
                  </div>
                  <p className="text-sm text-gray-600">Total setup time</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    30 sec
                  </div>
                  <p className="text-sm text-gray-600">Per prescription</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    0 training
                  </div>
                  <p className="text-sm text-gray-600">Intuitive interface</p>
                </div>
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
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Everything you need to manage patient care
          </h2>
          <p className="text-lg text-gray-600">
            Powerful features designed for modern medical practices
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
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
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gray-50"
      >
        {/* Early Bird Banner */}
        {launchConfig.isPreLaunch && (
          <div className="mb-12 mx-auto max-w-4xl">
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-1 shadow-2xl animate-pulse">
              <div className="bg-white rounded-xl p-6 sm:p-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-4">
                    <Gift className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-bold text-orange-900">
                      LIMITED TIME OFFER
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                    🎉 Early Bird Special: {launchConfig.earlyAdopter.label}
                  </h3>
                  <p className="text-lg text-gray-700 mb-4">
                    Join now and lock in{" "}
                    <span className="font-bold text-orange-600">
                      50% discount
                    </span>{" "}
                    for your first year!
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span>Offer ends at launch</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span>
                        {launchConfig.waitlist.current}+ doctors already joined
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that's right for your practice
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <PricingCard
            name="Starter"
            price="₹999"
            earlyBirdPrice="₹499"
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
            showEarlyBird={launchConfig.isPreLaunch}
          />
          <PricingCard
            name="Professional"
            price="₹2,499"
            earlyBirdPrice="₹1,249"
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
            showEarlyBird={launchConfig.isPreLaunch}
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            earlyBirdPrice={null}
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
            showEarlyBird={false}
          />
        </motion.div>
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
                  {launchConfig.isPreLaunch ? (
                    <>
                      <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        ₹499
                      </div>
                      <div className="text-sm text-gray-400 line-through">
                        ₹999
                      </div>
                      <div className="text-xs font-semibold text-orange-600 mt-1">
                        🎉 50% OFF FIRST YEAR
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-blue-600">
                        ₹999
                      </div>
                      <div className="text-xs font-normal text-gray-500">
                        per month
                      </div>
                    </>
                  )}
                </th>
                <th
                  className={`px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 ${launchConfig.isLaunched ? "bg-blue-50" : ""}`}
                >
                  <div className="mb-1">Professional</div>
                  {launchConfig.isPreLaunch ? (
                    <>
                      <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        ₹1,249
                      </div>
                      <div className="text-sm text-gray-400 line-through">
                        ₹2,499
                      </div>
                      <div className="text-xs font-semibold text-orange-600 mt-1">
                        🎉 50% OFF FIRST YEAR
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-blue-600">
                        ₹2,499
                      </div>
                      <div className="text-xs font-normal text-gray-500">
                        per month
                      </div>
                    </>
                  )}
                  {launchConfig.isLaunched && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  <div className="mb-1">Enterprise</div>
                  <div className="text-2xl font-bold text-blue-600">Custom</div>
                  <div className="text-xs font-normal text-gray-500">
                    contact us
                  </div>
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

      {/* Testimonials Section - Only show after launch */}
      {launchConfig.isLaunched && (
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
      )}

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
                {launchConfig.isPreLaunch
                  ? "Be among the first to experience the future of clinic management"
                  : "Join hundreds of doctors already using Ocura360 to deliver better patient care"}
              </p>
              {launchConfig.isPreLaunch ? (
                <Button
                  size="lg"
                  variant="secondary"
                  className="shadow-xl hover:shadow-2xl transition-shadow bg-white hover:bg-gray-50"
                  onClick={() => {
                    document
                      .getElementById("waitlist")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Join the Waitlist
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
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
              )}
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
                <img src={logoDark} alt="Ocura360" className="h-8 w-auto" />
              </div>
              <p className="text-sm text-gray-400 mb-4">
                India's first ABDM-native clinic management suite built for solo
                practitioners and small clinics.
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
                    onClick={() =>
                      document
                        .getElementById("features")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      document
                        .getElementById("pricing")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      document
                        .getElementById("promo-video")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="hover:text-white transition-colors"
                  >
                    Demo
                  </button>
                </li>
                {launchConfig.isPreLaunch && (
                  <li>
                    <button
                      onClick={() =>
                        document
                          .getElementById("waitlist")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
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
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-full">
                  <Shield className="w-3 h-3 text-blue-500" />
                  Government Approved
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-full">
                  <Shield className="w-3 h-3 text-green-500" />
                  ABDM Integrated
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-full">
                  <Shield className="w-3 h-3 text-purple-500" />
                  Data Protected
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
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-xl border border-gray-200/60 p-6 hover:border-gray-300/60 hover:shadow-lg transition-all duration-200"
    >
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
    </motion.div>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  popular,
  earlyBirdPrice,
  showEarlyBird,
}) {
  // Show popular badge and special border only after launch
  const showPopularBadge = popular && launchConfig.isLaunched;
  const borderClass = showPopularBadge
    ? "border-blue-600 shadow-xl"
    : "border-gray-200";

  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`relative bg-white rounded-2xl border-2 p-8 ${borderClass} transition-shadow hover:shadow-2xl`}
    >
      {showPopularBadge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      {/* Early Bird Badge - Centered */}
      {showEarlyBird && earlyBirdPrice && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg animate-pulse whitespace-nowrap">
            🎉 {launchConfig.earlyAdopter.label}
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>

        {/* Pricing Display */}
        {showEarlyBird && earlyBirdPrice ? (
          <div className="space-y-2">
            {/* Early Bird Price - Main Focus */}
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {earlyBirdPrice}
              </span>
              {period && (
                <span className="text-gray-600 font-medium">/ {period}</span>
              )}
            </div>
            {/* Original Price - Crossed Out */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-semibold text-gray-400 line-through">
                {price}
              </span>
              <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Save {launchConfig.earlyAdopter.discount}%
              </span>
            </div>
            <p className="text-xs text-orange-600 font-semibold mt-2">
              ⏰ Limited time offer for early adopters!
            </p>
          </div>
        ) : (
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-gray-900">{price}</span>
            {period && <span className="text-gray-600">/ {period}</span>}
          </div>
        )}
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {launchConfig.isLaunched ? (
        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
          <Button
            className={`w-full ${popular ? "" : "variant-outline"}`}
            variant={popular ? "primary" : "outline"}
          >
            Get Started
          </Button>
        </SignUpButton>
      ) : (
        <button
          onClick={() => {
            document
              .getElementById("waitlist")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
            popular
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
              : "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
          }`}
        >
          Join Waitlist
        </button>
      )}
    </motion.div>
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
function FeatureRow({
  category,
  feature,
  starter,
  professional,
  enterprise,
  isCategory,
}) {
  if (isCategory) {
    return (
      <tr className="bg-gray-50">
        <td
          colSpan="4"
          className="px-6 py-3 text-sm font-semibold text-gray-900"
        >
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
