import { redirect } from "next/navigation";

export default function CustomerResetPasswordPage() {
  redirect("/login/reset-password");
}
