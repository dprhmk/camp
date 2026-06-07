import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl bg-brand-600 text-2xl">
            ⛺
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Загінецька база</h1>
          <p className="mt-1 text-sm text-slate-500">Увійдіть, щоб продовжити</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
