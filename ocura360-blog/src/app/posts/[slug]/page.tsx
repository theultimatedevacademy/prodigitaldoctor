import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import Alert from "@/app/_components/alert";
import Header from "@/app/_components/header";
import { PostBody } from "@/app/_components/post-body";
import { PostHeader } from "@/app/_components/post-header";
import { AuthorSidebar } from "@/app/_components/author-sidebar";
import { RightSidebar } from "@/app/_components/right-sidebar";

export default async function Post(props: Params) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");
  const allPosts = getAllPosts();
  const recentPosts = allPosts
    .filter((p) => p.slug !== params.slug)
    .slice(0, 5);

  // Calculate author's post count
  const authorPostCount = allPosts.filter(
    (p) => p.author.name === post.author.name
  ).length;

  return (
    <main className="min-h-screen bg-white">
      <Header />
      {/* <Alert preview={post.preview} /> */}

      {/* Hero Image */}
      <div className="relative h-[40vh] sm:h-[50vh] lg:h-[60vh] overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        <div className="relative h-full flex items-end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16 text-white w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">{post.title}</h1>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <img
                src={post.author.picture}
                alt={post.author.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-white/20"
              />
              <div>
                <div className="font-semibold">{post.author.name}</div>
                <div className="text-gray-300">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })} · 8 min read
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Sidebar - Author Info - Desktop Only */}
          <aside className="hidden lg:block lg:col-span-3">
            <AuthorSidebar author={post.author} postCount={authorPostCount} />
          </aside>

          {/* Main Content */}
          <article className="lg:col-span-6">
            <div className="prose prose-base sm:prose-lg max-w-none">
              <PostBody content={content} />
            </div>

            {/* Mobile Author Info */}
            <div className="lg:hidden mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
              <AuthorSidebar author={post.author} postCount={authorPostCount} />
            </div>

            {/* Mobile Right Sidebar */}
            <div className="lg:hidden mt-8 sm:mt-12">
              <RightSidebar recentPosts={recentPosts} />
            </div>
          </article>

          {/* Right Sidebar - Recent Posts & CTA - Desktop Only */}
          <aside className="hidden lg:block lg:col-span-3">
            <RightSidebar recentPosts={recentPosts} />
          </aside>
        </div>
      </div>
    </main>
  );
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const title = `${post.title} | Ocura360 Blog`;

  return {
    title,
    openGraph: {
      title,
      images: [post.ogImage.url],
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
