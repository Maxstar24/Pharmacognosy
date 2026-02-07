"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-3 border-foreground bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-foreground bg-highlight">
            <Leaf className="h-5 w-5 text-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-base font-extrabold uppercase tracking-tight">
            Pharmacognosy Lab
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="#experiments"
            className="hidden sm:inline-flex h-9 items-center rounded-lg border-2 border-foreground px-4 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background"
          >
            Browse All
          </Link>
        </div>
      </div>
    </header>
  );
}
