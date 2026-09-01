import { getAdminUser, getAdminUsers } from "@/services/api/server";
import { UserManager } from "./UserManager";

export async function AdminUsersView() {
  const [users, currentAdmin] = await Promise.all([
    getAdminUsers(),
    getAdminUser(),
  ]);

  return (
    <UserManager
      initialUsers={users}
      currentAdminId={currentAdmin?.id ?? ""}
    />
  );
}
