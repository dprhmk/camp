import type { Member } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  BUILD_OPTIONS,
  GENDER_OPTIONS,
  PERSONALITY_OPTIONS,
  RESIDENCE_OPTIONS,
  labelOf,
} from "@/lib/enums";

const yn = (v: boolean) => (v ? "Так" : "Ні");
const num = (v: number | null) => (v == null ? "—" : String(v));
const text = (v: string | null) => (v && v.trim() ? v : "—");

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <h2 className="mb-1 text-base font-semibold text-slate-900">{title}</h2>
        <div className="divide-y divide-slate-100">{children}</div>
      </CardContent>
    </Card>
  );
}

/** Read-only profile, shown to users who may view but not manage this member. */
export function ProfileView({ m }: { m: Member }) {
  return (
    <div className="space-y-4">
      <Group title="Основне">
        <Row label="Дата народження" value={formatDate(m.dateOfBirth)} />
        <Row label="Стать" value={labelOf(GENDER_OPTIONS, m.gender)} />
        <Row label="Тип проживання" value={labelOf(RESIDENCE_OPTIONS, m.residenceType)} />
      </Group>

      <Group title="Контакти">
        <Row label="Телефон дитини" value={text(m.childPhone)} />
        <Row label="ПІБ опікуна" value={text(m.guardianName)} />
        <Row label="Телефон батьків" value={text(m.parentsPhone)} />
        <Row label="Додатковий контакт" value={text(m.additionalContact)} />
        <Row label="Instagram" value={text(m.instagram)} />
        <Row label="Telegram" value={text(m.telegram)} />
        <Row label="Інші соцмережі" value={text(m.otherSocial)} />
        <Row label="Адреса" value={text(m.address)} />
      </Group>

      <Group title="Фізичне">
        <Row label="Зріст, см" value={num(m.height)} />
        <Row label="Вага, кг" value={num(m.weight)} />
        <Row label="Статура" value={labelOf(BUILD_OPTIONS, m.build)} />
        <Row label="Займається спортом" value={yn(m.doesSports)} />
        <Row label="Вид спорту" value={text(m.sportType)} />
        <Row label="Спритність" value={num(m.agility)} />
        <Row label="Сила" value={num(m.strength)} />
        <Row label="Витривалість" value={num(m.endurance)} />
        <Row label="Координація" value={num(m.coordination)} />
      </Group>

      <Group title="Розумова">
        <Row label="Інтелект" value={num(m.intellect)} />
        <Row label="Логіка" value={num(m.logic)} />
        <Row label="Творчість" value={num(m.creativity)} />
        <Row label="Комунікація" value={num(m.communication)} />
      </Group>

      <Group title="Медичне та інше">
        <Row label="Алергії" value={text(m.allergies)} />
        <Row label="Медичні обмеження" value={text(m.medicalRestrictions)} />
        <Row label="Фізичні обмеження" value={text(m.physicalRestrictions)} />
        <Row label="Нотатки" value={text(m.medicalNotes)} />
        <Row label="Тип особистості" value={labelOf(PERSONALITY_OPTIONS, m.personalityType)} />
        <Row label="Перший раз у таборі" value={yn(m.firstTimeAtCamp)} />
        <Row label="Винятковий" value={yn(m.isExceptional)} />
        <Row label="Панічні атаки" value={yn(m.panicAttacks)} />
      </Group>
    </div>
  );
}
