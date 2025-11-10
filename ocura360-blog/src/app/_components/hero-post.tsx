import Avatar from "@/app/_components/avatar";
import CoverImage from "@/app/_components/cover-image";
import { type Author } from "@/interfaces/author";
import Link from "next/link";
import DateFormatter from "./date-formatter";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
};

export function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: Props) {
  return (
    <section className="mb-12">
      <Link href={`/posts/${slug}`} className="group block">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all">
          <div className="aspect-[2/1] overflow-hidden">
            <CoverImage title={title} src={coverImage} slug={slug} />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
              <DateFormatter dateString={date} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
              {title}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {excerpt}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Avatar name={author.name} picture={author.picture} />
              <span className="text-blue-600 font-medium text-sm inline-flex items-center gap-1">
                Read article →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
