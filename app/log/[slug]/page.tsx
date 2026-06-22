import { notFound } from "next/navigation";
import { LogPostArticle } from "@/components/log/LogPostArticle";
import {
  getPostBySlug,
  getPostSlugs,
} from "@/lib/content/getFeaturedPosts";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

type LogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LogPostPage({ params }: LogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return <LogPostArticle post={post} />;
}
