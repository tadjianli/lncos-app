"use client";

import type {
  CheckoutAddress,
  CheckoutAddressFieldKey,
} from "@/lib/checkout-address";

interface CheckoutAddressStepProps {
  value: CheckoutAddress;
  onChange: (patch: Partial<CheckoutAddress>) => void;
  errors: Partial<Record<CheckoutAddressFieldKey, string>>;
  showErrors: boolean;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
}

export function CheckoutAddressStep({
  value,
  onChange,
  errors,
  showErrors,
  isLoggedIn,
  onOpenLogin,
}: CheckoutAddressStepProps) {
  const fields: {
    key: CheckoutAddressFieldKey;
    label: string;
    half: boolean;
    type?: string;
    autoComplete?: string;
  }[] = [
    { key: "email", label: "Email", half: false, type: "email", autoComplete: "email" },
    { key: "firstName", label: "Prénom", half: true, autoComplete: "given-name" },
    { key: "lastName", label: "Nom", half: true, autoComplete: "family-name" },
    { key: "address", label: "Adresse", half: false, autoComplete: "street-address" },
    { key: "zip", label: "Code postal", half: true, autoComplete: "postal-code" },
    { key: "city", label: "Ville", half: true, autoComplete: "address-level2" },
    { key: "phone", label: "Téléphone", half: false, type: "tel", autoComplete: "tel" },
  ];

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <h3 style={{ fontWeight: 600, fontSize: 19, color: "var(--ink)", margin: "0 0 12px" }}>
        Adresse de livraison
      </h3>

      {!isLoggedIn ? (
        <div className="checkout-login-prompt">
          <div>
            <div className="checkout-login-prompt__eyebrow">Déjà client ?</div>
            <div className="checkout-login-prompt__text">Connectez-vous pour préremplir vos informations.</div>
          </div>
          <button type="button" className="checkout-login-prompt__btn" onClick={onOpenLogin}>
            Se connecter
          </button>
        </div>
      ) : null}

      {showErrors && Object.keys(errors).length > 0 ? (
        <div className="checkout-address-errors">
          Veuillez remplir tous les champs obligatoires pour continuer.
        </div>
      ) : null}

      {fields.map(({ key, label, half, type, autoComplete }) => {
        const invalid = showErrors && !!errors[key];
        return (
          <div
            key={key}
            className="checkout-field-wrap"
            style={{
              flex: half ? "1 1 0" : "1 1 100%",
              display: "inline-block",
              width: half ? "calc(50% - 6px)" : "100%",
              marginRight: half ? "12px" : 0,
            }}
          >
            <label className="checkout-field">
              <span className="checkout-field__label">
                {label}
                <span className="checkout-field__req">*</span>
              </span>
              <input
                value={value[key]}
                onChange={(e) => onChange({ [key]: e.target.value })}
                type={type ?? "text"}
                autoComplete={autoComplete}
                required
                aria-invalid={invalid}
                aria-describedby={invalid ? `${key}-error` : undefined}
                className="lncos-form-control lncos-form-control--field"
                placeholder={label}
              />
              {invalid ? (
                <span id={`${key}-error`} className="checkout-field__error">
                  {errors[key]}
                </span>
              ) : null}
            </label>
          </div>
        );
      })}
    </div>
  );
}
