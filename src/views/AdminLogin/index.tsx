"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { authApi } from "@/services/api/client";

const loginSchema = z.object({
  email: z.string().email("Email invalido."),
  password: z.string().min(1, "Informe a senha."),
});

type LoginForm = z.infer<typeof loginSchema>;

export function AdminLoginView() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@delivery.local",
      password: "admin123",
    },
  });

  async function onSubmit(values: LoginForm) {
    setError("");
    try {
      await authApi("login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Credenciais invalidas.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form
        className="grid w-full max-w-sm gap-4 rounded-md border border-border bg-surface p-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-sm text-muted">Acesse o painel do restaurante.</p>
        </div>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
        <Field label="Senha" error={form.formState.errors.password?.message}>
          <Input type="password" {...form.register("password")} />
        </Field>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          <LogIn size={16} />
          Entrar
        </Button>
      </form>
    </main>
  );
}
