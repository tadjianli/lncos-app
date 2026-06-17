export interface CheckoutAddress {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  zip: string;
  city: string;
  phone: string;
}

export const EMPTY_CHECKOUT_ADDRESS: CheckoutAddress = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  zip: "",
  city: "",
  phone: "",
};

export type CheckoutAddressFieldKey = keyof CheckoutAddress;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCheckoutAddress(
  addr: CheckoutAddress,
): Partial<Record<CheckoutAddressFieldKey, string>> {
  const errors: Partial<Record<CheckoutAddressFieldKey, string>> = {};
  const email = addr.email.trim();
  if (!email) errors.email = "L'email est requis";
  else if (!EMAIL_RE.test(email)) errors.email = "Adresse email invalide";
  if (!addr.firstName.trim()) errors.firstName = "Le prénom est requis";
  if (!addr.lastName.trim()) errors.lastName = "Le nom est requis";
  if (!addr.address.trim()) errors.address = "L'adresse est requise";
  if (!addr.zip.trim()) errors.zip = "Le code postal est requis";
  if (!addr.city.trim()) errors.city = "La ville est requise";
  if (!addr.phone.trim()) errors.phone = "Le téléphone est requis";
  return errors;
}

export function validateCheckoutAccountPasswords(
  password: string,
  confirm: string,
): { password?: string; confirm?: string } {
  const errors: { password?: string; confirm?: string } = {};
  if (password.length < 6) errors.password = "Au moins 6 caractères";
  if (password !== confirm) errors.confirm = "Les mots de passe ne correspondent pas";
  return errors;
}

/** Champs adresse sans email — compatible API Stripe / fulfillment. */
export function toShippingAddressPayload(addr: CheckoutAddress) {
  return {
    firstName: addr.firstName.trim(),
    lastName: addr.lastName.trim(),
    address: addr.address.trim(),
    zip: addr.zip.trim(),
    city: addr.city.trim(),
    phone: addr.phone.trim(),
  };
}
