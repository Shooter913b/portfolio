import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getPostSlugs,
} from "@/lib/content/getFeaturedPosts";
import { formatDisplayDate } from "@/lib/dates";
import { PostFeaturedMedia, hasPostMedia } from "@/components/blog/PostMedia";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-24">
      <Link
        href="/"
        className="font-mono text-sm text-text-muted transition-colors hover:text-accent-blue"
      >
        ← Home
      </Link>
      <article className="mt-8">
        <time className="font-mono text-xs text-text-muted">
          {formatDisplayDate(post.date)}
        </time>
        <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
          {post.title}
        </h1>
        {hasPostMedia(post) && <PostFeaturedMedia post={post} className="mt-6" />}
        <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
          {post.content.trim()}
        </div>
      </article>
    </main>
  );
}
