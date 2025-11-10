"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";
import Avatar from "./avatar";
import { type Post } from "@/interfaces/post";

type Props = {
  posts: Post[];
};

export function MasonryGrid({ posts }: Props) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl font-bold text-gray-900 mb-10 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          More Articles
        </motion.h2>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              className="break-inside-avoid mb-6"
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-30px" }}
              transition={{ 
                duration: 0.7,
                delay: (index % 6) * 0.12,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <Link href={`/posts/${post.slug}`} className="group block">
                <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
                  {/* Image with consistent aspect ratio */}
                  <div className="relative aspect-video overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                      <DateFormatter dateString={post.date} />
                      <span>•</span>
                      <span>5 min read</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Avatar
                        name={post.author.name}
                        picture={post.author.picture}
                      />
                      <span className="text-blue-600 font-medium text-sm group-hover:gap-1.5 inline-flex items-center gap-1 transition-all">
                        Read
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
