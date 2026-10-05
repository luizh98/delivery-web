import { z } from "zod";

const templateName = z.string().trim().regex(/^[a-z0-9_]{1,512}$/, "Use o nome aprovado na Meta: letras minúsculas, números e sublinhado.");

export const whatsappSettingsSchema = z.object({
  whatsappPhoneNumberId: z.string().trim().regex(/^[0-9]{1,30}$/, "Informe o ID numérico do número na Meta."),
  whatsappAccessToken: z.string().trim().max(8192, "Token muito longo.").refine((value) => !/[\r\n]/.test(value), "Cole o token em uma única linha."),
  whatsappApiVersion: z.string().trim().regex(/^v[0-9]{1,3}\.0$/, "Use uma versão como v25.0."),
  whatsappProductionTemplate: templateName,
  whatsappDeliveryTemplate: templateName,
  whatsappCompletedTemplate: templateName,
  tokenConfigured: z.boolean(),
}).superRefine((values, context) => {
  if (!values.whatsappAccessToken && !values.tokenConfigured) {
    context.addIssue({ code: "custom", path: ["whatsappAccessToken"], message: "Informe o token para conectar este restaurante." });
  }
});
