"use client";

import type { ReactNode } from "react";

/** Hauteur visuelle uniforme — ajustée au viewport pour tenir sur une ligne mobile */
export const PAYMENT_LOGO_HEIGHT = 20;

function PayLogo({
  label,
  viewBox,
  children,
}: {
  label: string;
  viewBox: string;
  children: ReactNode;
}) {
  return (
    <li className="payment-methods__item">
      <span className="payment-methods__logo" role="img" aria-label={label}>
        <svg
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          focusable="false"
          preserveAspectRatio="xMidYMid meet"
          className="payment-methods__svg"
        >
          {children}
        </svg>
      </span>
    </li>
  );
}

function VisaLogo() {
  return (
    <PayLogo label="Visa" viewBox="0 0 48 16">
      <path
        fill="#FFFFFF"
        d="M19.2 13.2h-3.1L18.6 2.8h3.1l-2.5 10.4zm9.2-5.5c-.6-.2-1.6-.4-2.8-.4-3.1 0-5.2 1.5-5.2 3.7 0 1.6 1.5 2.5 2.6 3.1 1.1.6 1.5 1 1.5 1.5 0 .9-1 1.3-1.9 1.3-1.2 0-1.9-.2-3-.6l-.5-.2-.4 2.5c1 .5 2.3.8 3.8.8 3.2 0 5.4-1.5 5.4-3.8 0-1.3-.9-2.2-2.7-3-.1-.5-1.8-.9-1.8-1.4 0-.5.6-1 1.8-1 .9 0 1.7.2 2.3.4l.3.1.4-2.4zm7.7 5.5h2.9l2.3-10.4h-2.9l-1.4 7.2-1.6-7.2h-3.1l-2.5 10.4h2.8l1.3-5.9 1.5 5.9z"
      />
      <path fill="rgba(255,255,255,0.72)" d="M9.5 2.8 7.2 10.4c-.1.2-.3.3-.5.3H4.2l2.8-8h2.5z" />
    </PayLogo>
  );
}

function MastercardLogo() {
  return (
    <PayLogo label="Mastercard" viewBox="0 0 36 22">
      <circle cx="13" cy="11" r="8.5" fill="#EB001B" />
      <circle cx="23" cy="11" r="8.5" fill="#F79E1B" />
      <path fill="#FF5F00" d="M18 4.8a8.5 8.5 0 0 0 0 12.4 8.5 8.5 0 0 0 0-12.4z" />
    </PayLogo>
  );
}

function ApplePayLogo() {
  return (
    <PayLogo label="Apple Pay" viewBox="0 0 52 22">
      <path
        fill="#FFFFFF"
        d="M11.8 5.2c-.6.7-1.6 1.2-2.6 1.1-.1-1 .3-2.1.9-2.8.6-.7 1.6-1.2 2.4-1.2.1 1-.3 2-.7 2.9zm.6 1c-1.4-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.7.8-3.4 2-1.5 2.4-.4 6 1 8 .7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.8.7 1.1 0 1.9-1 2.5-2 .4-.6.6-1.1.6-1.1s-2.2-.9-2.2-3.4c0-2.1 1.8-3.1 1.9-3.2-1-1.5-2.6-1.7-3.2-1.7z"
      />
      <path
        fill="#FFFFFF"
        d="M26.2 6.2v9.6h1.5v-3.3h2c1.8 0 3.2-1 3.2-3.1 0-1.9-1.2-3.2-3.4-3.2h-3.3zm1.5 1.3h1.7c1.3 0 2 .7 2 2 0 1.3-.7 2-2 2h-1.7V7.5zm6.9 8.3c1.4 0 2.2-.6 2.7-1.6l-1.3-.6c-.3.7-.9 1.2-1.7 1.2-1.1 0-1.9-.9-1.9-2.2 0-1.4.8-2.2 1.9-2.2.7 0 1.3.4 1.7 1.2l1.3-.6c-.5-1-1.3-1.6-2.7-1.6-2 0-3.4 1.4-3.4 3.4 0 2 1.4 3.4 3.4 3.4zm5.8-8.3v9.6h1.5V7.5h-1.5zm3.2 0v9.6h1.4v-3.9l3.4 3.9h1.9l-3.6-4 3.4-3.9h-1.8l-3.1 3.6V7.5h-1.6z"
      />
    </PayLogo>
  );
}

