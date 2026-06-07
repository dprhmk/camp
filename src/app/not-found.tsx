import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-slate-100">
        <Compass className="size-8 text-slate-400" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">Сторінку не знайдено</h1>
      <p className="max-w-xs text-sm text-slate-500">
        Можливо, її видалили або адреса введена з помилкою.
      </p>
      <Button asChild variant="secondary">
        <Link href="/">На головну</Link>
      </Button>
    </main>
  );
}
