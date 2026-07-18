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
import { ErrorText, Form, Root, Subtitle, Title } from "./styles";

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
    <Root>
      <Form
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <Title>Admin</Title>
          <Subtitle>Acesse o painel do restaurante.</Subtitle>
        </div>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
        <Field label="Senha" error={form.formState.errors.password?.message}>
          <Input type="password" {...form.register("password")} />
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
