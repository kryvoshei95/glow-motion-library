import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLinks } from "@/components/NavLinks";
import { LogoMark } from "@/components/icons";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2 text-fg">
          <LogoMark size={22} />
          <span className="text-[15px] font-semibold tracking-tight">Glow Motion Library</span>
        </Link>
        <NavLinks />
        <ThemeToggle />
      </div>
    </header>
  );
}
