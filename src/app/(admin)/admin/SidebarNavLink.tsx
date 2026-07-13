/**
 * Sidebar Navigation Link — Client Component
 *
 * Highlights the active route using the current pathname so admins can see
 * which section they are in at a glance.
 *
 * @module app/(admin)/admin/SidebarNavLink
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function SidebarNavLink({ href, children }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={[
        "block whitespace-nowrap px-4 py-2.5 wobbly-sm border-2",
        "transition-all duration-[var(--transition-fast)]",
        "text-[var(--color-fg)] hover:translate-x-[2px]",
        isActive
          ? "bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-border)]"
          : "border-transparent hover:bg-[var(--color-bg-alt)] hover:border-[var(--color-border-light)]",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
