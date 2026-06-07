"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Users,
  Shield,
  ScanLine,
  CalendarDays,
  Menu,
  Phone,
  Shuffle,
  Tent,
  UserCog,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABEL, type Role } from "@/lib/enums";
import { logoutAction } from "@/lib/actions/auth";

type Caps = { generate: boolean; users: boolean; camps: boolean; schedule: boolean };
type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

export function AppChrome({
  user,
  camp,
  caps,
  children,
}: {
  user: { name: string; role: Role };
  camp: { id: string; name: string; year: number } | null;
  caps: Caps;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const primary: NavItem[] = [
    { href: "/members", label: "Учасники", icon: Users },
    { href: "/squads", label: "Загони", icon: Shield },
    { href: "/scan", label: "Скан", icon: ScanLine },
    { href: "/schedule", label: "Розклад", icon: CalendarDays },
  ];

  const more: NavItem[] = [
    { href: "/contacts", label: "Контакти", icon: Phone },
    ...(caps.generate ? [{ href: "/generate", label: "Розподіл команд", icon: Shuffle }] : []),
    { href: "/camps", label: "Табори", icon: Tent },
    ...(caps.users ? [{ href: "/users", label: "Акаунти", icon: UserCog }] : []),
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-200 md:bg-white">
        <div className="flex items-center gap-2 px-5 py-4">
          <span className="text-xl">⛺</span>
          <span className="font-bold text-slate-900">Загінецька база</span>
        </div>
        <CampSwitcher camp={camp} />
        <nav className="flex-1 space-y-1 px-3 py-2">
          {[...primary, ...more].map((item) => (
            <SideLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <div className="px-2 pb-2 text-xs text-slate-500">
            {user.name} · {ROLE_LABEL[user.role]}
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur md:hidden">
          <Link href="/camps" className="flex min-w-0 items-center gap-2">
            <span className="text-lg">⛺</span>
            <span className="truncate text-sm font-semibold text-slate-900">
              {camp ? `${camp.name} · ${camp.year}` : "Оберіть табір"}
            </span>
          </Link>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {ROLE_LABEL[user.role]}
          </span>
        </header>

        <main className="flex-1 pb-24 md:pb-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white pb-safe md:hidden">
        {primary.map((item) => (
          <BottomLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-2 text-slate-500"
        >
          <Menu className="size-6" />
          <span className="text-[11px]">Ще</span>
        </button>
      </nav>

      {/* Mobile "more" sheet */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 md:hidden" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-4 pb-safe md:hidden">
            <Dialog.Title className="px-2 pb-2 text-sm font-semibold text-slate-500">
              Меню
            </Dialog.Title>
            <div className="space-y-1">
              {more.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-800 hover:bg-slate-100"
                >
                  <item.icon className="size-5 text-slate-500" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ChevronRight className="size-4 text-slate-400" />
                </Link>
              ))}
              <div className="my-2 border-t border-slate-200" />
              <div className="px-3 py-1 text-xs text-slate-500">
                {user.name} · {ROLE_LABEL[user.role]}
              </div>
              <LogoutButton />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function CampSwitcher({ camp }: { camp: { name: string; year: number } | null }) {
  return (
    <Link
      href="/camps"
      className="mx-3 mb-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 hover:bg-slate-100"
    >
      <Tent className="size-5 text-brand-600" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-900">
          {camp ? camp.name : "Оберіть табір"}
        </div>
        {camp && <div className="text-xs text-slate-500">{camp.year}</div>}
      </div>
      <ChevronRight className="size-4 text-slate-400" />
    </Link>
  );
}

function SideLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
        active ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100",
      )}
    >
      <item.icon className="size-5" />
      {item.label}
    </Link>
  );
}

function BottomLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 py-2",
        active ? "text-brand-600" : "text-slate-500",
      )}
    >
      <item.icon className="size-6" />
      <span className="text-[11px]">{item.label}</span>
    </Link>
  );
}

function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-medium text-red-600 hover:bg-red-50">
        <LogOut className="size-5" />
        Вийти
      </button>
    </form>
  );
}
