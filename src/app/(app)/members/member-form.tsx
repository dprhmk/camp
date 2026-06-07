"use client";

import * as React from "react";
import { useActionState } from "react";
import { initialActionState, type ActionState } from "@/lib/actions/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Field, Checkbox } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/form/submit-button";
import { PhotoUpload } from "@/components/form/photo-upload";
import { useToast } from "@/components/ui/toast";
import {
  BUILD_OPTIONS,
  GENDER_OPTIONS,
  PERSONALITY_OPTIONS,
  RESIDENCE_OPTIONS,
  SCALE_OPTIONS,
  type Option,
} from "@/lib/enums";

// Loose value bag from the DB record (or empty for a new member).
export type MemberValues = Record<string, unknown>;

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const bool = (v: unknown) => v === true;

export function MemberForm({
  action,
  values = {},
  squads,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  values?: MemberValues;
  squads: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const toast = useToast();
  const err = state.fieldErrors ?? {};

  React.useEffect(() => {
    if (state.ok) toast({ type: "success", message: "Збережено" });
    else if (state.message) toast({ type: "error", message: state.message });
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-5 pb-28" noValidate>
      {(state.message || Object.keys(err).length > 0) && (
        <Alert variant="error">
          {state.message ?? "Перевірте виділені поля — деякі заповнено некоректно."}
        </Alert>
      )}

      <Section title="Основне">
        <PhotoUpload name="photoUrl" defaultUrl={str(values.photoUrl) || null} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="lastName" label="Прізвище" required def={values.lastName} err={err.lastName} />
          <Text name="firstName" label="Імʼя" required def={values.firstName} err={err.firstName} />
          <Text name="middleName" label="По батькові" def={values.middleName} err={err.middleName} />
          <Field label="Дата народження" htmlFor="dateOfBirth" error={err.dateOfBirth}>
            <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={str(values.dateOfBirth).slice(0, 10)} />
          </Field>
          <SelectField name="gender" label="Стать" options={GENDER_OPTIONS} def={values.gender} err={err.gender} />
          <SelectField name="residenceType" label="Тип проживання" options={RESIDENCE_OPTIONS} def={values.residenceType} err={err.residenceType} />
        </div>
      </Section>

      <Section title="Контакти">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="childPhone" label="Телефон дитини" type="tel" def={values.childPhone} err={err.childPhone} />
          <Text name="guardianName" label="ПІБ опікуна" def={values.guardianName} err={err.guardianName} />
          <Text name="parentsPhone" label="Телефон батьків" type="tel" def={values.parentsPhone} err={err.parentsPhone} />
          <Text name="additionalContact" label="Додатковий контакт" def={values.additionalContact} err={err.additionalContact} />
          <Text name="instagram" label="Instagram" def={values.instagram} err={err.instagram} />
          <Text name="telegram" label="Telegram" def={values.telegram} err={err.telegram} />
          <Text name="otherSocial" label="Інші соцмережі" def={values.otherSocial} err={err.otherSocial} />
          <Text name="address" label="Адреса" def={values.address} err={err.address} />
        </div>
      </Section>

      <Section title="Фізичне">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Зріст, см" htmlFor="height" error={err.height}>
            <Input id="height" name="height" type="number" inputMode="numeric" defaultValue={str(values.height)} aria-invalid={!!err.height} />
          </Field>
          <SelectField name="build" label="Статура" options={BUILD_OPTIONS} def={values.build} err={err.build} />
          <ScaleField name="agility" label="Спритність" def={values.agility} err={err.agility} />
          <ScaleField name="strength" label="Сила" def={values.strength} err={err.strength} />
          <Text name="sportType" label="Вид спорту" def={values.sportType} err={err.sportType} />
        </div>
        <Checkbox name="doesSports" label="Займається спортом" defaultChecked={bool(values.doesSports)} />
      </Section>

      <Section title="Медичне">
        <div className="grid gap-4">
          <Area name="allergies" label="Алергії" def={values.allergies} err={err.allergies} />
          <Area name="medicalRestrictions" label="Медичні обмеження" def={values.medicalRestrictions} err={err.medicalRestrictions} />
          <Area name="physicalRestrictions" label="Фізичні обмеження" def={values.physicalRestrictions} err={err.physicalRestrictions} />
          <Area name="medicalNotes" label="Нотатки" def={values.medicalNotes} err={err.medicalNotes} />
        </div>
      </Section>

      <Section title="Психологічне">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField name="personalityType" label="Тип особистості" options={PERSONALITY_OPTIONS} def={values.personalityType} err={err.personalityType} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Checkbox name="firstTimeAtCamp" label="Перший раз у таборі" defaultChecked={bool(values.firstTimeAtCamp)} />
          <Checkbox name="isExceptional" label="Винятковий" defaultChecked={bool(values.isExceptional)} />
          <Checkbox name="panicAttacks" label="Панічні атаки" defaultChecked={bool(values.panicAttacks)} />
        </div>
      </Section>

      <Section title="Творче">
        <div className="grid gap-4 sm:grid-cols-2">
          <ScaleField name="drawing" label="Малювання" def={values.drawing} err={err.drawing} />
          <ScaleField name="poetry" label="Поезія" def={values.poetry} err={err.poetry} />
          <Text name="instruments" label="Інструменти" def={values.instruments} err={err.instruments} />
        </div>
        <Checkbox name="isMusician" label="Музикант" defaultChecked={bool(values.isMusician)} />
      </Section>

      <Section title="Інтелект">
        <div className="grid gap-4 sm:grid-cols-2">
          <ScaleField name="englishLevel" label="Рівень англійської" def={values.englishLevel} err={err.englishLevel} />
          <ScaleField name="generalLevel" label="Загальний рівень" def={values.generalLevel} err={err.generalLevel} />
        </div>
      </Section>

      <Section title="Загін">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            name="squadId"
            label="Загін"
            options={squads.map((s) => ({ value: s.id, label: s.name }))}
            def={values.squadId}
            err={err.squadId}
            emptyLabel="Без загону"
          />
        </div>
        <Checkbox name="isLeader" label="Лідер загону" defaultChecked={bool(values.isLeader)} />
      </Section>

      {/* Sticky submit bar */}
      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:bottom-0">
        <div className="mx-auto max-w-3xl">
          <SubmitButton className="w-full">{submitLabel}</SubmitButton>
        </div>
      </div>
    </form>
  );
}

// --- Field helpers ---------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function Text({
  name,
  label,
  def,
  err,
  required,
  type = "text",
}: {
  name: string;
  label: string;
  def?: unknown;
  err?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <Field label={label} htmlFor={name} required={required} error={err}>
      <Input id={name} name={name} type={type} defaultValue={str(def)} aria-invalid={!!err} />
    </Field>
  );
}

function Area({ name, label, def, err }: { name: string; label: string; def?: unknown; err?: string }) {
  return (
    <Field label={label} htmlFor={name} error={err}>
      <Textarea id={name} name={name} defaultValue={str(def)} aria-invalid={!!err} />
    </Field>
  );
}

function SelectField({
  name,
  label,
  options,
  def,
  err,
  emptyLabel = "—",
}: {
  name: string;
  label: string;
  options: Option[];
  def?: unknown;
  err?: string;
  emptyLabel?: string;
}) {
  return (
    <Field label={label} htmlFor={name} error={err}>
      <Select id={name} name={name} defaultValue={str(def)} aria-invalid={!!err}>
        <option value="">{emptyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}

function ScaleField({ name, label, def, err }: { name: string; label: string; def?: unknown; err?: string }) {
  return (
    <SelectField name={name} label={label} options={SCALE_OPTIONS} def={def} err={err} emptyLabel="Не вказано" />
  );
}
