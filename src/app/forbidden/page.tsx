import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100">
        <ShieldX className="size-8 text-red-600" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">Немає доступу</h1>
      <p className="max-w-xs text-sm text-slate-500">
        У вас недостатньо прав для цієї дії. Зверніться до супер-адміна табору.
      </p>
      <Button asChild variant="secondary">
        <Link href="/">На головну</Link>
      </Button>
    </main>
  );
}
