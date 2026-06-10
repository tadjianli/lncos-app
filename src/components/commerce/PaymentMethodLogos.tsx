"use client";

import type { ReactNode } from "react";

/** Logos de paiement officiels (SVG) — taille uniforme, pas de texte de remplacement */

const LOGO_CLASS = "trust-badges__pay-logo";

function LogoWrap({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className={LOGO_CLASS} role="img" aria-label={label}>
      {children}
    </span>
  );
}

export function VisaLogo() {
  return (
    <LogoWrap label="Visa">
      <svg viewBox="0 0 48 16" xmlns="http://www.w3.org/2000/svg" aria-hidden focusable="false">
        <rect width="48" height="16" rx="2" fill="#1A1F71" />
        <path
          fill="#fff"
          d="M19.5 11.2h-2.3l1.4-8.5h2.3l-1.4 8.5zm9.8-5.5c-.5-.2-1.2-.4-2.1-.4-2.3 0-3.9 1.2-3.9 2.9 0 1.3 1.2 2 2.1 2.4.9.5 1.2.8 1.2 1.2 0 .7-.7 1-1.4 1-.9 0-1.4-.1-2.2-.5l-.3-.1-.3 2c.6.3 1.7.5 2.8.5 2.4 0 4-1.2 4-3 0-1-.6-1.7-2-2.3-.8-.4-1.3-.7-1.3-1.1 0-.4.4-.8 1.3-.8.7 0 1.3.2 1.7.3l.2.1.3-1.9zm6.5 3.5c.2-1.1.9-2.7 1.4-3.6l.1-.2h-2.2c-.1 0-.2.1-.3.3l-1.5 7.2h2.3l.6-3.4.7 3.4h2.3l1.6-8.5h-2.3l-1 5.8-.7-5.8h-2.4l-1.6 8.5h2.2l.7-3.4zm8.8-5.5l-2.2 8.5h2.2l2.2-8.5h-2.2zM14.2 2.7l-2.2 8.5h2.2l.5-1.3h2.7l.3 1.3h2.4L17.2 2.7h-3zm.5 5.2l1-2.6.6 2.6h-1.6z"
        />
        <path fill="#F9A533" d="M9.2 2.7L7.1 9.8c0 .1-.1.2-.3.2H4.5L6.8 2.7h2.4z" />
      </svg>
    </LogoWrap>
  );
}

export function MastercardLogo() {
  return (
    <LogoWrap label="Mastercard">
      <svg viewBox="0 0 48 30" xmlns="http://www.w3.org/2000/svg" aria-hidden focusable="false">
        <rect width="48" height="30" rx="3" fill="#252525" />
        <circle cx="19" cy="15" r="9" fill="#EB001B" />
        <circle cx="29" cy="15" r="9" fill="#F79E1B" />
        <path
          fill="#FF5F00"
          d="M24 8.2a9 9 0 0 0-3.4 6.8A9 9 0 0 0 24 21.8a9 9 0 0 0 3.4-6.8A9 9 0 0 0 24 8.2z"
        />
      </svg>
    </LogoWrap>
  );
}

export function ApplePayLogo() {
  return (
    <LogoWrap label="Apple Pay">
      <svg viewBox="0 0 48 30" xmlns="http://www.w3.org/2000/svg" aria-hidden focusable="false">
        <rect width="48" height="30" rx="4" fill="#000" />
        <path
          fill="#fff"
          d="M12.2 10.2c-.7.8-1.8 1.4-2.9 1.3-.1-1.1.4-2.3 1-3  .6-.8 1.7-1.4 2.6-1.4.1 1.1-.3 2.2-.7 3.1zm.7 1.1c-1.5-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.7 1.1 8.9.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.8 3-.8 1.4 0 1.7.8 3 .8 1.2 0 2-1.1 2.7-2.2.9-1.2 1.2-2.4 1.2-2.5-.1 0-2.4-.9-2.4-3.6 0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8z"
        />
        <path
          fill="#fff"
          d="M28.2 9.5v10.8h1.6v-3.7h2.2c2 0 3.5-1.1 3.5-3.5 0-2.1-1.3-3.6-3.7-3.6h-3.6zm1.6 1.4h1.9c1.4 0 2.2.8 2.2 2.2 0 1.4-.8 2.2-2.2 2.2h-1.9V10.9zm7.5 9.4c1.5 0 2.4-.7 2.9-1.8l-1.4-.7c-.3.8-1 1.3-1.8 1.3-1.2 0-2-1-2-2.5 0-1.5.8-2.5 2-2.5.8 0 1.4.5 1.8 1.3l1.4-.7c-.5-1.1-1.4-1.8-2.9-1.8-2.1 0-3.6 1.5-3.6 3.7 0 2.2 1.5 3.7 3.6 3.7z"
        />
      </svg>
    </LogoWrap>
  );
}

