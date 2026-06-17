import { Resend } from "resend";
import { getTransactionalEmailFrom } from "@/lib/branding";

let client: Resend | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

export function getEmailFrom(): string {
  return getTransactionalEmailFrom();
}
