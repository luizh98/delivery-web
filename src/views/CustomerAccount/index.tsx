"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import { useCustomerAuth } from "@/components/CustomerAuthProvider";
import { Field, Input } from "@/components/Field";
import { PageShell } from "@/components/PageShell";
import { clientApi, customerAuthApi } from "@/services/api/client";
import {
  AccountActions,
  AccountCard,
  AccountContent,
  AccountDetail,
  AccountDetails,
  AccountError,
  AccountForm,
  AccountHeader,
  AccountLabel,
  AccountLink,
  AccountSuccess,
  AccountText,
  AccountTitle,
  AccountValue,
} from "./styles";

const loginSchema = z.object({
  phone: z.string().min(10, "Informe o WhatsApp."),
  password: z.string().min(1, "Informe a senha."),
});
const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Informe o nome."),
  birthDate: z.string().min(1, "Informe a data de nascimento."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});
const resetRequestSchema = z.object({ phone: z.string().min(10, "Informe o WhatsApp.") });
const resetConfirmSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Informe o código de 6 dígitos."),
  newPassword: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});

type AccountMode = "account" | "login" | "register" | "reset";

export function CustomerAccountView({ mode }: { mode: AccountMode }) {
  const router = useRouter();
  const { customer, loading, refresh, logout } = useCustomerAuth();

  if (mode === "account") {
    return (
      <AccountShell title="Minha conta" description="Dados usados nos seus próximos pedidos.">
        {loading ? <AccountText>Carregando...</AccountText> : customer ? (
          <>
            <AccountDetails>
              <AccountDetail><AccountLabel>Nome</AccountLabel><AccountValue>{customer.name}</AccountValue></AccountDetail>
              <AccountDetail><AccountLabel>WhatsApp</AccountLabel><AccountValue>{customer.phone}</AccountValue></AccountDetail>
              <AccountDetail><AccountLabel>Nascimento</AccountLabel><AccountValue>{customer.birthDate}</AccountValue></AccountDetail>
            </AccountDetails>
            <AccountActions>
              <Button type="button" onClick={() => router.push("/orders")}>Meus pedidos</Button>
              <Button type="button" variant="outline" onClick={async () => { await logout(); router.push("/"); }}>
                <LogOut size={16} /> Sair
              </Button>
            </AccountActions>
          </>
        ) : (
          <AccountActions>
            <Button type="button" onClick={() => router.push("/account/login")}><LogIn size={16} /> Entrar</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/account/register")}><UserPlus size={16} /> Criar conta</Button>
          </AccountActions>
        )}
      </AccountShell>
    );
  }

  if (mode === "register") {
    return <RegisterForm onAuthenticated={async () => { await refresh(); router.push("/"); }} />;
  }
  if (mode === "reset") {
    return <ResetForm />;
  }
  return <LoginForm onAuthenticated={async () => { await refresh(); router.push("/"); }} />;
}

function AccountShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <PageShell>
      <AccountContent>
        <BackButton onClick={() => router.push("/")} />
        <AccountCard>
          <AccountHeader><AccountTitle>{title}</AccountTitle><AccountText>{description}</AccountText></AccountHeader>
          {children}
        </AccountCard>
      </AccountContent>
    </PageShell>
  );
}

function LoginForm({ onAuthenticated }: { onAuthenticated: () => Promise<void> }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema), defaultValues: { phone: "", password: "" } });
  return (
    <AccountShell title="Entrar" description="Use seu WhatsApp e senha para acessar pedidos e endereço.">
      <AccountForm onSubmit={form.handleSubmit(async (values) => {
        setError("");
        try { await customerAuthApi<{ ok: boolean }>("login", { method: "POST", body: JSON.stringify(values) }); await onAuthenticated(); }
        catch { setError("WhatsApp ou senha inválidos."); }
      })}>
        <Field label="WhatsApp" error={form.formState.errors.phone?.message}><Input inputMode="tel" autoComplete="tel" {...form.register("phone")} /></Field>
        <Field label="Senha" error={form.formState.errors.password?.message}><Input type="password" autoComplete="current-password" {...form.register("password")} /></Field>
        {error ? <AccountError>{error}</AccountError> : null}
        <Button type="submit" disabled={form.formState.isSubmitting}><LogIn size={16} /> Entrar</Button>
        <AccountActions>
          <AccountLink type="button" onClick={() => router.push("/account/register")}>Criar conta</AccountLink>
          <AccountLink type="button" onClick={() => router.push("/account/reset-password")}>Esqueci minha senha</AccountLink>
        </AccountActions>
      </AccountForm>
    </AccountShell>
  );
}