function PayPalLogo() {
  return (
    <PayLogo label="PayPal" viewBox="0 0 56 14">
      <path
        fill="#009CDE"
        d="M21.8 2.8h-4.5c-.3 0-.5.2-.6.4l-1.9 11.6c0 .2.1.3.3.3h2.2l.5-3h1.9c2.6 0 4.1-1.3 4.5-3.8.2-1.1 0-1.9-.6-2.6-.6-.7-1.8-1.2-3.3-1.2zm.4 3.7c-.2 1.4-1.3 1.4-2.3 1.4h-1.2l.7-4.2h1.4c.7 0 1.2 0 1.5.3.3.3.4.8.3 1.5z"
      />
      <path
        fill="#003087"
        d="M31.8 2.8h-4.5c-.3 0-.5.2-.6.4l-1.9 11.6c0 .2.1.3.3.3h2.1c.2 0 .5-.2.6-.4l.5-3.4c0-.3.3-.5.5-.5h1.1c2.6 0 4.1-1 4.5-3.2.2-1 0-1.7-.4-2.2-.6-.6-1.5-1-2.9-1zm.4 3.7c-.2 1.4-1.2 1.4-2.2 1.4h-1.1l.6-4h1.3c.6 0 1.1 0 1.4.3.3.2.4.7.3 1.3z"
      />
    </PayLogo>
  );
}

function GooglePayLogo() {
  return (
    <PayLogo label="Google Pay" viewBox="0 0 56 22">
      <path
        fill="#4285F4"
        d="M24.8 11.2v2.8h3.9c-.2.9-.9 2.3-2 2.9l-.1.1 2.9 2.2.2-.1c1.2-1.1 1.9-2.7 1.9-4.7 0-.5 0-.9-.1-1.4h-6.7z"
      />
      <path
        fill="#34A853"
        d="M18.9 14.3l-.1-.1-2.3 1.7-.1.1c1.1 2.2 3.4 3.6 5.9 3.6 1.8 0 3.3-.7 4.4-1.9l-2.9-2.2c-.8.5-1.8.8-2.9.8-2.2 0-4-1.5-4.6-3.5z"
      />
      <path
        fill="#FBBC05"
        d="M14.2 8.4c-.4 1-.4 2.1 0 3.1l4.4 3.4c.5-1.7 2.2-2.9 4.1-2.9 1 0 1.9.3 2.6.9l3.3-2.6C26.8 5.8 24.5 4.6 22 4.6c-2.5 0-4.8 1.3-6 3.2l4.2 3.2z"
      />
      <path
        fill="#EA4335"
        d="M18.9 6.5c1.3 0 2.5.5 3.4 1.3l2.5-2.5C23.2 4.2 21.2 3.3 18.9 3.3c-2.5 0-4.8 1.3-6 3.2l4.4 3.4c.6-2 2.4-3.2 4.6-3.2z"
      />
      <path
        fill="#FFFFFF"
        d="M31.8 6.8h-1.3v8.7h1.3V6.8zm2.9 0h-3.8v1.2h1.4v7.5h1.3V8h1.1V6.8zm5 5.9c0-1.6-.9-2.7-2.4-2.7-1.4 0-2.4 1.1-2.4 2.7s1 2.7 2.5 2.7c.7 0 1.3-.2 1.8-.7l-.9-.8c-.3.3-.6.4-1 .4-.6 0-1.1-.4-1.2-1.1h3.6v-.5zm-3.5-.7c.1-.7.6-1.2 1.2-1.2.6 0 1.1.5 1.2 1.2h-2.4z"
      />
    </PayLogo>
  );
}

const PAYMENT_LOGOS = [
  { id: "visa", Logo: VisaLogo },
  { id: "mastercard", Logo: MastercardLogo },
  { id: "apple-pay", Logo: ApplePayLogo },
  { id: "paypal", Logo: PayPalLogo },
  { id: "google-pay", Logo: GooglePayLogo },
] as const;

export function PaymentMethodLogos() {
  return (
    <section className="payment-methods" aria-labelledby="payment-methods-title">
      <div className="payment-methods__header">
        <span className="payment-methods__rule" aria-hidden />
        <h3 id="payment-methods-title" className="payment-methods__title">
          Moyens de paiement
        </h3>
        <span className="payment-methods__rule" aria-hidden />
      </div>

      <ul className="payment-methods__list">
        {PAYMENT_LOGOS.map(({ id, Logo }) => (
          <Logo key={id} />
        ))}
      </ul>
    </section>
  );
}

export { VisaLogo, MastercardLogo, ApplePayLogo, PayPalLogo, GooglePayLogo };
