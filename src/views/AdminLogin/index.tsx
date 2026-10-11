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
import { adminLoginSchema } from "@/utils/adminAuth";
import { ErrorText, Form, Root, Subtitle, Title } from "./styles";

type LoginForm = z.infer<typeof adminLoginSchema>;

export function AdminLoginView() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<LoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      identifier: "admin@delivery.local",
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
      setError("Credenciais inválidas.");
    }
  }

  return (
    <Root>
      <Form
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <Title>Admin</Title>
          <Subtitle>Acesse o painel do restaurante.</Subtitle>
        </div>
        <Field label="E-mail ou celular" error={form.formState.errors.identifier?.message}>
          <Input type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} {...form.register("identifier")} />
        </Field>
        <Field label="Senha" error={form.formState.errors.password?.message}>
          <Input type="password" autoComplete="current-password" {...form.register("password")} />
        </Field>
        {error ? <ErrorText>{error}</ErrorText> : null}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          <LogIn size={16} />
          Entrar
        </Button>
      </Form>
    </Root>
  );
}