export function GooglePayLogo() {
  return (
    <LogoWrap label="Google Pay">
      <svg viewBox="0 0 48 30" xmlns="http://www.w3.org/2000/svg" aria-hidden focusable="false">
        <rect width="48" height="30" rx="4" fill="#fff" />
        <path fill="#4285F4" d="M23.2 14.5v3.1h4.3c-.2 1-1 2.5-2.2 3.2l-.1.1 3.2 2.5.2-.1c1.3-1.2 2.1-3 2.1-5.2 0-.5 0-1-.1-1.5H23.2z" />
        <path fill="#34A853" d="M16.8 17.9l-.1-.1-2.5 1.9-.1.1c1.2 2.4 3.7 4 6.5 4 2 0 3.7-.8 4.9-2.1l-3.2-2.5c-.9.6-2 .9-3.2.9-2.4 0-4.4-1.6-5.1-3.8z" />
        <path fill="#FBBC05" d="M11.6 10.6c-.4 1.1-.4 2.3 0 3.4l4.9 3.8c.6-1.9 2.4-3.2 4.5-3.2 1.1 0 2.1.4 2.9 1l3.7-2.9c-1.6-2.3-4.2-3.7-7.2-3.7-2.8 0-5.3 1.4-6.8 3.6z" />
        <path fill="#EA4335" d="M16.8 8.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8C21.3 5.2 19.1 4.2 16.8 4.2c-2.8 0-5.3 1.4-6.8 3.6l4.9 3.8c.7-2.2 2.7-3.5 5.1-3.5z" />
        <path
          fill="#5F6368"
          d="M30.5 10.2h-1.5v9.6h1.5V10.2zm3.2 0h-4.3v1.3h1.6v8.3h1.5v-8.3h1.2V10.2zm5.5 6.8c0-1.8-1-3-2.6-3-1.5 0-2.6 1.2-2.6 3s1.1 3 2.7 3c.8 0 1.5-.3 2-.8l-1-.9c-.3.3-.7.5-1.1.5-.7 0-1.2-.5-1.3-1.3h3.8v-.5zm-3.8-.8c.1-.8.6-1.3 1.3-1.3.7 0 1.2.5 1.3 1.3h-2.6z"
        />
      </svg>
    </LogoWrap>
  );
}

export function PayPalLogo() {
  return (
    <LogoWrap label="PayPal">
      <svg viewBox="0 0 48 30" xmlns="http://www.w3.org/2000/svg" aria-hidden focusable="false">
        <rect width="48" height="30" rx="3" fill="#fff" />
        <path
          fill="#003087"
          d="M17.8 8.5h-4.8c-.3 0-.6.2-.7.5l-2 12.5c0 .2.2.4.4.4h2.3l.5-3.2h2c2.8 0 4.4-1.4 4.8-4.1.2-1.2 0-2.1-.6-2.8-.7-.8-1.9-1.3-3.6-1.3zm.4 4c-.2 1.5-1.4 1.5-2.5 1.5h-1.3l.7-4.5h1.5c.7 0 1.3 0 1.6.4.3.3.4.8.3 1.6z"
        />
        <path
          fill="#0070E0"
          d="M28.5 8.5h-4.8c-.3 0-.6.2-.7.5l-2 12.5c0 .2.2.4.4.4h2.2c.3 0 .6-.2.7-.5l.6-3.7c0-.3.3-.5.6-.5h1.2c2.8 0 4.4-1.1 4.8-3.5.2-1 .1-1.8-.4-2.4-.6-.7-1.6-1.1-3.1-1.1zm.5 4c-.2 1.5-1.3 1.5-2.4 1.5h-1.2l.7-4.3h1.4c.7 0 1.2 0 1.5.3.3.3.4.8.3 1.5z"
        />
      </svg>
    </LogoWrap>
  );
}

export function StripeLogo() {
  return (
    <LogoWrap label="Stripe">
      <svg viewBox="0 0 48 30" xmlns="http://www.w3.org/2000/svg" aria-hidden focusable="false">
        <rect width="48" height="30" rx="3" fill="#635BFF" />
        <path
          fill="#fff"
          d="M22.1 12.4c0-.8-.6-1.1-1.7-1.1-1.7 0-3.9.5-3.9 3.5v.5h5.6zm-5.6 1.8c0 2.2 1.3 3.3 3.9 3.3 1.2 0 2.3-.2 3.2-.6v-2.4c-.8.4-1.7.6-2.7.6-1 0-1.5-.3-1.5-.9 0-.6.5-.9 1.6-.9 1.2 0 2.3.3 3.3.8V11.1c-.9-.4-2-.6-3.3-.6-3.4 0-5.5 1.8-5.5 4.5 0 2.8 2 4.2 5.2 4.2 1.3 0 2.5-.2 3.5-.6v-2.5c-.9.4-1.9.6-3 .6-1.1 0-1.7-.3-1.7-.9zM34.6 9.8c-1.2 0-2.1.6-2.6 1.5l-.1-.1v-1.2h-2.7v9.6h2.8v-5.2c0-1.2.6-1.9 1.6-1.9.9 0 1.4.6 1.4 1.7v5.4h2.8v-5.8c0-2.3-1.2-3.4-3.2-3.4z"
        />
      </svg>
    </LogoWrap>
  );
}

export function PaymentMethodLogos() {
  return (
    <div className="trust-badges__payments" aria-label="Moyens de paiement acceptés">
      <VisaLogo />
      <MastercardLogo />
      <ApplePayLogo />
      <GooglePayLogo />
      <PayPalLogo />
      <StripeLogo />
    </div>
  );
}
