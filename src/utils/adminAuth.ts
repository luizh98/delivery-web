import { z } from "zod";

export const adminPhoneSchema = z.string().trim().max(30, "O celular deve ter no máximo 30 caracteres.").refine(
  (value) => {
    if (!value) return true;
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("55") && (value.startsWith("+") || digits.length > 11)) {
      digits = digits.slice(2);
    }
    return /^\d{10,11}$/.test(digits);
  },
  "Informe o celular com DDD, com 10 ou 11 dígitos.",
);

export const adminLoginSchema = z.object({
  identifier: z.string().trim().min(1, "Informe o e-mail ou celular.").refine(
    (value) => value.includes("@")
      ? z.email().safeParse(value).success
      : adminPhoneSchema.safeParse(value).success,
    "Informe um e-mail válido ou celular com DDD.",
  ),
  password: z.string().min(1, "Informe a senha."),
});
