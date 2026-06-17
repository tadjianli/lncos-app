"use client";

interface CheckoutAccountOfferProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  showErrors: boolean;
  passwordError?: string;
  confirmError?: string;
}

export function CheckoutAccountOffer({
  checked,
  onCheckedChange,
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmChange,
  showErrors,
  passwordError,
  confirmError,
}: CheckoutAccountOfferProps) {
  return (
    <div className="checkout-account-offer">
      <label className="checkout-account-offer__label">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="checkout-account-offer__checkbox"
        />
        <span>
          Créer mon compte LN COS pour suivre mes commandes, retrouver mon historique d&apos;achat et
          bénéficier d&apos;offres exclusives.
        </span>
      </label>

      {checked ? (
        <div className="checkout-account-offer__passwords">
          <label className="checkout-field">
            <span className="checkout-field__label">
              Mot de passe <span className="checkout-field__req">*</span>
            </span>
            <input
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="lncos-form-control lncos-form-control--field"
              placeholder="Au moins 6 caractères"
              aria-invalid={showErrors && !!passwordError}
            />
            {showErrors && passwordError ? (
              <span className="checkout-field__error">{passwordError}</span>
            ) : null}
          </label>

          <label className="checkout-field">
            <span className="checkout-field__label">
              Confirmer le mot de passe <span className="checkout-field__req">*</span>
            </span>
            <input
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={confirmPassword}
              onChange={(e) => onConfirmChange(e.target.value)}
              className="lncos-form-control lncos-form-control--field"
              placeholder="Répétez le mot de passe"
              aria-invalid={showErrors && !!confirmError}
            />
            {showErrors && confirmError ? (
              <span className="checkout-field__error">{confirmError}</span>
            ) : null}
          </label>
        </div>
      ) : null}

      <p className="checkout-account-offer__hint">
        Vos informations de commande vous seront envoyées par email, même sans création de compte.
      </p>
    </div>
  );
}
