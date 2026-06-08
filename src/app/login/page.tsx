import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="adm-login-page" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
