import { type Author } from "@/interfaces/author";
import Link from "next/link";
import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
};

export function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: Props) {
  return (
    <Link href={`/posts/${slug}`} className="group block h-full">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all h-full flex flex-col">
        <div className="aspect-video overflow-hidden">
          <CoverImage slug={slug} title={title} src={coverImage} />
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="text-sm text-gray-500 mb-2">
            <DateFormatter dateString={date} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-4 flex-grow line-clamp-2 text-sm">
            {excerpt}
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <Avatar name={author.name} picture={author.picture} />
            <span className="text-blue-600 font-medium text-sm">
              Read →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
