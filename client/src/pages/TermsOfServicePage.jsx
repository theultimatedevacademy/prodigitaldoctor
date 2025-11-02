/**
 * Terms of Service Page
 * Legal terms and conditions for using Ocura360
 */

import { Link } from "react-router";
import { ArrowLeft, FileText } from "lucide-react";
import logo from "../assets/logo.svg";
import launchConfig from "../config/launchConfig";

export default function TermsOfServicePage() {
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
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Terms of Service
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Ocura360. By accessing or using our clinic management platform and services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These Terms constitute a legally binding agreement between you (the "User", "you", or "your") and Ocura360 ("we", "us", or "our"). We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance of the modified Terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility and Account Registration</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Eligibility</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You must be:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>A licensed healthcare professional or authorized representative of a healthcare facility in India</li>
              <li>At least 18 years of age</li>
              <li>Legally capable of entering into binding contracts</li>
              <li>Compliant with all applicable laws and regulations governing medical practice</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Account Responsibilities</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Providing accurate, current, and complete information during registration</li>
              <li>Maintaining the security and confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access or security breach</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Services</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 License Grant</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Subject to these Terms and your subscription plan, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Services for your internal clinic management purposes.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Acceptable Use</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to use the Services only for lawful purposes and in accordance with these Terms. You agree NOT to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Violate any applicable laws, regulations, or professional medical standards</li>
              <li>Infringe upon intellectual property rights of Ocura360 or third parties</li>
              <li>Upload or transmit viruses, malware, or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Services</li>
              <li>Use the Services to store or transmit illegal, harmful, or offensive content</li>
              <li>Resell, sublicense, or redistribute the Services without authorization</li>
              <li>Use automated systems (bots, scrapers) to access the Services</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription and Payment</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Subscription Plans</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ocura360 offers various subscription plans (Starter, Professional, Enterprise) with different features and limits. Plan details, pricing, and features are available on our website and may be updated periodically.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Free Trial</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may offer a free trial period for new users. At the end of the trial, your subscription will automatically convert to a paid plan unless you cancel. No charges will be made during the trial period.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Payment Terms</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Subscription fees are billed monthly or annually in advance</li>
              <li>All fees are in Indian Rupees (INR) and exclusive of applicable taxes</li>
              <li>You authorize us to charge your payment method on each billing cycle</li>
              <li>Failed payments may result in service suspension or termination</li>
              <li>We reserve the right to change pricing with 30 days' notice</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.4 Refund Policy</h3>
            <p className="text-gray-700 leading-relaxed">
              Subscription fees are non-refundable except as required by law or at our sole discretion. If you cancel mid-cycle, you retain access until the end of the paid period, but no prorated refund will be issued.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Ownership and Usage</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.1 Your Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain all rights, title, and interest in the data you input into the Services ("Your Data"), including patient records, prescriptions, and clinic information. You grant us a limited license to process Your Data solely to provide the Services.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 Data Accuracy and Compliance</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are solely responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>The accuracy, quality, and legality of Your Data</li>
              <li>Obtaining necessary consents from patients for data collection and processing</li>
              <li>Compliance with medical record-keeping requirements and patient privacy laws</li>
              <li>Ensuring Your Data does not violate any third-party rights</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.3 Data Backup and Export</h3>
            <p className="text-gray-700 leading-relaxed">
              While we maintain regular backups, you are responsible for maintaining your own backup copies of Your Data. You may export Your Data at any time through the platform's export features.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. ABDM Integration</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Services integrate with the Ayushman Bharat Digital Mission (ABDM) ecosystem. By using ABDM features:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>You agree to comply with ABDM guidelines and policies</li>
              <li>You acknowledge that health data sharing requires patient consent</li>
              <li>You understand that ABDM-linked data may be accessible to other authorized healthcare providers</li>
              <li>You are responsible for verifying patient identity and consent before linking ABHA accounts</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.1 Our Rights</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Services, including all software, designs, text, graphics, logos, and other content (excluding Your Data), are owned by Ocura360 and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our written permission.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.2 Feedback</h3>
            <p className="text-gray-700 leading-relaxed">
              If you provide feedback, suggestions, or ideas about the Services, you grant us a perpetual, irrevocable, royalty-free license to use and incorporate such feedback without compensation or attribution.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability and Support</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">8.1 Service Level</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We strive to provide reliable Services but do not guarantee uninterrupted or error-free operation. We may perform maintenance, updates, or modifications that temporarily affect availability.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">8.2 Support</h3>
            <p className="text-gray-700 leading-relaxed">
              Support availability varies by subscription plan. Professional and Enterprise plans receive priority support. We aim to respond to support requests within 24-48 hours but do not guarantee specific response times.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimers and Limitations of Liability</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">9.1 Medical Disclaimer</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>IMPORTANT:</strong> Ocura360 is a practice management tool. It does NOT provide medical advice, diagnosis, or treatment. You are solely responsible for all clinical decisions. The drug interaction checker and other clinical features are informational aids only and should not replace professional medical judgment.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">9.2 Service Disclaimer</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">9.3 Limitation of Liability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, OCURA360 SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL ARISING FROM YOUR USE OF THE SERVICES.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our total liability for any claims related to the Services shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Ocura360 and its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, losses, costs, or expenses (including legal fees) arising from: (a) your use of the Services, (b) your violation of these Terms, (c) your violation of any laws or third-party rights, or (d) Your Data.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">11.1 By You</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">11.2 By Us</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may suspend or terminate your account immediately if you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Violate these Terms or our policies</li>
              <li>Fail to pay subscription fees</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Pose a security risk to the Services or other users</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">11.3 Effect of Termination</h3>
            <p className="text-gray-700 leading-relaxed">
              Upon termination, your access to the Services will cease. Your Data will be retained for 90 days for recovery purposes, after which it will be permanently deleted. You may export Your Data before termination.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law and Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms are governed by the laws of India. Any disputes arising from these Terms or the Services shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Before initiating legal proceedings, you agree to attempt to resolve disputes through good-faith negotiation. If unresolved within 30 days, either party may pursue formal legal remedies.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. General Provisions</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">13.1 Entire Agreement</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and Ocura360 regarding the Services.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">13.2 Severability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">13.3 Waiver</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">13.4 Assignment</h3>
            <p className="text-gray-700 leading-relaxed">
              You may not assign or transfer these Terms or your account without our written consent. We may assign these Terms without restriction.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about these Terms, please contact us:
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
              <strong>Acknowledgment:</strong> By clicking "I Agree" during registration or by using the Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
