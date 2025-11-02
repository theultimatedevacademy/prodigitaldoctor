/**
 * Help Page
 * Provides support resources and FAQs for Ocura360 users
 */

import { Link } from "react-router";
import { ArrowLeft, Mail, Phone, MessageCircle, HelpCircle, FileText, Users, Calendar } from "lucide-react";
import logo from "../assets/logo.svg";
import launchConfig from "../config/launchConfig";

export default function HelpPage() {
  const faqs = [
    {
      category: "Getting Started",
      icon: HelpCircle,
      questions: [
        {
          q: "How do I create my first clinic?",
          a: "After signing up and activating your trial, navigate to the dashboard and click 'Create Clinic'. Fill in your clinic details including name, address, and contact information. Your clinic will be ready to use immediately."
        },
        {
          q: "What is ABHA and do I need it?",
          a: "ABHA (Ayushman Bharat Health Account) is a unique health ID for Indian citizens under ABDM. While not mandatory, linking ABHA enables seamless digital health record sharing and improves patient care continuity."
        },
        {
          q: "How do I add staff members?",
          a: "Go to Staff Management from your dashboard. Click 'Invite Staff', enter their email and role (Doctor/Staff). They'll receive an invitation to join your clinic."
        }
      ]
    },
    {
      category: "Prescriptions & Appointments",
      icon: FileText,
      questions: [
        {
          q: "How does the Drug Interaction Check work?",
          a: "Our system automatically checks for drug-drug interactions (DDI) when you add medications to a prescription. If a potential interaction is detected, you'll see a warning with severity level and recommended actions."
        },
        {
          q: "Can I customize prescription templates?",
          a: "Yes, Professional and Enterprise plans include custom branding where you can add your clinic logo, customize headers/footers, and adjust the prescription layout."
        },
        {
          q: "How do I schedule appointments?",
          a: "Navigate to Appointments > New Appointment. Select the patient (or create new), choose date/time, appointment type, and add any notes. The system will track appointment status automatically."
        }
      ]
    },
    {
      category: "Billing & Subscription",
      icon: Users,
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway."
        },
        {
          q: "Can I upgrade or downgrade my plan?",
          a: "Yes, you can change your plan anytime from the Subscription page. Upgrades take effect immediately. Downgrades apply at the end of your current billing cycle."
        },
        {
          q: "What happens if I exceed my plan limits?",
          a: "You'll receive notifications when approaching limits. For appointments and prescriptions, you can upgrade your plan or wait for the next billing cycle. Patient records and staff limits are hard caps."
        }
      ]
    },
    {
      category: "Data & Security",
      icon: Calendar,
      questions: [
        {
          q: "Is my patient data secure?",
          a: "Yes. We use bank-grade encryption (AES-256), secure data centers in India, regular security audits, and comply with IT Act 2000 and ABDM guidelines. Your data is never shared without consent."
        },
        {
          q: "Can I export my data?",
          a: "Yes, you can export patient records, prescriptions, and appointment history in CSV or PDF format from the respective sections."
        },
        {
          q: "What happens to my data if I cancel?",
          a: "Your data remains accessible for 90 days after cancellation. You can export it during this period. After 90 days, data is permanently deleted as per our retention policy."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Ocura360" className="h-8 w-auto" />
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions or reach out to our support team
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get help via email within 24 hours
            </p>
            <a
              href={`mailto:${launchConfig.contact.email}`}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {launchConfig.contact.email}
            </a>
          </div>

          {launchConfig.contact.whatsapp && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp Support</h3>
              <p className="text-gray-600 text-sm mb-4">
                Chat with us on WhatsApp
              </p>
              <a
                href={launchConfig.contact.whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Start Chat
              </a>
            </div>
          )}

          {launchConfig.contact.phone && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 text-sm mb-4">
                Call us during business hours
              </p>
              <a
                href={`tel:${launchConfig.contact.phone}`}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                {launchConfig.contact.phone}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Quick answers to questions you may have
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{category.category}</h3>
              </div>
              <div className="space-y-6">
                {category.questions.map((item, qIdx) => (
                  <div key={qIdx} className="border-l-4 border-blue-200 pl-6">
                    <h4 className="font-semibold text-gray-900 mb-2">{item.q}</h4>
                    <p className="text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Still need help?
          </h3>
          <p className="text-gray-600 mb-6">
            Our support team is here to assist you with any questions
          </p>
          <a
            href={`mailto:${launchConfig.contact.email}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            &copy; 2025 Ocura360. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
