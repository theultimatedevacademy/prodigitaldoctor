"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { type Post } from "@/interfaces/post";
import DateFormatter from "./date-formatter";

type Props = {
  recentPosts: Post[];
};

export function RightSidebar({ recentPosts }: Props) {
  return (
    <motion.div
      className="sticky top-24 space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Recent Posts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
        <div className="space-y-4">
          {recentPosts.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="group block"
            >
              <div className="flex gap-3">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                    {post.title}
                  </h4>
                  <p className="text-xs text-gray-500">
                    <DateFormatter dateString={post.date} />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Stay Updated</h3>
        <p className="text-sm text-gray-600 mb-4">
          Get the latest healthcare insights delivered to your inbox.
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="Your email"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Ocura360 App Promo */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg text-white">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Try Ocura360</h3>
            <p className="text-sm text-blue-100">
              India's first ABDM-native AI powered clinic management suite
            </p>
          </div>
        </div>

        <ul className="space-y-2 mb-4 text-sm">
          <li className="flex items-center gap-2">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>30-second prescriptions</span>
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>ABDM integrated</span>
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Starting at ₹999/month</span>
          </li>
        </ul>

        <a
          href="https://app.ocura360.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-center text-sm"
        >
          Start Free Trial
        </a>
      </div>
    </motion.div>
  );
}
