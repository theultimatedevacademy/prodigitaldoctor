import { Shield, Mail, Phone } from "./icons";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl font-bold">
                <span className="text-blue-500">Ocura</span>
                <span className="text-white">360</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              India's first ABDM-native AI powered clinic management suite built
              for solo practitioners and small clinics.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://ocura360.com/#features"
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="https://ocura360.com/#pricing"
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="https://ocura360.com/#promo-video"
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Demo
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <a
                  href="https://ocura360.com/help"
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="https://ocura360.com/privacy"
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://ocura360.com/terms"
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:hello@ocura360.com"
                  className="hover:text-white transition-colors"
                >
                  hello@ocura360.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+917584981667"
                  className="hover:text-white transition-colors"
                >
                  +91 7584981667
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a
                  href="https://wa.me/917584981667"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Ocura360. All rights reserved.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-full">
                <Shield className="w-3 h-3 text-blue-500" />
                Government Compliant
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
  );
}

export default Footer;
