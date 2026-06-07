import { requireActiveCamp } from "@/lib/camp";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Scanner } from "./scanner";

export default async function ScanPage() {
  await requireActiveCamp();
  return (
    <Container>
      <PageHeader title="Скан коду" description="Наведіть камеру на QR-код дитини або введіть код вручну" />
      <Scanner />
    </Container>
  );
}
