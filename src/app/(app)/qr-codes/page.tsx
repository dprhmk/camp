import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { requireActiveCamp } from "@/lib/camp";
import { qrSvg } from "@/lib/qr";
import { displayName } from "@/lib/utils";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { GenerateCodesForm, PrintButton } from "./qr-codes-client";

export default async function QrCodesPage() {
  await requirePermission("codes:manage");
  const camp = await requireActiveCamp();

  const [pool, members] = await Promise.all([
    prisma.poolCode.findMany({
      where: { campId: camp.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, code: true },
    }),
    prisma.member.findMany({
      where: { campId: camp.id },
      select: { code: true, firstName: true, lastName: true },
    }),
  ]);

  const memberByCode = new Map(members.map((m) => [m.code, m]));
  const cells = await Promise.all(
    pool.map(async (p) => ({
      id: p.id,
      code: p.code,
      svg: await qrSvg(p.code),
      usedBy: memberByCode.get(p.code) ?? null,
    })),
  );
  const freeCount = cells.filter((c) => !c.usedBy).length;

  return (
    <Container className="print:max-w-none print:p-0">
      <div className="print:hidden">
        <PageHeader
          title="QR-коди"
          description={
            pool.length
              ? `Всього ${pool.length} · вільних ${freeCount} · присвоєно ${pool.length - freeCount}`
              : "Згенеруйте коди, роздрукуйте наліпки — скан вільного коду відкриє форму нового учасника"
          }
          action={pool.length > 0 ? <PrintButton /> : undefined}
        />
        <Card className="mb-4">
          <CardContent>
            <GenerateCodesForm defaultCount={65} />
          </CardContent>
        </Card>
      </div>

      {cells.length === 0 ? (
        <EmptyState title="Кодів ще немає" description="Згенеруйте перший набір кодів вище" />
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 print:grid-cols-5 print:gap-2">
          {cells.map((cell) => (
            <div
              key={cell.id}
              className={
                "break-inside-avoid rounded-xl border border-slate-200 bg-white p-3 text-center" +
                (cell.usedBy ? " opacity-50 print:opacity-100" : "")
              }
            >
              <div
                className="mx-auto [&_svg]:h-auto [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: cell.svg }}
              />
              <div className="mt-2 font-mono text-sm font-semibold tracking-widest text-slate-900">
                {cell.code}
              </div>
              {cell.usedBy && (
                <div className="mt-0.5 truncate text-xs text-slate-500 print:hidden">
                  {displayName(cell.usedBy)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
