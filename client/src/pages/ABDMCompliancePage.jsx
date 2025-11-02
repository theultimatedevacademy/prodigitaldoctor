/**
 * ABDM Compliance Page
 * Details Ocura360's compliance with Ayushman Bharat Digital Mission standards
 */

import { Link } from "react-router";
import { ArrowLeft, Shield, CheckCircle, Lock, Users, FileText, Database, Globe } from "lucide-react";
import logo from "../assets/logo.svg";
import launchConfig from "../config/launchConfig";

export default function ABDMCompliancePage() {
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
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              ABDM Compliance
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Ocura360's commitment to Ayushman Bharat Digital Mission standards and digital health interoperability
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 lg:p-12 space-y-8">
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About ABDM</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Ayushman Bharat Digital Mission (ABDM) is a flagship initiative by the Government of India under the National Health Authority (NHA) to create a seamless online platform for the integrated digital health infrastructure of the country. ABDM aims to bridge the existing gap amongst different stakeholders of the healthcare ecosystem through digital highways.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Ocura360 is designed to be ABDM-compliant and integrates with the ABDM ecosystem to enable secure, interoperable, and patient-centric digital health services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our ABDM Integration</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Ocura360 provides comprehensive integration with key ABDM building blocks:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">ABHA Integration</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Link patient records with Ayushman Bharat Health Account (ABHA) numbers for unique health identification and seamless record portability across healthcare providers.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Digital Health Records</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Create, store, and share digital health records in ABDM-compliant formats. Patients can access their records through the ABHA app and share them with authorized providers.
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">HFR Mapping</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Register your clinic in the Health Facility Registry (HFR) for discoverability and verification. Enables patients to find and verify your facility through ABDM channels.
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Consent Management</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Patient-centric consent framework ensures health data is shared only with explicit patient authorization, maintaining privacy and control over personal health information.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key ABDM Principles We Follow</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Patient as Data Owner</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Patients retain ownership and control of their health data. All data sharing requires explicit patient consent through ABDM's consent management framework.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Interoperability Standards</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    We adhere to ABDM's open standards and APIs for seamless data exchange. Health records are structured using FHIR (Fast Healthcare Interoperability Resources) standards where applicable.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Security and Privacy</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    End-to-end encryption, secure authentication, and audit trails ensure health data confidentiality. We comply with IT Act 2000 and ABDM security guidelines.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">National Portability</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Health records created in Ocura360 are portable across the ABDM ecosystem. Patients can access their records from any ABDM-enabled facility or application.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Federated Architecture</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Health data remains with the originating facility (your clinic). ABDM provides the infrastructure for secure sharing without centralized data storage.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security and Compliance</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Technical Safeguards</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li><strong>Encryption:</strong> AES-256 encryption for data at rest, TLS 1.3 for data in transit</li>
              <li><strong>Authentication:</strong> Multi-factor authentication, role-based access control</li>
              <li><strong>Audit Logs:</strong> Comprehensive logging of all data access and modifications</li>
              <li><strong>Data Centers:</strong> Secure infrastructure hosted in India with regular security audits</li>
              <li><strong>Backup and Recovery:</strong> Regular automated backups with disaster recovery protocols</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Regulatory Compliance</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>IT Act 2000:</strong> Compliance with Information Technology Act and associated rules</li>
              <li><strong>ABDM Guidelines:</strong> Adherence to National Health Authority's ABDM policies and standards</li>
              <li><strong>Medical Records:</strong> Compliance with Clinical Establishments Act and medical record retention requirements</li>
              <li><strong>Data Protection:</strong> Implementation of reasonable security practices as per SPDI Rules 2011</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits of ABDM Integration</h2>
            
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">For Healthcare Providers</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Access to comprehensive patient health history with consent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Reduced administrative burden through digital workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Enhanced clinical decision-making with complete patient context</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Improved care coordination across healthcare facilities</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-purple-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">For Patients</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Single digital health ID (ABHA) for all healthcare interactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Anytime, anywhere access to personal health records</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Control over who can access health information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Seamless continuity of care across different providers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Reduced paperwork and physical document management</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Enable ABDM Features</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Register Your Facility</h3>
                  <p className="text-gray-700 text-sm">
                    Complete HFR registration through your Ocura360 dashboard. Provide clinic details and verification documents.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Link Patient ABHA</h3>
                  <p className="text-gray-700 text-sm">
                    When creating or updating patient records, link their ABHA number. Patients can create ABHA through the ABHA app or website.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Obtain Patient Consent</h3>
                  <p className="text-gray-700 text-sm">
                    Before sharing health records, obtain explicit consent from patients through the ABDM consent framework.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Share Digital Records</h3>
                  <p className="text-gray-700 text-sm">
                    Create prescriptions and health records as usual. They'll be automatically available to patients through their ABHA account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Continuous Compliance</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ocura360 is committed to maintaining ABDM compliance as standards evolve:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Regular updates to align with latest ABDM guidelines and API changes</li>
              <li>Ongoing security audits and penetration testing</li>
              <li>Staff training on ABDM protocols and data protection</li>
              <li>Monitoring of ABDM ecosystem changes and policy updates</li>
              <li>Collaboration with NHA and ABDM stakeholders for best practices</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Resources and Support</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For more information about ABDM and our integration:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>
                <strong>ABDM Official Website:</strong>{" "}
                <a href="https://abdm.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  abdm.gov.in
                </a>
              </li>
              <li>
                <strong>National Health Authority:</strong>{" "}
                <a href="https://nha.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  nha.gov.in
                </a>
              </li>
              <li>
                <strong>ABHA Creation:</strong>{" "}
                <a href="https://abha.abdm.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  abha.abdm.gov.in
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about ABDM compliance or integration support:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-gray-900 font-semibold mb-2">Ocura360 Support</p>
              <p className="text-gray-700">Email: <a href={`mailto:${launchConfig.contact.email}`} className="text-blue-600 hover:underline">{launchConfig.contact.email}</a></p>
              {launchConfig.contact.phone && (
                <p className="text-gray-700">Phone: {launchConfig.contact.phone}</p>
              )}
              {launchConfig.contact.whatsapp && (
                <p className="text-gray-700">
                  WhatsApp: <a href={launchConfig.contact.whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Chat with us</a>
                </p>
              )}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-900 font-semibold mb-2">
                  ABDM Compliance Commitment
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Ocura360 is designed to meet ABDM standards and guidelines as published by the National Health Authority. We continuously update our platform to maintain compliance as ABDM evolves. For the latest ABDM policies and technical specifications, please refer to official NHA/ABDM documentation.
                </p>
              </div>
            </div>
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
