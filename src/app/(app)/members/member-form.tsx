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
  BUILD_DEFAULT,
  BUILD_OPTIONS,
  GENDER_OPTIONS,
  HEIGHT_DEFAULT,
  HEIGHT_OPTIONS,
  RESIDENCE_DEFAULT,
  RESIDENCE_OPTIONS,
  SCALE_DEFAULT,
  SCALE_OPTIONS,
  type Option,
} from "@/lib/enums";

// Loose value bag from the DB record (or empty for a new member).
export type MemberValues = Record<string, unknown>;
// Squads that already have a leader child: squadId -> { memberId, name }.
export type SquadLeaders = Record<string, { memberId: string; name: string }>;

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const bool = (v: unknown) => v === true;

export function MemberForm({
  action,
  values = {},
  squads,
  squadLeaders = {},
  currentMemberId,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  values?: MemberValues;
  squads: { id: string; name: string }[];
  squadLeaders?: SquadLeaders;
  currentMemberId?: string;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const toast = useToast();
  const err = state.fieldErrors ?? {};

  // Controlled so the "leader" lock reacts to the chosen squad.
  const [squadId, setSquadId] = React.useState(str(values.squadId));
  const [isLeader, setIsLeader] = React.useState(bool(values.isLeader));

  const existingLeader = squadId ? squadLeaders[squadId] : undefined;
  // Another member already leads this squad — assigning this one will replace them.
  const willReplaceLeader =
    isLeader && !!existingLeader && existingLeader.memberId !== currentMemberId;

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
          <Field label="Дата народження" htmlFor="dateOfBirth" required error={err.dateOfBirth}>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={str(values.dateOfBirth).slice(0, 10)}
              aria-invalid={!!err.dateOfBirth}
            />
          </Field>
          {/* Gender required, but defaults to the blank "—" so it's a conscious choice. */}
          <SelectField name="gender" label="Стать" required options={GENDER_OPTIONS} def={values.gender} err={err.gender} />
          <SelectField
            name="residenceType"
            label="Тип проживання"
            required
            options={RESIDENCE_OPTIONS}
            def={str(values.residenceType) || RESIDENCE_DEFAULT}
            err={err.residenceType}
            allowEmpty={false}
          />
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
          <SelectField
            name="height"
            label="Зріст"
            required
            options={HEIGHT_OPTIONS}
            def={str(values.height) || HEIGHT_DEFAULT}
            err={err.height}
            allowEmpty={false}
          />
          <SelectField
            name="build"
            label="Статура"
            required
            options={BUILD_OPTIONS}
            def={str(values.build) || BUILD_DEFAULT}
            err={err.build}
            allowEmpty={false}
          />
        </div>
        <Checkbox name="doesSports" label="Займається спортом" defaultChecked={bool(values.doesSports)} />
      </Section>

      <Section title="Розумова">
        <div className="space-y-1">
          <Checkbox
            name="isExceptional"
            label="Особливий"
            defaultChecked={bool(values.isExceptional)}
          />
          <p className="px-1 text-xs text-slate-500">
            Особливий = дитина з особливостями; помітно знижує розумовий бал для справедливого
            розподілу.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ScaleField name="creativity" label="Творчість" def={values.creativity} err={err.creativity} />
          <ScaleField name="communication" label="Комунікація" def={values.communication} err={err.communication} />
        </div>
      </Section>

      <Section title="Медичне та інше">
        <div className="grid gap-4">
          <Area name="allergies" label="Алергії" def={values.allergies} err={err.allergies} />
          <Area name="medicalRestrictions" label="Медичні обмеження" def={values.medicalRestrictions} err={err.medicalRestrictions} />
          <Area name="physicalRestrictions" label="Фізичні обмеження" def={values.physicalRestrictions} err={err.physicalRestrictions} />
          <Area name="medicalNotes" label="Нотатки" def={values.medicalNotes} err={err.medicalNotes} />
        </div>
      </Section>

      <Section title="Загін">
        <Field label="Загін" htmlFor="squadId" error={err.squadId}>
          <Select
            id="squadId"
            name="squadId"
            value={squadId}
            onChange={(e) => setSquadId(e.target.value)}
          >
            <option value="">Без загону</option>
            {squads.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="space-y-1">
          <Checkbox
            name="isLeader"
            label="Лідер загону"
            checked={isLeader}
            onChange={(e) => setIsLeader(e.target.checked)}
          />
          {willReplaceLeader && (
            <p className="px-1 text-xs text-amber-600">
              Зараз лідер цього загону — {existingLeader?.name}. Якщо збережете, лідером стане цей
              учасник, а {existingLeader?.name} більше ним не буде.
            </p>
          )}
        </div>
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
  required,
  emptyLabel = "—",
  allowEmpty = true,
}: {
  name: string;
  label: string;
  options: Option[];
  def?: unknown;
  err?: string;
  required?: boolean;
  emptyLabel?: string;
  allowEmpty?: boolean;
}) {
  return (
    <Field label={label} htmlFor={name} required={required} error={err}>
      <Select id={name} name={name} defaultValue={str(def)} aria-invalid={!!err}>
        {allowEmpty && <option value="">{emptyLabel}</option>}
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
    <SelectField
      name={name}
      label={label}
      options={SCALE_OPTIONS}
      def={str(def) || SCALE_DEFAULT}
      err={err}
      allowEmpty={false}
    />
  );
}
