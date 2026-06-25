import Link from "next/link";
import { notFound } from "next/navigation";
import { animations, getAnimation } from "@/lib/data";
import { AnimationDetail } from "@/components/AnimationDetail";

export function generateStaticParams() {
  return animations.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const anim = getAnimation(slug);
  return { title: anim ? `${anim.name} — Glow Motion Library` : "Glow Motion Library" };
}

export default async function AnimationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const anim = getAnimation(slug);
  if (!anim) notFound();

  return (
    <article className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-muted transition-colors hover:text-fg">
        ← Каталог
      </Link>
      <AnimationDetail animation={anim} />
    </article>
  );
}
