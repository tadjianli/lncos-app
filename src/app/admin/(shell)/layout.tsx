import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
