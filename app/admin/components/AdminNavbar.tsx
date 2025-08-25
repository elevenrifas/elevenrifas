"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/database";

const tabs = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/rifas", label: "Rifas" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/pagos", label: "Pagos" },
  { href: "/admin/clientes", label: "Clientes" },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="border-b bg-background">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/admin/dashboard" className="font-semibold">Admin</Link>
          <nav className="flex items-center gap-4 text-sm">
            {tabs.map((t) => {
              const active = pathname?.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={
                    active
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  {t.label}
                </Link>
              );
            })}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}


