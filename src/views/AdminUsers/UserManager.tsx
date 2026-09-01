"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Save, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { Field, Input, Select } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type { AdminUserResponse } from "@/types/api";
import {
  Actions,
  Card,
  CardActions,
  CardHeader,
  CardTitle,
  CheckboxLabel,
  Empty,
  ErrorText,
  Form,
  GridTwo,
  List,
  Muted,
  PaneGrid,
  RoleBadge,
  Root,
  Section,
  SectionHeader,
  SectionHelp,
  SectionTitle,
  StatusBadge,
  Subtitle,
  Title,
} from "./styles";

const userSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z
    .string()
    .max(72, "A senha deve ter no máximo 72 caracteres.")
    .refine(
      (password) => password.length === 0 || password.length >= 8,
      "A senha deve ter pelo menos 8 caracteres.",
    ),
  role: z.enum(["ADMIN", "STANDARD"]),
  active: z.boolean(),
});

type UserForm = z.infer<typeof userSchema>;

type UserManagerProps = {
  initialUsers: AdminUserResponse[];
  currentAdminId: string;
};

const defaultUserForm = (): UserForm => ({
  email: "",
  password: "",
  role: "STANDARD",
  active: true,
});

export function UserManager({
  initialUsers,
  currentAdminId,
}: UserManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { requestConfirmation } = useConfirmation();
  const { showToast } = useToast();
  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultUserForm(),
  });
  const isEditing = Boolean(editingUserId);

  function resetForm() {
    setEditingUserId(null);
    setError("");
    form.reset(defaultUserForm());
  }

  function startEdit(user: AdminUserResponse) {
    setEditingUserId(user.id);
    setError("");
    form.reset({
      email: user.email,
      password: "",
      role: user.role,
      active: user.active,
    });
  }

  async function submit(values: UserForm) {
    if (!editingUserId && !values.password) {
      form.setError("password", {
        message: "Informe uma senha com pelo menos 8 caracteres.",
      });
      return;
    }

    setError("");
    const path = editingUserId
      ? `admin/users/${editingUserId}`
      : "admin/users";
    const body = editingUserId
      ? {
          email: values.email,
          role: values.role,
          active: values.active,
          ...(values.password ? { password: values.password } : {}),
        }
      : {
          email: values.email,
          password: values.password,
          role: values.role,
        };

    try {
      const saved = await clientApi<AdminUserResponse>(path, {
        method: editingUserId ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      setUsers((currentUsers) =>
        (editingUserId
          ? currentUsers.map((user) => (user.id === saved.id ? saved : user))
          : [...currentUsers, saved]
        ).sort((left, right) => left.email.localeCompare(right.email)),
      );
      resetForm();
      showToast("Usuário salvo com sucesso");
    } catch {
      const message = "Não foi possível salvar o usuário.";
      setError(message);
      showToast(message, "error");
    }
  }

  async function deleteUser(user: AdminUserResponse) {
    const confirmed = await requestConfirmation({
      message: `Deseja excluir o usuário ${user.email}?`,
      confirmLabel: "Excluir",
    });
    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingUserId(user.id);
    try {
      await clientApi<void>(`admin/users/${user.id}`, { method: "DELETE" });
      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== user.id),
      );
      if (editingUserId === user.id) {
        resetForm();
      }
      showToast("Usuário excluído com sucesso");
    } catch {
      const message = "Não foi possível excluir o usuário.";
      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingUserId(null);
    }
  }

  return (
    <Root>
      <div>
        <Title>Usuários</Title>
        <Subtitle>Contas e permissões de acesso ao admin.</Subtitle>
      </div>

      {error ? <ErrorText>{error}</ErrorText> : null}

      <PaneGrid>
        <Section>
          <SectionHeader>
            <div>
              <SectionTitle>
                {isEditing ? "Alterar usuário" : "Adicionar usuário"}
              </SectionTitle>
              <SectionHelp>
                Administradores têm acesso total; usuários padrão não acessam
                análises, configurações ou gestão de usuários.
              </SectionHelp>
            </div>
            {isEditing ? (
              <Button type="button" variant="ghost" onClick={resetForm}>
                <X size={16} />
                Cancelar
              </Button>
            ) : null}
          </SectionHeader>

          <Form onSubmit={form.handleSubmit(submit)}>
            <GridTwo>
              <Field label="E-mail" error={form.formState.errors.email?.message}>
                <Input type="email" autoComplete="off" {...form.register("email")} />
              </Field>
              <Field
                label={isEditing ? "Nova senha (opcional)" : "Senha"}
                error={form.formState.errors.password?.message}
              >
                <Input
                  type="password"
                  autoComplete="new-password"
                  {...form.register("password")}
                />
              </Field>
              <Field label="Permissão" error={form.formState.errors.role?.message}>
                <Select {...form.register("role")}>
                  <option value="STANDARD">Padrão</option>
                  <option value="ADMIN">Administrador</option>
                </Select>
              </Field>
              {isEditing ? (
                <CheckboxLabel>
                  <input type="checkbox" {...form.register("active")} />
                  Usuário ativo
                </CheckboxLabel>
              ) : null}
            </GridTwo>
            <Actions>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {isEditing ? <Save size={16} /> : <UserPlus size={16} />}
                {isEditing ? "Salvar usuário" : "Criar usuário"}
              </Button>
            </Actions>
          </Form>
        </Section>

        <Section>
          <div>
            <SectionTitle>Usuários cadastrados</SectionTitle>
            <SectionHelp>{users.length} usuário(s) neste restaurante</SectionHelp>
          </div>

          {users.length === 0 ? (
            <Empty>Nenhum usuário cadastrado.</Empty>
          ) : (
            <List>
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div>
                      <CardTitle>{user.email}</CardTitle>
                      <Muted>
                        {user.id === currentAdminId ? "Sua conta" : "Conta do admin"}
                      </Muted>
                    </div>
                    <ShieldCheck size={18} />
                  </CardHeader>
                  <div>
                    <RoleBadge data-admin={user.role === "ADMIN"}>
                      {user.role === "ADMIN" ? "Administrador" : "Padrão"}
                    </RoleBadge>
                    <StatusBadge data-active={user.active}>
                      {user.active ? "Ativo" : "Inativo"}
                    </StatusBadge>
                  </div>
                  <CardActions>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => startEdit(user)}
                      disabled={editingUserId === user.id}
                    >
                      <Pencil size={16} />
                      {editingUserId === user.id ? "Editando" : "Editar"}
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => void deleteUser(user)}
                      disabled={
                        user.id === currentAdminId || deletingUserId === user.id
                      }
                      title={
                        user.id === currentAdminId
                          ? "Sua própria conta não pode ser excluída"
                          : undefined
                      }
                    >
                      <Trash2 size={16} />
                      {deletingUserId === user.id ? "Excluindo..." : "Excluir"}
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </List>
          )}
        </Section>
      </PaneGrid>
    </Root>
  );
}
