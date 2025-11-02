/**
 * Privacy Policy Page
 * Details how Ocura360 collects, uses, and protects user data
 */

import { Link } from "react-router";
import { ArrowLeft, Shield } from "lucide-react";
import logo from "../assets/logo.svg";
import launchConfig from "../config/launchConfig";

export default function PrivacyPolicyPage() {
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Last updated: January 1, 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 lg:p-12 space-y-8">
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ocura360 ("we", "our", or "us") is committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our clinic management platform and services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using Ocura360, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Account Information:</strong> Name, email address, phone number, professional credentials</li>
              <li><strong>Clinic Information:</strong> Clinic name, address, contact details, registration numbers</li>
              <li><strong>Patient Data:</strong> Patient demographics, medical history, prescriptions, appointment records (entered by you)</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through our payment gateway partners</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent, interaction patterns</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies for authentication, preferences, and analytics</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>To provide, operate, and maintain our services</li>
              <li>To process appointments, prescriptions, and patient records</li>
              <li>To enable ABDM integration and digital health record sharing (with consent)</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send service updates, security alerts, and support messages</li>
              <li>To improve our platform through analytics and user feedback</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To comply with legal obligations and regulatory requirements</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>With Your Consent:</strong> When you explicitly authorize data sharing (e.g., ABHA integration)</li>
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operations (hosting, payment processing, analytics) under strict confidentiality agreements</li>
              <li><strong>ABDM Ecosystem:</strong> When you link ABHA and consent to share health records with authorized healthcare providers</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government authority</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to you)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Encryption:</strong> Data in transit (TLS/SSL) and at rest (AES-256)</li>
              <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication, audit logs</li>
              <li><strong>Infrastructure:</strong> Secure data centers in India with regular security audits</li>
              <li><strong>Compliance:</strong> Adherence to IT Act 2000, ABDM guidelines, and healthcare data protection standards</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              While we strive to protect your information, no method of transmission over the internet is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. Patient health records are retained according to medical record retention laws in India (minimum 5 years from last consultation). After account cancellation, data is retained for 90 days for recovery, then permanently deleted unless legally required to retain longer.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Consent Withdrawal:</strong> Revoke consent for data processing (may limit service functionality)</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, contact us at <a href={`mailto:${launchConfig.contact.email}`} className="text-blue-600 hover:underline">{launchConfig.contact.email}</a>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
              <li><strong>Analytics Cookies:</strong> To understand usage patterns and improve our service (Google Analytics, Microsoft Clarity)</li>
              <li><strong>Preference Cookies:</strong> To remember your settings and preferences</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can control cookies through your browser settings. Disabling essential cookies may affect platform functionality.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed">
              Our platform integrates with third-party services including payment gateways, ABDM infrastructure, and analytics providers. These services have their own privacy policies. We recommend reviewing their policies. We are not responsible for the privacy practices of third parties.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Ocura360 is intended for use by healthcare professionals and is not directed to individuals under 18. We do not knowingly collect personal information from minors. Patient records may include minors' health information entered by authorized healthcare providers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your data is stored and processed in India. We do not transfer personal data outside India except as required for ABDM interoperability or with your explicit consent, ensuring adequate safeguards are in place.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or prominent notice on our platform. Continued use after changes constitutes acceptance of the updated policy. The "Last updated" date at the top indicates the latest revision.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-gray-900 font-semibold mb-2">Ocura360</p>
              <p className="text-gray-700">Email: <a href={`mailto:${launchConfig.contact.email}`} className="text-blue-600 hover:underline">{launchConfig.contact.email}</a></p>
              {launchConfig.contact.phone && (
                <p className="text-gray-700">Phone: {launchConfig.contact.phone}</p>
              )}
              <p className="text-gray-700 mt-2">Location: India</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <p className="text-sm text-gray-700">
              <strong>Compliance Note:</strong> This Privacy Policy is designed to comply with the Information Technology Act, 2000 and its rules, including the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, as well as ABDM data protection guidelines.
            </p>
          </div>

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
