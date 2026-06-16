"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Camera, CameraOff, Keyboard, Loader2 } from "lucide-react";
import { findMemberByCode } from "@/lib/actions/lookup";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";

export function Scanner() {
  const router = useRouter();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const controlsRef = React.useRef<IScannerControls | null>(null);

  const [scanning, setScanning] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [lookupError, setLookupError] = React.useState<string | null>(null);
  const [resolving, setResolving] = React.useState(false);
  const [manual, setManual] = React.useState("");

  const resolve = React.useCallback(
    async (code: string) => {
      setResolving(true);
      setLookupError(null);
      try {
        const found = await findMemberByCode(code);
        if (found) {
          router.push(`/members/${found.id}`);
        } else {
          setLookupError(`Учасника з кодом «${code.toUpperCase()}» не знайдено в цьому таборі`);
          setResolving(false);
        }
      } catch {
        setLookupError("Не вдалося виконати пошук. Перевірте зʼєднання.");
        setResolving(false);
      }
    },
    [router],
  );

  const stop = React.useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  }, []);

  async function start() {
    setCameraError(null);
    setLookupError(null);

    // The camera API is only available in a secure context (HTTPS or
    // localhost). On a phone opening the app over http://<lan-ip> Safari/Chrome
    // hide navigator.mediaDevices entirely — explain it instead of failing mutely.
    const hasCameraApi =
      typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
    if (!hasCameraApi) {
      setCameraError(
        "Камера доступна лише через захищене зʼєднання (HTTPS). Зараз сайт відкрито по HTTP, тому скан недоступний — введіть код вручну нижче, або відкрийте додаток за адресою https://…",
      );
      return;
    }

    setScanning(true);
    try {
      const reader = new BrowserMultiFormatReader();
      controlsRef.current = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result) => {
          if (result) {
            stop();
            resolve(result.getText());
          }
        },
      );
    } catch {
      setScanning(false);
      setCameraError(
        "Не вдалося увімкнути камеру. Дозвольте доступ до камери в браузері або введіть код вручну нижче.",
      );
    }
  }

  React.useEffect(() => () => stop(), [stop]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-900">
            <video ref={videoRef} className="size-full object-cover" playsInline muted />
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Camera className="size-10" />
                <span className="text-sm">Камеру вимкнено</span>
              </div>
            )}
            {resolving && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                <Loader2 className="size-8 animate-spin" />
              </div>
            )}
          </div>

          {cameraError && <Alert variant="error">{cameraError}</Alert>}

          {scanning ? (
            <Button variant="secondary" className="w-full" onClick={stop}>
              <CameraOff className="size-5" />
              Зупинити камеру
            </Button>
          ) : (
            <Button className="w-full" onClick={start} disabled={resolving}>
              <Camera className="size-5" />
              Увімкнути камеру
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manual.trim()) resolve(manual.trim());
            }}
            className="space-y-3"
          >
            <Field label="Або введіть код вручну" htmlFor="code" error={lookupError ?? undefined}>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={manual}
                  onChange={(e) => setManual(e.target.value.toUpperCase())}
                  placeholder="Напр. K7P2QX"
                  className="font-mono uppercase"
                  autoCapitalize="characters"
                  aria-invalid={!!lookupError}
                />
                <Button type="submit" loading={resolving} disabled={!manual.trim()}>
                  <Keyboard className="size-5" />
                  Знайти
                </Button>
              </div>
            </Field>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
