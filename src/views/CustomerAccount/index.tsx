"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import { useCustomerAuth } from "@/components/CustomerAuthProvider";
import { Field, Input } from "@/components/Field";
import { PageShell } from "@/components/PageShell";
import { clientApi, customerAuthApi } from "@/services/api/client";
import {
  brazilianDateToIso,
  formatBrazilianDateInput,
  formatIsoDateToBrazilian,
  formatBrazilianMobileInput,
  isValidBrazilianMobile,
  isValidPastBrazilianDate,
  normalizeBrazilianMobile,
} from "@/utils/customerInput";
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
  phone: z.string().refine(isValidBrazilianMobile, "Informe um celular válido com DDD."),
  password: z.string().min(1, "Informe a senha."),
});
const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Informe o nome."),
  birthDate: z.string().refine(isValidPastBrazilianDate, "Informe uma data válida em DD/MM/AAAA."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});
const resetRequestSchema = z.object({
  phone: z.string().refine(isValidBrazilianMobile, "Informe um celular válido com DDD."),
});
const resetConfirmSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Informe o código de 6 dígitos."),
  newPassword: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});

type AccountMode = "login" | "profile" | "reset";

export function CustomerAccountView({ mode }: { mode: AccountMode }) {
  const router = useRouter();
  const { refresh } = useCustomerAuth();

  if (mode === "reset") {
    return <ResetForm />;
  }
  if (mode === "profile") {
    return <ProfileView />;
  }
  return <LoginForm onAuthenticated={async () => { await refresh(); router.push("/"); }} />;
}

function ProfileView() {
  const router = useRouter();
  const { customer, loading } = useCustomerAuth();

  useEffect(() => {
    if (!loading && !customer) {
      router.replace("/login");
    }
  }, [customer, loading, router]);

  if (loading || !customer) {
    return <AccountShell title="Minha conta" description="Carregando seus dados..." />;
  }

  return (
    <AccountShell title="Minha conta" description="Confira seus dados cadastrados.">
      <AccountDetails>
        <AccountDetail>
          <AccountLabel>Nome</AccountLabel>
          <AccountValue>{customer.name}</AccountValue>
        </AccountDetail>
        <AccountDetail>
          <AccountLabel>Celular</AccountLabel>
          <AccountValue>{formatBrazilianMobileInput(customer.phone)}</AccountValue>
        </AccountDetail>
        <AccountDetail>
          <AccountLabel>Data de nascimento</AccountLabel>
          <AccountValue>{formatIsoDateToBrazilian(customer.birthDate)}</AccountValue>
        </AccountDetail>
      </AccountDetails>
    </AccountShell>
  );
}

function AccountShell({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
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
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema), defaultValues: { phone: "", password: "" } });

  if (showRegister) {
    return <RegisterForm onAuthenticated={onAuthenticated} onBack={() => setShowRegister(false)} />;
  }

  return (
    <AccountShell title="Entrar" description="Use seu celular e senha para acessar pedidos e endereço.">
      <AccountForm onSubmit={form.handleSubmit(async (values) => {
        setError("");
        try { await customerAuthApi<{ ok: boolean }>("login", { method: "POST", body: JSON.stringify({ ...values, phone: normalizeBrazilianMobile(values.phone) }) }); await onAuthenticated(); }
        catch { setError("Celular ou senha inválidos."); }
      })}>
        <Field label="Celular" error={form.formState.errors.phone?.message}>
          <Input inputMode="numeric" autoComplete="tel" maxLength={17} {...form.register("phone")} onInput={formatMobileInput} />
        </Field>
        <Field label="Senha" error={form.formState.errors.password?.message}><Input type="password" autoComplete="current-password" {...form.register("password")} /></Field>
        {error ? <AccountError>{error}</AccountError> : null}
        <Button type="submit" disabled={form.formState.isSubmitting}><LogIn size={16} /> Entrar</Button>
        <AccountActions>
          <AccountLink type="button" onClick={() => setShowRegister(true)}>Criar conta</AccountLink>
          <AccountLink type="button" onClick={() => router.push("/login/reset-password")}>Esqueci minha senha</AccountLink>
        </AccountActions>
      </AccountForm>
    </AccountShell>
  );
}

function RegisterForm({ onAuthenticated, onBack }: { onAuthenticated: () => Promise<void>; onBack: () => void }) {
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema), defaultValues: { phone: "", name: "", birthDate: "", password: "" } });
  return (
    <AccountShell title="Criar conta" description="Cadastro opcional para usar seus dados em qualquer navegador.">
      <AccountForm onSubmit={form.handleSubmit(async (values) => {
        setError("");
        const birthDate = brazilianDateToIso(values.birthDate);
        try { await customerAuthApi<{ ok: boolean }>("register", { method: "POST", body: JSON.stringify({ ...values, phone: normalizeBrazilianMobile(values.phone), birthDate }) }); await onAuthenticated(); }
        catch { setError("Não foi possível criar a conta. Confira os dados ou use outro número."); }
      })}>
        <Field label="Nome" error={form.formState.errors.name?.message}><Input autoComplete="name" {...form.register("name")} /></Field>
        <Field label="Celular" error={form.formState.errors.phone?.message}>
          <Input inputMode="numeric" autoComplete="tel" maxLength={17} {...form.register("phone")} onInput={formatMobileInput} />
        </Field>
        <Field label="Data de nascimento" error={form.formState.errors.birthDate?.message}>
          <Input inputMode="numeric" placeholder="DD/MM/AAAA" maxLength={10} autoComplete="bday" {...form.register("birthDate")} onInput={formatBirthDateInput} />
        </Field>
        <Field label="Senha" error={form.formState.errors.password?.message}><Input type="password" autoComplete="new-password" {...form.register("password")} /></Field>
        {error ? <AccountError>{error}</AccountError> : null}
        <Button type="submit" disabled={form.formState.isSubmitting}><UserPlus size={16} /> Criar conta</Button>
        <AccountLink type="button" onClick={onBack}>Já tenho conta</AccountLink>
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
    <AccountShell title="Redefinir senha" description="Enviaremos um código para o celular cadastrado.">
      {!requested ? (
        <AccountForm onSubmit={requestForm.handleSubmit(async (values) => {
          setError("");
          const normalizedPhone = normalizeBrazilianMobile(values.phone);
          try { await clientApi("customer/auth/password-reset/request", { method: "POST", body: JSON.stringify({ phone: normalizedPhone }) }); setPhone(normalizedPhone); setRequested(true); }
          catch { setError("Não foi possível solicitar o código."); }
        })}>
          <Field label="Celular" error={requestForm.formState.errors.phone?.message}>
            <Input inputMode="numeric" autoComplete="tel" maxLength={17} {...requestForm.register("phone")} onInput={formatMobileInput} />
          </Field>
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
          {success ? <AccountLink type="button" onClick={() => router.push("/login")}>Ir para login</AccountLink> : null}
        </AccountForm>
      )}
    </AccountShell>
  );
}

function formatMobileInput(event: React.FormEvent<HTMLInputElement>) {
  event.currentTarget.value = formatBrazilianMobileInput(event.currentTarget.value);
}

function formatBirthDateInput(event: React.FormEvent<HTMLInputElement>) {
  event.currentTarget.value = formatBrazilianDateInput(event.currentTarget.value);
}
