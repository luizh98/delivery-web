import { getAdminTables } from "@/services/api/server";
import { TableManager } from "./TableManager";

export async function AdminTablesView() {
  const tables = await getAdminTables();

  return <TableManager initialTables={tables} />;
}