function RegisterForm({ onAuthenticated }: { onAuthenticated: () => Promise<void> }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema), defaultValues: { phone: "", name: "", birthDate: "", password: "" } });
  return (
    <AccountShell title="Criar conta" description="Cadastro opcional para usar seus dados em qualquer navegador.">
      <AccountForm onSubmit={form.handleSubmit(async (values) => {
        setError("");
        try { await customerAuthApi<{ ok: boolean }>("register", { method: "POST", body: JSON.stringify(values) }); await onAuthenticated(); }
        catch { setError("Não foi possível criar a conta. Confira os dados ou use outro número."); }
      })}>
        <Field label="Nome" error={form.formState.errors.name?.message}><Input autoComplete="name" {...form.register("name")} /></Field>
        <Field label="WhatsApp" error={form.formState.errors.phone?.message}><Input inputMode="tel" autoComplete="tel" {...form.register("phone")} /></Field>
        <Field label="Data de nascimento" error={form.formState.errors.birthDate?.message}><Input type="date" autoComplete="bday" {...form.register("birthDate")} /></Field>
        <Field label="Senha" error={form.formState.errors.password?.message}><Input type="password" autoComplete="new-password" {...form.register("password")} /></Field>
        {error ? <AccountError>{error}</AccountError> : null}
        <Button type="submit" disabled={form.formState.isSubmitting}><UserPlus size={16} /> Criar conta</Button>
        <AccountLink type="button" onClick={() => router.push("/account/login")}>Já tenho conta</AccountLink>
      </AccountForm>
    </AccountShell>
  );
}

function ResetForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const requestForm = useForm<z.infer<typeof resetRequestSchema>>({ resolver: zodResolver(resetRequestSchema), defaultValues: { phone: "" } });
  const confirmForm = useForm<z.infer<typeof resetConfirmSchema>>({ resolver: zodResolver(resetConfirmSchema), defaultValues: { code: "", newPassword: "" } });
  return (
    <AccountShell title="Redefinir senha" description="Enviaremos um código para o WhatsApp cadastrado.">
      {!requested ? (
        <AccountForm onSubmit={requestForm.handleSubmit(async (values) => {
          setError("");
          try { await clientApi("customer/auth/password-reset/request", { method: "POST", body: JSON.stringify(values) }); setPhone(values.phone); setRequested(true); }
          catch { setError("Não foi possível solicitar o código."); }
        })}>
          <Field label="WhatsApp" error={requestForm.formState.errors.phone?.message}><Input inputMode="tel" {...requestForm.register("phone")} /></Field>
          {error ? <AccountError>{error}</AccountError> : null}
          <Button type="submit" disabled={requestForm.formState.isSubmitting}>Enviar código</Button>
        </AccountForm>
      ) : (
        <AccountForm onSubmit={confirmForm.handleSubmit(async (values) => {
          setError(""); setSuccess("");
          try { await clientApi("customer/auth/password-reset/confirm", { method: "POST", body: JSON.stringify({ phone, ...values }) }); setSuccess("Senha alterada. Você já pode entrar."); }
          catch { setError("Código inválido ou expirado."); }
        })}>
          <Field label="Código" error={confirmForm.formState.errors.code?.message}><Input inputMode="numeric" maxLength={6} {...confirmForm.register("code")} /></Field>
          <Field label="Nova senha" error={confirmForm.formState.errors.newPassword?.message}><Input type="password" autoComplete="new-password" {...confirmForm.register("newPassword")} /></Field>
          {error ? <AccountError>{error}</AccountError> : null}
          {success ? <AccountSuccess>{success}</AccountSuccess> : null}
          <Button type="submit" disabled={confirmForm.formState.isSubmitting}>Alterar senha</Button>
          {success ? <AccountLink type="button" onClick={() => router.push("/account/login")}>Ir para login</AccountLink> : null}
        </AccountForm>
      )}
    </AccountShell>
  );
}
