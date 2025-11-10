"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";
import Avatar from "./avatar";
import { type Author } from "@/interfaces/author";

type FeaturedProps = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
};

type RecentProps = {
  posts: Array<{
    title: string;
    coverImage: string;
    date: string;
    author: Author;
    slug: string;
  }>;
};

export function FeaturedSection({
  featured,
  recent,
}: {
  featured: FeaturedProps;
  recent: RecentProps["posts"];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 1]);

  return (
    <section ref={containerRef} className="py-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Featured and Recent Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured Post - 50% width */}
          <motion.div
            style={{ y, scale }}
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ 
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <Link
              href={`/posts/${featured.slug}`}
              className="group block h-full"
            >
              <div className="relative h-full bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative h-full flex flex-col">
                  {/* Image - consistent aspect ratio */}
                  <div className="relative aspect-video overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Featured badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg">
                        Featured
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                        <DateFormatter dateString={featured.date} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {featured.title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed line-clamp-2 text-sm">
                        {featured.excerpt}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Avatar
                        name={featured.author.name}
                        picture={featured.author.picture}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Recent Posts - 50% width */}
          <div className="flex flex-col gap-6">
            {/* Recent Posts Header */}
            <h2 className="text-2xl font-bold text-gray-900">Recent Posts</h2>
            
            {recent.slice(0, 2).map((post, index) => (
              <motion.div
                key={post.slug}
                className="flex-1"
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ 
                  duration: 0.7,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <Link
                  href={`/posts/${post.slug}`}
                  className="group block h-full"
                >
                  <div className="h-full bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="flex flex-col sm:flex-row h-full">
                      {/* Image - consistent aspect ratio */}
                      <div className="sm:w-2/5 relative aspect-video sm:aspect-auto overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Content */}
                      <div className="sm:w-3/5 p-5 flex flex-col justify-between">
                        <div>
                          <div className="text-xs text-gray-500 mb-2">
                            <DateFormatter dateString={post.date} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <img
                              src={post.author.picture}
                              alt={post.author.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xs text-gray-600 font-medium">
                              {post.author.name}
                            </span>
                          </div>
                          <span className="text-blue-600 text-xs font-medium">
                            Read →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
