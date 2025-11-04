"use client";

import { motion } from "framer-motion";
import { type Author } from "@/interfaces/author";

type Props = {
  author: Author;
  postCount?: number;
};

export function AuthorSidebar({ author, postCount }: Props) {
  return (
    <motion.div
      className="sticky top-24"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <img
            src={author.picture}
            alt={author.name}
            className="w-20 h-20 rounded-full mb-4 ring-4 ring-blue-50"
          />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {author.name}
          </h3>
          <p className="text-sm text-gray-600">
            Healthcare technology writer and ABDM integration specialist
          </p>
        </div>

        {postCount !== undefined && postCount > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {postCount}
              </div>
              <div className="text-sm text-gray-500">Published Articles</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
