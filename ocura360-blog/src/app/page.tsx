import Header from "@/app/_components/header";
import { Intro } from "@/app/_components/intro";
import { FeaturedSection } from "@/app/_components/featured-section";
import { MasonryGrid } from "@/app/_components/masonry-grid";
import { getAllPosts } from "@/lib/api";

export default function Index() {
  const allPosts = getAllPosts();

  const featuredPost = allPosts[0];
  const recentPosts = allPosts.slice(1, 3);
  const morePosts = allPosts.slice(3);

  return (
    <main className="min-h-screen">
      <Header />
      <Intro />
      <FeaturedSection 
        featured={{
          title: featuredPost.title,
          coverImage: featuredPost.coverImage,
          date: featuredPost.date,
          excerpt: featuredPost.excerpt,
          author: featuredPost.author,
          slug: featuredPost.slug,
        }}
        recent={recentPosts.map(post => ({
          title: post.title,
          coverImage: post.coverImage,
          date: post.date,
          author: post.author,
          slug: post.slug,
        }))}
      />
      {morePosts.length > 0 && <MasonryGrid posts={morePosts} />}
    </main>
  );
}
